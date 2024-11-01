const PDFDocument = require('pdfkit');


function generateInvoice(orderData) {
  // Create a new PDF document
  const doc = new PDFDocument({ 
    size: 'A4',
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    }
  });

  // Create write stream
  const outputPath = `invoice_${orderData.orderid}.pdf`;
  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Set up fonts and styles
  doc.font('Helvetica-Bold').fontSize(16);

  // Invoice Header
  doc.fillColor('#2C3E50')
     .text('INVOICE', { align: 'right' });

  doc.moveDown();

  // Order Details
  doc.font('Helvetica-Bold').fontSize(10)
     .fillColor('#34495E')
     .text(`Invoice Number: ${orderData.orderid}`, { align: 'right' })
     .text(`Date: ${new Date(orderData.orderDate).toLocaleDateString()}`, { align: 'right' });

  doc.moveDown(2);

  // Shipping Information
  doc.font('Helvetica-Bold').fontSize(12)
     .fillColor('#2980B9')
     .text('Shipping Address:', { underline: true });

  doc.font('Helvetica').fontSize(10)
     .fillColor('black')
     .text(`${orderData.shippingAddress.fullname}`)
     .text(`${orderData.shippingAddress.addressline1}`)
     .text(`${orderData.shippingAddress.addressline2}`)
     .text(`${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipcode}`)
     .text(`${orderData.shippingAddress.country}`)
     .text(`Phone: ${orderData.shippingAddress.phone}`);

  doc.moveDown(2);

  // Product Details (Only non-canceled products)
  doc.font('Helvetica-Bold').fontSize(12)
     .fillColor('#2980B9')
     .text('Product Details:', { underline: true });

  // Filter out canceled products
  const activeProduts = orderData.products.filter(product => product.status !== false);

  doc.font('Helvetica').fontSize(10);
  activeProduts.forEach((product, index) => {
    const productDetails = product.productid;
    
    doc.fillColor('black')
       .text(`${index + 1}. ${productDetails.name}`, { continued: true })
       .fillColor('#7F8C8D')
       .text(`  Qty: ${product.quantity}`, { continued: true })
       .fillColor('black')
       .text(`  Price: ₹${product.price.toLocaleString()}`)
       .text(`   Discount: ₹${product.discount.toLocaleString()}`)
       .moveDown(0.5);
  });

  // Total Amount Calculations
  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(12)
     .fillColor('#2980B9')
     .text('Payment Summary:', { underline: true });

  doc.font('Helvetica').fontSize(10)
     .fillColor('black')
     .text(`Subtotal: ₹${orderData.totalAmount.toLocaleString()}`, { align: 'right' })
     .text(`Coupon Discount: ₹${orderData.coupon.discount.toLocaleString()}`, { align: 'right' })
     .text(`Refund Amount: ₹${orderData.refund.toLocaleString()}`, { align: 'right' })
     .font('Helvetica-Bold')
     .text(`Total: ₹${(orderData.totalAmount - orderData.coupon.discount).toLocaleString()}`, { align: 'right' });

  // Payment Method
  doc.moveDown();
  doc.font('Helvetica').fontSize(10)
     .fillColor('#34495E')
     .text(`Payment Method: ${orderData.paymentMethod}`, { align: 'center' });

  // Finalize PDF
  doc.end();

  return outputPath;
}

// Usage example
function createInvoice(orderdata) {
  try {
    const invoicePath = generateInvoice(orderdata);
    console.log(`Invoice generated at: ${invoicePath}`);
  } catch (error) {
    console.error('Error generating invoice:', error);
  }
}

module.exports = { createInvoice };