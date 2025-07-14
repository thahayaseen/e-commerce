const formatCurrency = (amount, coupon) => {
  return `${Math.floor(amount - (coupon ? coupon.discount : 0))} Rs`
}

const formatCurrency2 = (amount, coupon, order) => {
  let toataldiscount = 0
  const offer = (coupon.discount * 100) / order.totalAmount

  order.products.forEach((a) => {
    if (a.status) {
      toataldiscount += ((a.price - a.discount) * offer) / 100
    }
  })

  const amounts = amount - order.refund - order.coupon.discount + order.shippingcharg
  return `${Math.floor(amounts || 0)} Rs`
}

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

const formatCustomer = (user) => {
  if (!user) return "N/A"
  const name = user.name || "N/A"
  const email = user.email || ""
  return email ? `${name} (${email})` : name
}

const formatProducts = (products) => {
  return products
    .map((p) => {
      const price = p.price
      const name = p.name.padEnd(10, " ")
      if (p.status) {
        return `${name} (${price}-${Math.floor(p.discount)})Rs × ${p.quantity.toString().padStart(3, " ")}`
      }
    })
    .join("\n")
}

const formatCoupon = (coupon, order, products) => {
  if (!coupon) return "0"

  let toataldiscount = 0
  const offer = (coupon.discount * 100) / order.totalAmount

  products.forEach((a) => {
    if (a.status) {
      toataldiscount += ((a.price - a.discount) * offer) / 100
    }
  })

  return `${coupon.couponcode ? coupon.couponcode : "No Coupon"}(-${coupon.couponcode ? toataldiscount : 0}Rs)`
}

const calculateStats = (data) => {
  return {
    totalOrders: data.length,
    totalRevenue: Math.floor(
      data.reduce(
        (sum, order) => sum + order.totalAmount + order.shippingcharg - order.coupon.discount - order.refund,
        0,
      ),
    ),
    averageOrderValue: Math.floor(
      data.length
        ? data.reduce(
            (sum, order) => sum + order.totalAmount + order.shippingcharg - order.coupon.discount - order.refund,
            0,
          ) / data.length
        : 0,
    ),
  }
}

module.exports = {
  formatCurrency,
  formatCurrency2,
  formatDate,
  formatCustomer,
  formatProducts,
  formatCoupon,
  calculateStats,
}
