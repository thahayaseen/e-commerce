const PDFDocument = require("pdfkit")
const orders = require("../model/orders")

const createInvoicePdf = async (orderid, res) => {
  const orderData = await orders.findOne({ orderid }).populate("products.productid")

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  })

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"')
  doc.pipe(res)

  // Logo and Shop Name
  doc.font("Helvetica-Bold").fontSize(18).fillColor("#2C3E50").text("Weeb's Corner", 20, 155, { align: "left" })

  doc.moveDown()

  // Invoice Header
  doc.font("Helvetica-Bold").fontSize(16).fillColor("#2C3E50").text("INVOICE", { align: "right" })
  doc.moveDown(1)

  // Order Details
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#34495E")
    .text(`Invoice Number: ${orderData.orderid}`, { align: "right" })
    .text(`Date: ${new Date(orderData.orderDate).toLocaleDateString()}`, { align: "right" })

  doc.moveDown(2)

  // Shipping Information
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#2980B9").text("Shipping Address:", { underline: true })
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("black")
    .text(`${orderData.shippingAddress.fullname}`)
    .text(`${orderData.shippingAddress.addressline1}`)
    .text(`${orderData.shippingAddress.addressline2}`)
    .text(`${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipcode}`)
    .text(`${orderData.shippingAddress.country}`)
    .text(`Phone: ${orderData.shippingAddress.phone}`)

  doc.moveDown(2)

  // Product Details
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#2980B9").text("Product Details:", { underline: true })

  const activeProducts = orderData.products.filter((product) => product.status !== false)
  doc.font("Helvetica").fontSize(10)

  activeProducts.forEach((product, index) => {
    const productDetails = product.productid
    doc
      .fillColor("black")
      .text(`${index + 1}. ${productDetails.name}`, { continued: true })
      .fillColor("#7F8C8D")
      .text(`  Qty: ${product.quantity}`, { continued: true })
      .fillColor("black")
      .text(`   Price: ${product.price} Rs`, { continued: false })
      .text(`   Discount: ${product.discount.toLocaleString()} Rs`)
      .moveDown(1)
  })

  const subtotal = activeProducts.reduce((acc, product) => {
    return acc + (product.price - product.discount) * product.quantity
  }, 0)

  function couponDiscount() {
    const coupon = (orderData.coupon.discount * 100) / orderData.totalAmount
    return (subtotal * coupon) / 100
  }

  // Payment Summary
  doc.moveDown(1)
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#2980B9").text("Payment Summary:", { underline: true })
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("black")
    .text(`Subtotal: ${subtotal.toFixed(2)} Rs`, { align: "right" })
    .text(`Shipping: ${orderData.shippingcharg.toFixed(2)} Rs`, { align: "right" })
    .text(`Coupon Discount: ${couponDiscount().toFixed(2)} Rs`, { align: "right" })
    .font("Helvetica-Bold")
    .text(
      `Total: ${(orderData.totalAmount + orderData.shippingcharg - orderData.refund - orderData.coupon.discount).toFixed(2)} Rs`,
      { align: "right" },
    )

  // Footer: Payment Method
  doc.moveDown()
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#34495E")
    .text(`Payment Method: ${orderData.paymentMethod}`, { align: "center" })

  doc.end()
}

module.exports = { createInvoicePdf }
