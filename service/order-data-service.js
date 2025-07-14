const orders = require("../model/orders")

const buildMatchQuery = ({ startDate, endDate, range }) => {
  if (startDate && endDate) {
    return {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }
  }

  if (range == 1) {
    const startOfToday = new Date()
    startOfToday.setUTCHours(0, 0, 0, 0)
    return {
      createdAt: { $gte: startOfToday },
      paymentStatus: { $in: ["Pending", "Paid"] },
    }
  }

  return {
    createdAt: {
      $gte: new Date(new Date().setDate(new Date().getDate() - Number.parseInt(range))),
    },
  }
}

const getOrdersData = async (queryParams) => {
  const matchQuery = buildMatchQuery(queryParams)

  return await orders.aggregate([
    {
      $match: { status: { $in: ["Processing", "Shipped", "Delivered"] }, paymentStatus: { $in: ["Pending", "Paid"] } },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "products",
        localField: "products.productid",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $addFields: {
        products: {
          $map: {
            input: "$products",
            as: "product",
            in: {
              $mergeObjects: [
                "$$product",
                {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$productDetails",
                        as: "details",
                        cond: { $eq: ["$$details._id", "$$product.productid"] },
                      },
                    },
                    0,
                  ],
                },
              ],
            },
          },
        },
      },
    },
    { $project: { productDetails: 0 } },
    { $match: matchQuery },
    { $sort: { createdAt: -1 } },
  ])
}

module.exports = { getOrdersData }
