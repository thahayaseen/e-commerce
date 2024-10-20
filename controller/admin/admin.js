const User = require('../../model/user_scema')
const Product = require('../../model/product_schema');
const bcrypt = require('bcrypt')
const path = require('path');
const fs = require('fs');
const categories = require('../../model/categories');
const orders = require('../../model/orders')
const coupons = require('../../model/coupon')
const excel = require('exceljs')
// admin authentication 
const auth = async (req, res, next) => {
    try {
        const { username, password } = req.body


        const exsist = await User.findOne({ name: username })


        if (!exsist) {
            return res.redirect('/admin')
        }
        const adminverigfy = await bcrypt.compare(password, exsist.password)
        console.log(adminverigfy);

        if (!adminverigfy) {
            return res.redirect('/admin')
        }

        if (!exsist.isadmin) {
            return res.redirect('/admin')
        }
        if (exsist.isadmin === true) {
            req.session.ladmin = true
            return res.redirect('/admin/dashbord')

        }





    } catch (error) {
        console.log(error);

    }


}


// admin side user block and unblock 
const accses = async (req, res, next) => {
    try {
        const user_id = req.params.id
        console.log(user_id + 'userid');

        const detials = await User.findById(user_id)
        if (!detials) {
            return res.status(404).json({ message: 'user not found' })
        }
        detials.blocked = !detials.blocked
        await detials.save()

        res.status(200).json({
            success: true,
            udata: detials.blocked,
            message: 'user status updated successfully'
        })

    }
    catch (error) {
        console.log(error);

    }
}



const list = async (req, res, next) => {
    try {
        const id = req.params.id;

        // Find the product by ID
        const product = await Product.findById(id);

        // Check if the product exists
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.unlist = !product.unlist;

        // Save the updated product list
        await product.save();

        // Return success response with the updated status
        return res.status(200).json({
            success: true,
            newStatus: product.unlist,
            message: `Product ${product.unlist ? 'listed' : 'unlisted'} successfully.`,
        });
    } catch (error) {
        console.error('Error updating product status:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
};
//add product
const padd = async (req, res, next) => {
    const { newProductName, newProductCategory, newProductDescription, newProductPrice, newProductStock, newProductOffer } = req.body
    const fiels = req.files
    console.log(fiels);
    let image = []
    fiels.forEach(num => {
        image.push(num.filename)
    })
    console.log(image);
    console.log(newProductCategory);

    const newProduct = new Product({
        name: newProductName,
        category_id: newProductCategory,
        description: newProductDescription,
        price: newProductPrice,
        stock: newProductStock,
        offer: newProductOffer,
        images: image

    });
    image = []
    await newProduct.save()

    res.status(200).json({ success: true })

}
const submitedit = async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    const { productName, productCategory, productDescription, productStock, productPrice, productOffer } = req.body;

    if (productName && productCategory && productDescription && productStock && productPrice) {
        product.name = productName;
        product.category_id = productCategory;
        product.description = productDescription;
        product.stock = productStock;
        product.price = productPrice;
        product.offer = productOffer;
        product.save()
        return res.status(200).json({ success: true })
    }

}

const imageadding = async function updateProduct(req, res) {
    const productId = req.params.id;

    try {
        const files = req.files; // Get uploaded files (new images)
        const croppedImages = req.body.croppedImages ? JSON.parse(req.body.croppedImages) : [];
        const deletedImages = req.body.deletedImages ? JSON.parse(req.body.deletedImages) : [];


        const product = await Product.findById(productId);


        if (files && files.length > 0) {
            files.forEach(file => {
                if (!product.images.includes(file.filename)) {
                    product.images.push(file.filename);
                }
            });
        }


        if (croppedImages.length > 0) {
            for (const croppedImage of croppedImages) {
                const { base64, name } = croppedImage;

                const buffer = Buffer.from(base64, 'base64');

                const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads', name);

                await sharp(buffer)
                    .resize(200, 200)
                    .toFile(uploadPath);

                // Add the cropped image to the product's images array
                product.images.push(name);
            }
        }
        // Remove deleted images from the product's image array
        if (deletedImages.length > 0) {
            product.images = product.images.filter(image => !deletedImages.includes(image));

            // Delete the images from the server's file system
            deletedImages.forEach(image => {
                const imagePath = path.join(__dirname, '..', '..', 'public', 'uploads', image);
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error(`Failed to delete image file: ${imagePath}`);
                    }
                });
            });
        }

        // Save the updated product to the database
        await product.save();

        // Send a success response
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Failed to update product.' });
    }
}
// dave categories 
const savecat = async (req, res) => {
    try {
        const { newCategoryName, newProductDescription } = req.body
        const newcategories = new categories({
            name: newCategoryName,
            description: newProductDescription
        })
        await newcategories.save()
        // console.log(req.body);

        res.status(200).json({ success: true })
    } catch (error) {
        console.log('in save categosy rout' + error);

    }
}

