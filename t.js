function populateOrderModal(order) {
    // ... (previous code for populating order summary and shipping address)

    let itemsHtml = '';
    let subtotal = 0;

    order.products.forEach((item, index) => {
        const { productid, quantity, price, return: returnStatus } = item;
        const { name, images, sku } = productid;
        
        subtotal += quantity * price;
        
        const productImage = `/uploads/${images[0]}`;
        const productTotal = (quantity * price).toFixed(2);
        
        const returnStatusHtml = returnStatus
            ? `
                <div class="mt-2">
                    <span class="badge badge-${getProductStatusBadgeClass(returnStatus)} mr-2">
                        ${returnStatus || 'Pending'}
                    </span>
                    <div class="btn-group btn-group-sm mt-2">
                        <button class="btn btn-sm btn-success product-action" 
                                data-order-id="${order._id}"
                                data-product-id="${productid._id}"
                                data-action="accept"
                                ${returnStatus === 'completed' ? 'disabled' : ''}>
                            <i class="mdi mdi-check"></i> Accept
                        </button>
                        <button class="btn btn-sm btn-danger product-action"
                                data-order-id="${order._id}"
                                data-product-id="${productid._id}"
                                data-action="reject"
                                ${returnStatus === 'rejected' ? 'disabled' : ''}>
                            <i class="mdi mdi-close"></i> Reject
                        </button>
                    </div>
                </div>
            `
            : '<div class="mt-2">No return request</div>';

        itemsHtml += `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-2">
                            <img src="${productImage}" alt="${name}" 
                                 class="img-fluid rounded" style="max-width: 100px; max-height: 100px; object-fit: cover;">
                        </div>
                        <div class="col-md-6">
                            <h5 class="card-title">${name}</h5>
                            <p class="card-text">
                                <small class="text-muted">SKU: ${sku || 'N/A'}</small><br>
                                Price: ₹${price} | Quantity: ${quantity}
                            </p>
                        </div>
                        <div class="col-md-4">
                            <h5 class="text-right">Total: ₹${productTotal}</h5>
                            ${returnStatusHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    document.getElementById('orderItems').innerHTML = itemsHtml;

    // Populate totals
    document.getElementById('orderSubtotal').textContent = subtotal.toFixed(2);
    document.getElementById('orderShipping').textContent = 'Free';
    document.getElementById('coupon').textContent = order.coupon ? `${order.coupon.couponcode} (-₹${order.coupon.discount})` : 'No coupon applied';
    document.getElementById('orderTotal').textContent = (subtotal - (order.coupon ? order.coupon.discount : 0)).toFixed(2);
}