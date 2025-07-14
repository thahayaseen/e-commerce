const PDFDocument = require("pdfkit")
const {
  formatCurrency,
  formatCurrency2,
  formatDate,
  formatCustomer,
  formatProducts,
  formatCoupon,
  calculateStats,
} = require("../utils/formatters")

const createPdfDocument = async (data, res) => {
  const doc = new PDFDocument({
    size: "A3",
    margin: 40,
    bufferPages: true,
    info: {
      Title: "Completed Sales Report",
      Author: "System Generated",
      CreationDate: new Date(),
    },
  })

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", 'attachment; filename="completed_sales_report.pdf"')
  doc.pipe(res)

  // Generate PDF Header
  const centerX = (doc.page.width - 80) / 3
  doc
    .font("Helvetica-Bold")
    .fontSize(30)
    .fillColor("#2c3e50")
    .text("Completed Sales Report", centerX, 40)
    .fontSize(20)
    .font("Helvetica")
    .fillColor("#7f8c8d")
    .text(`Generated on ${formatDate(new Date())}`, centerX + 30, doc.y)

  // Calculate Statistics
  const stats = calculateStats(data)

  // Render PDF stats
  const statsData = [
    ["Total Completed Orders", stats.totalOrders],
    ["Total Revenue", formatCurrency(stats.totalRevenue)],
    ["Average Order Value", formatCurrency(stats.averageOrderValue)],
  ]

  let currentY = doc.y + 40
  const boxWidth = (doc.page.width - 160) / 3

  statsData.forEach((stat, index) => {
    const xPos = 40 + index * (boxWidth + 30)
    doc
      .rect(xPos, currentY, boxWidth, 120)
      .fillAndStroke("#ffffff", "#3498db")
      .font("Helvetica-Bold")
      .fontSize(28)
      .fillColor("#2c3e50")
      .text(stat[1], xPos, currentY + 30, { width: boxWidth, align: "center" })
      .font("Helvetica")
      .fontSize(18)
      .fillColor("#7f8c8d")
      .text(stat[0], xPos, currentY + 70, { width: boxWidth, align: "center" })
  })

  currentY += 160

  // Order details
  doc.font("Helvetica-Bold").fontSize(24).fillColor("#2c3e50").text("Order Details", 40, currentY)

  currentY += 40

  const columns = [
    { header: "Order ID", width: 120, align: "left" },
    { header: "Customer Details", width: 150, align: "left" },
    { header: "Products", width: 200, align: "left" },
    { header: "Coupon", width: 100, align: "left" },
    { header: "Amount", width: 100, align: "right" },
    { header: "Date", width: 130, align: "center" },
  ]

  const renderTableHeader = () => {
    let xPos = 40
    columns.forEach((col) => {
      doc.font("Helvetica-Bold").fontSize(12).text(col.header, xPos, currentY, { width: col.width, align: col.align })
      xPos += col.width
    })
    currentY += 30
  }

  renderTableHeader()

  data.forEach((order) => {
    if (currentY > doc.page.height - 50) {
      doc.addPage()
      currentY = 40
      renderTableHeader()
    }

    let xPos = 40
    const rowData = [
      order._id,
      formatCustomer(order.user),
      formatProducts(order.products),
      formatCoupon(order.coupon, order, order.products),
      formatCurrency2(order.totalAmount, order.coupon, order),
      formatDate(order.orderDate),
    ]

    rowData.forEach((data, index) => {
      doc
        .font("Helvetica")
        .fontSize(8)
        .text(data, xPos, currentY, { width: columns[index].width, align: columns[index].align })
      xPos += columns[index].width
    })
    currentY += 40
  })

  doc.end()
}

module.exports = { createPdfDocument }