const useredit = async (req, res, next) => {
    const { CategoryName, ProductDescription } = req.body

    const catid = req.params.id
    // console.log(catid);
    const category = await categories.findById(catid)

    category.name = CategoryName
    category.description = ProductDescription

    await category.save()

    res.status(200).json({ success: true })

}
const categoryunlist = async (req, res, next) => {

    try {

        const catid = req.params.id
        const product = await Product.find({ category_id: catid })
        // console.log(catid);
        for (data of product) {
            data.unlist = !data.unlist
            await data.save()
        }

        const catagory = await categories.findById(catid)
        catagory.list = !catagory.list
        // console.log(catagory);

        await catagory.save()


        res.status(200).json({ success: true })
    } catch (error) {
        console.log('error in unlist route' + error);

    }

}
const updateorder = async (req, res) => {
    const { action, orderId } = req.body
    const orderdata = await orders.findById(orderId)
    orderdata.status = action
    await orderdata.save()
    res.status(200).json({ success: true, message: 'the action changed success' })

}
const getiingorderdetials = async (req, res) => {

    const orderid = req.params.id
    const orderdata = await orders.findById(orderid).populate('user').populate('products.productid')
    console.log(JSON.stringify(orderdata));

    res.status(200).json({ success: true, data: orderdata })

}
const addcoupen = async (req, res) => {
    const bdata = req.body
    console.log(bdata);

    const add = new coupons(bdata)
    await add.save()
    res.status(201).json({ success: true })
}
const coupenedit = async (req, res) => {
    const id = req.params.id
    const cdata = await coupons.findById(id)
    if (cdata) {
        Object.assign(cdata, req.body)
        await cdata.save()
        res.status(201).json({ success: true })
    }
}
const deletecupen = async (req, res) => {
    const cid = req.params.id
    const dcoupen = await coupons.deleteOne({ _id: cid })
    await dcoupen.save()
    res.status(204).json({ success: true })
}
const PDFDocument = require('pdfkit');


// const exportpdf = async (req, res) => {
//     const count = req.params.number;
//     const data = await orders.find({})
//         .populate('user')
//         .populate('products.productid')
//         .sort({createdAt:-1})
//         .limit(count)

//     const doc = new PDFDocument({
//         size: 'A3',
//         margin: 40, 
//         bufferPages: true,
//         info: {
//             Title: 'Sales Report',
//             Author: 'System Generated',
//             CreationDate: new Date()
//         }
//     });

//     const pageWidth = doc.page.width - 80;
//     const pageHeight = doc.page.height - 80;
//     const marginLeft = 40;
//     const marginTop = 40;

//     const stream = fs.createWriteStream('sales_report.pdf');
//     doc.pipe(stream);

//     stream.on('error', (err) => {
//         console.error('Stream error:', err);
//         return res.status(500).json({ error: 'PDF generation failed' });
//     });

//     const formatCurrency = (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//     const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

//     const centerX = pageWidth / 2 + marginLeft;
//     doc.font('Helvetica-Bold')
//         .fontSize(40)
//         .fillColor('#2c3e50')
//         .text('Sales Report', centerX, marginTop, { align: 'center' })
//         .fontSize(20)
//         .font('Helvetica')
//         .fillColor('#7f8c8d')
//         .text(`Generated on ${formatDate(new Date())}`, centerX, doc.y + 10, { align: 'center' });

//     const stats = {
//         totalOrders: data.length,
//         totalRevenue: data.reduce((sum, order) => sum + order.totalAmount, 0),
//         pendingOrders: data.filter(order => order.status === 'Pending').length,
//         completedOrders: data.filter(order => order.status === 'Completed').length,
//         averageOrderValue: data.length ? data.reduce((sum, order) => sum + order.totalAmount, 0) / data.length : 0
//     };

//     const statsData = [
//         ['Total Orders', stats.totalOrders],
//         ['Total Revenue', formatCurrency(stats.totalRevenue)],
//         ['Pending Orders', stats.pendingOrders],
//         ['Completed Orders', stats.completedOrders],
//         ['Average Order Value', formatCurrency(stats.averageOrderValue)]
//     ];

//     const boxesPerRow = 3;
//     const boxWidth = (pageWidth - (boxesPerRow - 1) * 30) / boxesPerRow;
//     const boxHeight = 120;
//     const boxSpacing = 30;
//     let currentY = doc.y + 30;

