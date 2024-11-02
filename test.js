total = order.products
    .filter(data => data.status === true) // Filter products with status true
    .reduce((acc, data) => {
        return acc + (data.price - data.discount) * data.quantity; // Calculate total price
    }, 0);