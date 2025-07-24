const { getOrdersData } = require("../../service/order-data-service")
const { createExcelWorkbook } = require("../../service/excel-service")
const { createPdfDocument } = require("../../service/pdf-service")
const { createInvoicePdf } = require("../../service/invoice-service")

const generateExcelReport = async (req, res) => {
  const data = await getOrdersData(req.query)
  await createExcelWorkbook(data, res)
}

const generatePdfReport = async (req, res) => {
  const data = await getOrdersData(req.query)
  await createPdfDocument(data, res)
}

const generateInvoice = async (req, res) => {
  await createInvoicePdf(req.params.orderid, res)
}

module.exports = { generateExcelReport, generatePdfReport, generateInvoice }