//     statsData.forEach((stat, index) => {
//         const row = Math.floor(index / boxesPerRow);
//         const col = index % boxesPerRow;
//         const xPos = marginLeft + (col * (boxWidth + boxSpacing));
//         const yPos = currentY + (row * (boxHeight + boxSpacing));

//         doc.save().rect(xPos + 3, yPos + 3, boxWidth, boxHeight).fill('#e0e0e0').restore();
//         doc.rect(xPos, yPos, boxWidth, boxHeight).fillAndStroke('#ffffff', '#3498db');

//         const valueY = yPos + boxHeight * 0.3;
//         const labelY = yPos + boxHeight * 0.6;

//         doc.font('Helvetica-Bold')
//             .fontSize(28)
//             .fillColor('#2c3e50')
//             .text(stat[1].toString(), xPos, valueY, { width: boxWidth, align: 'center' })
//             .font('Helvetica')
//             .fontSize(18)
//             .fillColor('#7f8c8d')
//             .text(stat[0], xPos, labelY, { width: boxWidth, align: 'center' });
//     });

//     currentY += (Math.ceil(statsData.length / boxesPerRow) * (boxHeight + boxSpacing)) + 30;

//     doc.font('Helvetica-Bold').fontSize(24).fillColor('#2c3e50').text('Order Details', marginLeft, currentY);
//     currentY += 30;

//     const columns = [
//         { header: 'Order ID', width: pageWidth * 0.15 },
//         { header: 'Customer', width: pageWidth * 0.15 },
//         { header: 'Products', width: pageWidth * 0.20 },
//         { header: 'Amount', width: pageWidth * 0.10 },
//         { header: 'Payment', width: pageWidth * 0.15 },
//         { header: 'Status', width: pageWidth * 0.15 },
//         { header: 'Date', width: pageWidth * 0.16 }
//     ];

//     let xPosition = marginLeft;
//     doc.rect(marginLeft, currentY, pageWidth, 30).fill('#f5f6fa');

//     doc.font('Helvetica-Bold').fontSize(14).fillColor('#2c3e50');
//     columns.forEach(column => {
//         doc.text(column.header, xPosition + 0, currentY + 10, { width: column.width - 20, align: 'left' });
//         xPosition += column.width;
//     });

//     currentY += 50;

//     doc.font('Helvetica').fontSize(12).fillColor('#34495e');

//     data.forEach((order, rowIndex) => {
//         if (currentY > pageHeight - 60) {
//             doc.addPage();
//             currentY = marginTop;
//             xPosition = marginLeft;
//             doc.rect(marginLeft, currentY, pageWidth, 50).fill('#f5f6fa');
//             doc.font('Helvetica-Bold').fontSize(14).fillColor('#2c3e50');

//             columns.forEach(column => {
//                 doc.text(column.header, xPosition + 10, currentY + 12, { width: column.width - 20, align: 'left' });
//                 xPosition += column.width;
//             });

//             currentY += 30;
//             doc.font('Helvetica').fontSize(12).fillColor('#34495e');
//         }

//         if (rowIndex % 2 === 0) {
//             doc.rect(marginLeft, currentY, pageWidth, 30).fill('#f8f9fa');
//         }

//         xPosition = marginLeft;
//         const rowData = [
//             order._id + '...',
//             order.user?.name || 'N/A',
//             order.products.map(p => `${p.productid.name} (x${p.quantity})`).join(', '),
//             formatCurrency(order.totalAmount),
//             order.paymentMethod,
//             order.status,
//             formatDate(order.orderDate)
//         ];

//         columns.forEach((column, columnIndex) => {
//             let text = rowData[columnIndex];
//             if (columnIndex === 2) {
//                 text = text.length > 50 ? text.substring(0, 47) + '...' : text;
//             }

//             if (columnIndex === 5) {
//                 const statusColor = {
//                     'Pending': '#f1c40f',
//                     'Completed': '#2ecc71',
//                     'Cancelled': '#e74c3c'
//                 }[order.status] || '#7f8c8d';
//                 doc.fillColor(statusColor);
//             }

//             doc.text(text, xPosition + 10, currentY + 8, { width: column.width - 20, align: columnIndex === 3 ? 'right' : 'left' });

//             if (columnIndex === 5) {
//                 doc.fillColor('#34495e');
//             }

//             xPosition += column.width;
//         });

//         currentY += 30;
//     });

//     const pageCount = doc.bufferedPageRange().count;
//     for (let i = 0; i < pageCount; i++) {
//         doc.switchToPage(i);
//         doc.font('Helvetica').fontSize(10).fillColor('#95a5a6')
//             .text(`Page ${i + 1} of ${pageCount}`, marginLeft, pageHeight + 30, { align: 'center', width: pageWidth });
//     }

