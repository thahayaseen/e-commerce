
const orders = require('../../model/orders')

const excel = require('exceljs')

const exportexcel = async (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const count = req.query.range
    let matchQuery
    console.log(endDate);
    if (startDate && endDate) {
        matchQuery = {
            createdAt: {
                $gte: new Date(startDate), $lte: new Date(endDate)
            },

        };
    }
    else if (count == 1) {

        const startOfToday = new Date();
        startOfToday.setUTCHours(0, 0, 0, 0);

        matchQuery = {
            createdAt: {
                $gte: startOfToday
            },
            paymentStatus: { $in: ['Pending', 'Paid'] }
        };

    }
    else {

        matchQuery = {
            createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - parseInt(count)))
            }
        };
    }

    try {
        const data = await orders.aggregate([
            { $match: { status: { $in: ['Processing', 'Shipped', 'Delivered'] }, paymentStatus: { $in: ['Pending', 'Paid'] } } },

            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productid',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $addFields: {
                    products: {
                        $map: {
                            input: '$products',
                            as: 'product',
                            in: {
                                $mergeObjects: [
                                    '$$product',
                                    {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$productDetails',
                                                    as: 'details',
                                                    cond: { $eq: ['$$details._id', '$$product.productid'] }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            { $project: { productDetails: 0 } },
            { $match: matchQuery },
            { $sort: { createdAt: -1 } }
        ])

        // Create a new workbook
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Helper functions
        const formatCurrency = (amount, coupon, order) => {


            let amounts = 0

            return `${Math.floor(amount - (coupon ? coupon.discount : 0))} Rs`
        };
        const formatCurrency2 = (amount, coupon, order) => {
            console.log('order');
            console.log(order);

            let toataldiscount = 0
            const offer = ((coupon.discount * 100) / order.totalAmount)
            console.log(offer);
            order.products.forEach(a => {
                if (a.status) {
                    console.log('p price' + a.price);

                    toataldiscount += ((a.price - a.discount) * offer) / 100
                }
            })
            console.log('the is refund is ' + order.refund);
            console.log('the is disco is ' + toataldiscount);

            let amounts = (amount - order.refund - order.coupon.discount + order.shippingcharg)

            return `${Math.floor(amounts || 0)} Rs`
        };
        const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'

        });
        const formatCustomer = (user) => {
            if (!user) return 'N/A';
            const name = user.name || 'N/A';
            const email = user.email || '';
            return email ? `${name} (${email})` : name;
        };
        const formatProducts = (products) => {
            return products.map((p) => {
                const price = p.price
                const name = p.name.padEnd(10, ' ');
                discountprice = 0
                if (p.status) {
                    return `${name} (${price}-${Math.floor(p.discount)})Rs × ${p.quantity.toString().padStart(3, ' ')}`;
                }
                else {

                }
            }).join('\n');
        };
        const formatCoupon = (coupon, order, products) => {
            if (!coupon) return '0';

            // console.log(order);
            let toataldiscount = 0
            const offer = ((coupon.discount * 100) / order.totalAmount)

            products.forEach(a => {
                if (a.status) {
                    console.log('p price' + a.price);

                    toataldiscount += ((a.price - a.discount) * offer) / 100
                }
            })



            return `${coupon.couponcode ? coupon.couponcode : 'No Coupon'}(-${coupon.couponcode ? toataldiscount : 0}Rs) `;
        };

        // Add title
        worksheet.mergeCells('A1:G1');
        worksheet.getCell('A1').value = 'Completed Sales Report';
        worksheet.getCell('A1').font = {
            size: 16,
            bold: true
        };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        // Add generation date
        worksheet.mergeCells('A2:G2');
        worksheet.getCell('A2').value = `Generated on ${formatDate(new Date())}`;
        worksheet.getCell('A2').alignment = { horizontal: 'center' };

        // Add statistics
        const stats = {
            totalOrders: data.length,
            totalRevenue: Math.floor(data.reduce((sum, order) => sum + order.totalAmount + order.shippingcharg - order.coupon.discount - order.refund, 0)),
            averageOrderValue: Math.floor(data.length ? data.reduce((sum, order) => sum + order.totalAmount + order.shippingcharg - order.coupon.discount - order.refund, 0) / data.length : 0)
        };

        worksheet.mergeCells('A4:C4');
        worksheet.getCell('A4').value = 'Summary Statistics';
        worksheet.getCell('A4').font = { bold: true };

        const statsRows = [
            ['Total Completed Orders:', stats.totalOrders],
            ['Total Revenue:', formatCurrency(stats.totalRevenue)],
            ['Average Order Value:', formatCurrency(stats.averageOrderValue)]
        ];

        statsRows.forEach((row, index) => {
            worksheet.getCell(`A${5 + index}`).value = row[0];
            worksheet.getCell(`B${5 + index}`).value = row[1];
        });

        // Add table headers
        const headers = [
            'Order ID',
            'Customer Details',
            'Products',
            'Coupon',
            'Amount',
            'Date'

        ];

        const startRow = 9;
        headers.forEach((header, index) => {
            const cell = worksheet.getCell(startRow, index + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
        });

        // Add order data
        data.forEach((order, index) => {
            const row = worksheet.getRow(startRow + index + 1);
            row.values = [
                order._id.toString(),
                formatCustomer(order.user),
                formatProducts(order.products),
                formatCoupon(order.coupon, order, order.products),
                formatCurrency2(order.totalAmount, order.coupon, order),
                formatDate(order.orderDate)
            ];
            row.alignment = { vertical: 'middle', wrapText: true };
        });

        // Format columns
        worksheet.columns.forEach((column, index) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = Math.min(maxLength + 2, 50);
        });

        // Add borders to the table
        const tableEndRow = startRow + data.length;
        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
            for (let row = startRow; row <= tableEndRow; row++) {
                worksheet.getCell(`${col}${row}`).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }
        });

        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=completed_sales_report.xlsx'
        );

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error generating Excel sales report:', error);
        res.status(500).json({ error: 'Failed to generate Excel sales report' });
    }
};
const exportpdf = async (req, res) => {

    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const count = req.query.range
    let matchQuery
    if (startDate && endDate) {
        matchQuery = {
            createdAt: {
                $gte: new Date(startDate), $lte: new Date(endDate)
            },

        };
    }
    else if (count == 1) {

        const startOfToday = new Date();
        startOfToday.setUTCHours(0, 0, 0, 0);

        matchQuery = {
            createdAt: {
                $gte: startOfToday
            },
            paymentStatus: { $in: ['Pending', 'Paid'] }
        };

    }
    else {

        matchQuery = {
            createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - parseInt(count)))
            }
        };
    }
    try {
        const data = await orders.aggregate([
            { $match: { status: { $in: ['Processing', 'Shipped', 'Delivered'] }, paymentStatus: { $in: ['Pending', 'Paid'] } } },

            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productid',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $addFields: {
                    products: {
                        $map: {
                            input: '$products',
                            as: 'product',
                            in: {
                                $mergeObjects: [
                                    '$$product',
                                    {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$productDetails',
                                                    as: 'details',
                                                    cond: { $eq: ['$$details._id', '$$product.productid'] }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            { $project: { productDetails: 0 } },
            { $match: matchQuery },
            { $sort: { createdAt: -1 } }
        ])
        const doc = new PDFDocument({
            size: 'A3',
            margin: 40,
            bufferPages: true,
            info: {
                Title: 'Completed Sales Report',
                Author: 'System Generated',
                CreationDate: new Date()
            }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="completed_sales_report.pdf"');
        doc.pipe(res);
        const formatCurrency = (amount, coupon, order) => {
            let amounts = 0
            return `${Math.floor(amount - (coupon ? coupon.discount : 0))} Rs`
        };
        const formatCurrency2 = (amount, coupon, order) => {
            let toataldiscount = 0
            const offer = ((coupon.discount * 100) / order.totalAmount)
            console.log(offer);
            order.products.forEach(a => {
                if (a.status) {
                    console.log('p price' + a.price);

                    toataldiscount += ((a.price - a.discount) * offer) / 100
                }
            })
            let amounts = (amount - order.refund - order.coupon.discount + order.shippingcharg)
            return `${Math.floor(amounts || 0)} Rs`
        };
        const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const formatCustomer = (user) => {
            if (!user) return 'N/A';
            const name = user.name || 'N/A';
            const email = user.email || '';
            return email ? `${name}\n${email}` : name;
        };
        const formatProducts = (products) => {
            return products.map((p) => {
                const price = p.price
                const name = p.name.padEnd(10, ' ');
                discountprice = 0
                if (p.status) {
                    return `${name} (${price}-${Math.floor(p.discount)})Rs × ${p.quantity.toString().padStart(3, ' ')}`;
                }
                else {

                }
            }).join('\n');
        };
        const formatCoupon = (coupon, order, products) => {
            if (!coupon) return '0';
            let toataldiscount = 0
            const offer = ((coupon.discount * 100) / order.totalAmount)
            products.forEach(a => {
                if (a.status) {
                    console.log('p price' + a.price);

                    toataldiscount += ((a.price - a.discount) * offer) / 100
                }
            })
            return `${coupon.couponcode ? coupon.couponcode : 'No Coupon'}(-${coupon.couponcode ? toataldiscount : 0}Rs) `;
        };
        // Generate PDF Header
        const centerX = (doc.page.width - 80) / 3;
        doc.font('Helvetica-Bold')
            .fontSize(30)
            .fillColor('#2c3e50')
            .text('Completed Sales Report', centerX, 40)
            .fontSize(20)
            .font('Helvetica')
            .fillColor('#7f8c8d')
            .text(`Generated on ${formatDate(new Date())}`, centerX + 30, doc.y);
        // Calculate Statistics
        const stats = {
            totalOrders: data.length,
            totalRevenue: Math.floor(data.reduce((sum, order) => sum + order.totalAmount + order.shippingcharg - order.coupon.discount - order.refund, 0)),
            averageOrderValue: Math.floor(data.length ? data.reduce((sum, order) => sum + order.totalAmount + order.shippingcharg - order.coupon.discount - order.refund, 0) / data.length : 0)
        };
        // Render PDF stats
        const statsData = [
            ['Total Completed Orders', stats.totalOrders],
            ['Total Revenue', formatCurrency(stats.totalRevenue)],
            ['Average Order Value', formatCurrency(stats.averageOrderValue)]
        ];
        let currentY = doc.y + 40;
        const boxWidth = (doc.page.width - 160) / 3;
        statsData.forEach((stat, index) => {
            const xPos = 40 + (index * (boxWidth + 30));
            doc.rect(xPos, currentY, boxWidth, 120)
                .fillAndStroke('#ffffff', '#3498db')
                .font('Helvetica-Bold')
                .fontSize(28)
                .fillColor('#2c3e50')
                .text(stat[1], xPos, currentY + 30, { width: boxWidth, align: 'center' })
                .font('Helvetica')
                .fontSize(18)
                .fillColor('#7f8c8d')
                .text(stat[0], xPos, currentY + 70, { width: boxWidth, align: 'center' });
        });

        currentY += 160;
        // Order details
        doc.font('Helvetica-Bold')
            .fontSize(24)
            .fillColor('#2c3e50')
            .text('Order Details', 40, currentY);
        currentY += 40;

        const columns = [
            { header: 'Order ID', width: 120, align: 'left' },
            { header: 'Customer Details', width: 150, align: 'left' },
            { header: 'Products', width: 200, align: 'left' },
            { header: 'Coupon', width: 100, align: 'left' },
            { header: 'Amount', width: 100, align: 'right' },
            { header: 'Date', width: 130, align: 'center' }
        ];

        const renderTableHeader = () => {
            let xPos = 40;
            columns.forEach(col => {
                doc.font('Helvetica-Bold')
                    .fontSize(12)
                    .text(col.header, xPos, currentY, { width: col.width, align: col.align });
                xPos += col.width;
            });
            currentY += 30;
        };
        renderTableHeader();
        data.forEach((order, index) => {
            if (currentY > doc.page.height - 50) {
                doc.addPage();
                currentY = 40;
                renderTableHeader();
            }
            let xPos = 40;
            const rowData = [
                (order._id),
                formatCustomer(order.user),
                formatProducts(order.products),
                formatCoupon(order.coupon, order, order.products),
                formatCurrency2(order.totalAmount, order.coupon, order),
                formatDate(order.orderDate)
            ];
            rowData.forEach((data, index) => {
                doc.font('Helvetica')
                    .fontSize(8)
                    .text(data, xPos, currentY, { width: columns[index].width, align: columns[index].align });
                xPos += columns[index].width;
            });
            currentY += 40;
        });

        doc.end();
    } catch (error) {
        console.error('Error generating sales report:', error);
        res.status(500).json({ error: 'Failed to generate sales report' });
    }
};
const invoice = async (req,res) => {
    try {
        const orderid = req.params.orderid;
        const orderData = await orders.findOne({ orderid }).populate('products.productid');
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
        doc.pipe(res);
        const path = require('path');
        const paths = path.resolve(__dirname, '../../');
      // Logo and Shop Name
        doc.font('Helvetica-Bold')
        .fontSize(18)
        .fillColor('#2C3E50')
        .text("Weeb's Corner", 20, 155, { align: 'left' });
        doc.moveDown();
        // Invoice Header
        doc.font('Helvetica-Bold').fontSize(16).fillColor('#2C3E50').text('INVOICE', { align: 'right' });
        doc.moveDown(1);
        // Order Details
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#34495E')
            .text(`Invoice Number: ${orderData.orderid}`, { align: 'right' })
            .text(`Date: ${new Date(orderData.orderDate).toLocaleDateString()}`, { align: 'right' });
        doc.moveDown(2);
    
        // Shipping Information
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#2980B9').text('Shipping Address:', { underline: true });
        doc.font('Helvetica').fontSize(10).fillColor('black')
            .text(`${orderData.shippingAddress.fullname}`)
            .text(`${orderData.shippingAddress.addressline1}`)
            .text(`${orderData.shippingAddress.addressline2}`)
            .text(`${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipcode}`)
            .text(`${orderData.shippingAddress.country}`)
            .text(`Phone: ${orderData.shippingAddress.phone}`);
        doc.moveDown(2);
        // Product Details
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#2980B9').text('Product Details:', { underline: true });
        const activeProducts = orderData.products.filter(product => product.status !== false);
        doc.font('Helvetica').fontSize(10);
        activeProducts.forEach((product, index) => {
            const productDetails = product.productid;
            doc.fillColor('black')
                .text(`${index + 1}. ${productDetails.name}`, { continued: true })
                .fillColor('#7F8C8D')
                .text(`  Qty: ${product.quantity}`, { continued: true })
                .fillColor('black')
                .text(`   Price: ${product.price} Rs`, { continued: false })
                .text(`   Discount: ${product.discount.toLocaleString()} Rs`)
                .moveDown(1);
        });
    
        const subtotal = activeProducts.reduce((acc, product) => {
            return acc + (product.price - product.discount) * product.quantity;
        }, 0);
    
        function couponDiscount() {
            const coupon = (orderData.coupon.discount * 100) / orderData.totalAmount;
            return (subtotal * coupon) / 100;
        }
        // Payment Summary
        doc.moveDown(1);
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#2980B9').text('Payment Summary:', { underline: true });
    
        doc.font('Helvetica').fontSize(10).fillColor('black')
            .text(`Subtotal: ${subtotal.toFixed(2)} Rs`, { align: 'right' })
            .text(`Shipping: ${orderData.shippingcharg.toFixed(2)} Rs`, { align: 'right' })
            .text(`Coupon Discount: ${couponDiscount().toFixed(2)} Rs`, { align: 'right' })
            .font('Helvetica-Bold')
            .text(`Total: ${(orderData.totalAmount + orderData.shippingcharg - orderData.refund - orderData.coupon.discount).toFixed(2)} Rs`, { align: 'right' });
        // Footer: Payment Method
        doc.moveDown();
        doc.font('Helvetica').fontSize(10).fillColor('#34495E')
            .text(`Payment Method: ${orderData.paymentMethod}`, { align: 'center' });
    
        doc.end();
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Error generating PDF");
    }
   




}
module.exports = {  exportexcel ,invoice,exportpdf}
