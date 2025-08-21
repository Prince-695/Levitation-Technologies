const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class PDFService {
  
  // Generate PDF from invoice data
  static async generateInvoicePDF(invoiceData) {
    let browser;
    
    try {
      // Read HTML template
      const templatePath = path.join(__dirname, '../templates/invoiceTemplate.html');
      let htmlTemplate = await fs.readFile(templatePath, 'utf8');
      
      // Replace placeholders with actual data
      htmlTemplate = this.replacePlaceholders(htmlTemplate, invoiceData);
      
      // Launch puppeteer
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      });
      
      const page = await browser.newPage();
      
      // Set page content
      await page.setContent(htmlTemplate, {
        waitUntil: 'networkidle0'
      });
      
      // Generate PDF
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
      
      return pdfBuffer;
      
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF');
    } finally {
      if (browser) {
        await browser.close();
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
