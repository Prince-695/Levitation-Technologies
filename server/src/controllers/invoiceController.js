const Invoice = require('../models/Invoice');
const PDFService = require('../services/pdfService');

// Helper function to send PDF response
const sendPDF = (res, pdfBuffer, invoiceNumber) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceNumber}.pdf`);
  res.setHeader('Content-Length', pdfBuffer.length);
  res.end(pdfBuffer);
};

// @desc    Generate PDF invoice
// @route   POST /api/invoices/generate-pdf
// @access  Private
const generatePDF = async (req, res) => {
  try {
    const { products, summary } = req.body;
    const user = req.user;
    
    // Calculate totals for each product
    products.forEach(product => {
      product.totalAmount = product.quantity * product.rate;
    });
    
    const calculatedTotals = PDFService.calculateTotals(products);
    const finalSummary = summary || calculatedTotals;
    
    const invoiceData = {
      invoiceNumber: PDFService.generateInvoiceNumber(),
      customerInfo: { name: user.fullName, email: user.email },
      products,
      totalCharges: finalSummary.totalCharges,
      gst: finalSummary.gst,
      finalAmount: finalSummary.finalAmount,
      invoiceDate: PDFService.formatDate()
    };
    
    const pdfBuffer = await PDFService.generateInvoicePDF(invoiceData);
    
    // Save invoice to database
    await Invoice.create({
      userId: user._id,
      ...invoiceData
    });
    
    sendPDF(res, pdfBuffer, invoiceData.invoiceNumber);
    
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during PDF generation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get invoice history
// @route   GET /api/invoices/history
// @access  Private
const getInvoiceHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [invoices, total] = await Promise.all([
      Invoice.find({ userId: req.user._id })
        .select('invoiceNumber customerInfo totalCharges gst finalAmount invoiceDate createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments({ userId: req.user._id })
    ]);
    
    res.status(200).json({
      success: true,
      invoices,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalInvoices: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get invoice history error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching invoice history' });
  }
};

// @desc    Get specific invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    res.status(200).json({ success: true, invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching invoice' });
  }
};

// @desc    Re-download existing invoice
// @route   GET /api/invoices/:id/download
// @access  Private
const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      customerInfo: invoice.customerInfo,
      products: invoice.products,
      totalCharges: invoice.totalCharges,
      gst: invoice.gst,
      finalAmount: invoice.finalAmount,
      invoiceDate: invoice.invoiceDate
    };
    
    const pdfBuffer = await PDFService.generateInvoicePDF(invoiceData);
    sendPDF(res, pdfBuffer, invoice.invoiceNumber);
    
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({ success: false, message: 'Server error during invoice download' });
  }
};

module.exports = { generatePDF, getInvoiceHistory, getInvoice, downloadInvoice };
