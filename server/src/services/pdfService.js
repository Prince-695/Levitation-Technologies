const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

class PDFService {
  
  // Generate PDF from invoice data with retry logic
  static async generateInvoicePDF(invoiceData, retryCount = 0) {
    let browser;
    const maxRetries = 2;
    
    try {
      console.log('PDFService: Starting PDF generation...');
      
      // Read HTML template
      const templatePath = path.join(__dirname, '../templates/invoiceTemplate.html');
      console.log('PDFService: Reading template from:', templatePath);
      
      let htmlTemplate = await fs.readFile(templatePath, 'utf8');
      console.log('PDFService: Template read successfully, length:', htmlTemplate.length);
      
      // Replace placeholders with actual data
      console.log('PDFService: Replacing placeholders...');
      htmlTemplate = this.replacePlaceholders(htmlTemplate, invoiceData);
      console.log('PDFService: Placeholders replaced successfully');
      
      // Launch puppeteer
      console.log('PDFService: Launching Puppeteer...');
      const puppeteerConfig = {
        headless: 'new',
        timeout: 30000,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
        ]
      };

      // For production environments, try to use the installed Chrome
      if (process.env.NODE_ENV === 'production') {
        // Check if Puppeteer executable path is set via environment
        if (process.env.PUPPETEER_EXECUTABLE_PATH) {
          puppeteerConfig.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
          console.log('PDFService: Using Chrome from PUPPETEER_EXECUTABLE_PATH:', process.env.PUPPETEER_EXECUTABLE_PATH);
        } else {
          // Try different Chrome executable paths for different hosting services
          const possibleChromePaths = [
            '/opt/render/.cache/puppeteer/chrome/linux-121.0.6167.85/chrome-linux64/chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
            process.env.CHROME_BIN,
            process.env.GOOGLE_CHROME_BIN
          ];
          
          for (const chromePath of possibleChromePaths) {
            if (chromePath) {
              try {
                if (fsSync.existsSync(chromePath)) {
                  puppeteerConfig.executablePath = chromePath;
                  console.log('PDFService: Using Chrome at:', chromePath);
                  break;
                }
              } catch (err) {
                console.log('PDFService: Chrome path check failed for:', chromePath);
              }
            }
          }
          
          // If no system Chrome found, don't set executablePath 
          // Let Puppeteer use its own bundled Chrome from the cache
          if (!puppeteerConfig.executablePath) {
            console.log('PDFService: No system Chrome found, using Puppeteer bundled Chrome');
          }
        }
      }

      console.log('PDFService: Puppeteer config:', puppeteerConfig);
      
      browser = await puppeteer.launch({
        headless: true,
        executablePath: puppeteerConfig.executablePath,
      });
      console.log('PDFService: Browser launched successfully');
      
      const page = await browser.newPage();
      console.log('PDFService: New page created');
      
      // Set page content
      console.log('PDFService: Setting page content...');
      await page.setContent(htmlTemplate, {
        waitUntil: 'networkidle0'
      });
      console.log('PDFService: Page content set successfully');
      
      // Generate PDF
      console.log('PDFService: Generating PDF...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          bottom: '20px',
          left: '20px',
          right: '20px'
        }
      });
      console.log('PDFService: PDF generated successfully, buffer size:', pdfBuffer.length);
      
      return pdfBuffer;
      
    } catch (error) {
      console.error('PDFService: PDF generation error occurred');
      console.error('PDFService: Error name:', error.name);
      console.error('PDFService: Error message:', error.message);
      console.error('PDFService: Error stack:', error.stack);
      console.error('PDFService: Error code:', error.code);
      
      // Provide more specific error messages
      if (error.message.includes('Failed to launch')) {
        console.error('PDFService: Browser launch failed');
        throw new Error('Failed to launch browser for PDF generation. Chrome may not be installed properly.');
      } else if (error.message.includes('Navigation timeout')) {
        console.error('PDFService: Navigation timeout occurred');
        throw new Error('PDF generation timed out. Template may be too complex.');
      } else if (error.message.includes('Protocol error')) {
        console.error('PDFService: Browser protocol error');
        throw new Error('Browser communication error during PDF generation.');
      } else if (error.code === 'ENOENT') {
        console.error('PDFService: File not found error');
        throw new Error('Template file not found or inaccessible.');
      } else {
        console.error('PDFService: Unknown error occurred');
        throw new Error(`PDF generation failed: ${error.message}`);
      }
    } finally {
      if (browser) {
        console.log('PDFService: Closing browser...');
        await browser.close();
        console.log('PDFService: Browser closed successfully');
      }
    }
  }
  
  // Replace template placeholders with actual data
  static replacePlaceholders(template, data) {
    let html = template;
    
    // Replace basic placeholders
    html = html.replace(/{{invoiceNumber}}/g, data.invoiceNumber);
    html = html.replace(/{{customerName}}/g, data.customerInfo.name);
    html = html.replace(/{{customerEmail}}/g, data.customerInfo.email);
    html = html.replace(/{{invoiceDate}}/g, data.invoiceDate);
    html = html.replace(/{{totalCharges}}/g, data.totalCharges.toFixed(2));
    html = html.replace(/{{gst}}/g, data.gst.toFixed(2));
    html = html.replace(/{{finalAmount}}/g, data.finalAmount.toFixed(2));
    html = html.replace(/{{currentDate}}/g, new Date().toLocaleDateString('en-GB'));
    
    // Replace products loop
    const productsHtml = data.products.map(product => `
      <tr>
        <td>${product.name}</td>
        <td class="text-center">${product.quantity}</td>
        <td class="text-right">₹${product.rate.toFixed(2)}</td>
        <td class="text-right">₹${product.totalAmount.toFixed(2)}</td>
      </tr>
    `).join('');
    
    html = html.replace(/{{#each products}}[\s\S]*?{{\/each}}/g, productsHtml);
    
    return html;
  }
  
  // Calculate totals from products
  static calculateTotals(products) {
    const totalCharges = products.reduce((sum, product) => sum + product.totalAmount, 0);
    const gst = totalCharges * 0.18; // 18% GST
    const finalAmount = totalCharges + gst;
    
    return {
      totalCharges,
      gst,
      finalAmount
    };
  }
  
  // Generate invoice number
  static generateInvoiceNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `INV-${timestamp}-${random}`;
  }
  
  // Format date in DD/MM/YY format
  static formatDate(date = new Date()) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  }
}

module.exports = PDFService;
