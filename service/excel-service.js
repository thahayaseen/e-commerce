const excel = require("exceljs")
const {
  formatCurrency,
  formatCurrency2,
  formatDate,
  formatCustomer,
  formatProducts,
  formatCoupon,
  calculateStats,
} = require("../utils/formatters")

const createExcelWorkbook = async (data, res) => {
  const workbook = new excel.Workbook()
  const worksheet = workbook.addWorksheet("Sales Report")

  // Add title
  worksheet.mergeCells("A1:G1")
  worksheet.getCell("A1").value = "Completed Sales Report"
  worksheet.getCell("A1").font = { size: 16, bold: true }
  worksheet.getCell("A1").alignment = { horizontal: "center" }

  // Add generation date
  worksheet.mergeCells("A2:G2")
  worksheet.getCell("A2").value = `Generated on ${formatDate(new Date())}`
  worksheet.getCell("A2").alignment = { horizontal: "center" }

  // Add statistics
  const stats = calculateStats(data)

  worksheet.mergeCells("A4:C4")
  worksheet.getCell("A4").value = "Summary Statistics"
  worksheet.getCell("A4").font = { bold: true }

  const statsRows = [
    ["Total Completed Orders:", stats.totalOrders],
    ["Total Revenue:", formatCurrency(stats.totalRevenue)],
    ["Average Order Value:", formatCurrency(stats.averageOrderValue)],
  ]

  statsRows.forEach((row, index) => {
    worksheet.getCell(`A${5 + index}`).value = row[0]
    worksheet.getCell(`B${5 + index}`).value = row[1]
  })

  // Add table headers
  const headers = ["Order ID", "Customer Details", "Products", "Coupon", "Amount", "Date"]
  const startRow = 9

  headers.forEach((header, index) => {
    const cell = worksheet.getCell(startRow, index + 1)
    cell.value = header
    cell.font = { bold: true }
    cell.alignment = { horizontal: "center" }
  })

  // Add order data
  data.forEach((order, index) => {
    const row = worksheet.getRow(startRow + index + 1)
    row.values = [
      order._id.toString(),
      formatCustomer(order.user),
      formatProducts(order.products),
      formatCoupon(order.coupon, order, order.products),
      formatCurrency2(order.totalAmount, order.coupon, order),
      formatDate(order.orderDate),
    ]
    row.alignment = { vertical: "middle", wrapText: true }
  })

  // Format columns
  worksheet.columns.forEach((column) => {
    let maxLength = 0
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10
      if (columnLength > maxLength) {
        maxLength = columnLength
      }
    })
    column.width = Math.min(maxLength + 2, 50)
  })

  // Add borders
  const tableEndRow = startRow + data.length
  ;["A", "B", "C", "D", "E", "F"].forEach((col) => {
    for (let row = startRow; row <= tableEndRow; row++) {
      worksheet.getCell(`${col}${row}`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      }
    }
  })

  // Set response headers
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  res.setHeader("Content-Disposition", "attachment; filename=completed_sales_report.xlsx")

  // Write to response
  await workbook.xlsx.write(res)
  res.end()
}

module.exports = { createExcelWorkbook }