//     doc.end();

//     return new Promise((resolve, reject) => {
//         stream.on('finish', () => {
//             resolve(res.status(200).json({ message: 'PDF generated successfully', format: 'A3' }));
//         });
//     });
// };

const exportpdf = async (req, res) => {
    // const count = req.params.number;
    // const date = new Date()
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const count=req.query.range
    let matchQuery
    console.log(endDate);
    // console.log(range);

    
    
    if (startDate && endDate) {
        matchQuery ={ createdAt: {
            $gte: new Date(startDate),$lte: new Date(endDate)
        }};
    } else {

        matchQuery={createdAt : {
            $gte: new Date(new Date().setDate(new Date().getDate() - parseInt(count)))
        }};
    }
    // console.log(matchQuery)

    try {
        const data = await orders.aggregate([
            { $match: { status: 'Delivered' } },
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
            { $match: matchQuery }
        ])

        // console.log(data);
        console.log(JSON.stringify(data));

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

        // Helper functions
        const formatCurrency = (amount, coupon, datass) => {
            let amounts = 0

            return `${amount - (coupon ? coupon.discount : 0)} Rs`
        };
        const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const formatOrderId = (id) => id.length > 12 ? `${id.substring(0, 6)}...${id.slice(-4)}` : id;
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
                return `${name} (${price}-${(p.price * p.offer) / 100})Rs × ${p.quantity.toString().padStart(3, ' ')}`;
            }).join('\n');
        };
        const formatCoupon = (coupon) => {
            if (!coupon) return '0';
            // console.log(coupon.discount)
            return `${coupon.couponcode ? coupon.couponcode : 'No Coupon'}(-${coupon.couponcode ? coupon.discount : 0}Rs) `;
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
            totalRevenue: data.reduce((sum, order) => sum + order.totalAmount, 0),
            averageOrderValue: data.length ? data.reduce((sum, order) => sum + order.totalAmount, 0) / data.length : 0
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
                formatOrderId(order._id),
                formatCustomer(order.user),
                formatProducts(order.products),
                formatCoupon(order.coupon),
                formatCurrency(order.totalAmount, order.coupon, order), // Use the calculated discount
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
const exportexcel = async (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const count=req.query.range
    let matchQuery
    console.log(endDate);
    // console.log(range);

    
    
    if (startDate && endDate) {
        matchQuery ={ createdAt: {
            $gte: new Date(startDate),$lte: new Date(endDate)
        }};
    } else {

        matchQuery={createdAt : {
            $gte: new Date(new Date().setDate(new Date().getDate() - parseInt(count)))
        }};
    }
    try {
        const data = await orders.aggregate([
            { $match: { status: 'Delivered' } },
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
            { $match: matchQuery }
        ]);

        // Create a new workbook
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Helper functions
        const formatCurrency = (amount, coupon) => {


            return `${amount - (coupon ? coupon.discount : 0)} Rs`
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
                const price = p.price;
                return `${p.name} (${price}-${(p.price * p.offer) / 100})Rs × ${p.quantity}`;
            }).join(', ');
        };
        const formatCoupon = (coupon) => {
            if (!coupon) return '0';
            console.log(coupon.discount)
            return `${coupon.couponcode ? coupon.couponcode : 'No Coupon'}(-${coupon.couponcode ? coupon.discount : 0}Rs) `;
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
            totalRevenue: data.reduce((sum, order) => sum + order.totalAmount, 0),
            averageOrderValue: data.length ? data.reduce((sum, order) => sum + order.totalAmount, 0) / data.length : 0
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
                formatCoupon(order.coupon),
                order.totalAmount - order.coupon.discount,
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


const returnadmin=async(req,res)=>{
    const orderid=req.params.orderid
    const product=req.params.product
    const action=req.params.action
    const order=await orders.findById(orderid)
    const productindex=order.products.findIndex(a=>a.productid==product)
    console.log(productindex);
    
    console.log(JSON.stringify(order));
    console.log(orderid);
    console.log(action);
    console.log(product);
    if(action==='accept'){
        order.products[productindex].return='returning'
    }
    else if(action==='reject'){
        order.products[productindex].return='noreturn'
    }
    await order.save()
    // order.products.findIndex(a=>)

}





module.exports = { auth, accses, list, padd, imageadding, submitedit, savecat, useredit, categoryunlist, updateorder, getiingorderdetials, addcoupen, coupenedit, exportpdf, deletecupen, exportexcel,returnadmin }