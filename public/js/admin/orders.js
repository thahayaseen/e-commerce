
document.addEventListener('DOMContentLoaded', function () {
    // Handle action buttons
    const actionButtons = document.querySelectorAll('.actionbtn');
    actionButtons.forEach(btn => {
        btn.addEventListener('change', async (e) => {
            try {
                const action = btn.value;
                const orderId = btn.dataset.id;
                console.log(action);

                if (!orderId) {
                    throw new Error('Order ID is missing');
                }

                const response = await fetch('/admin/orders', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ action, orderId })
                });

                const data = await response.json();
                if (data.success) {
                    console.log(e.target.innerText);
                    // e.target.innerText=action
                    e.target.value = action
                    //   window.location.href = '/admin/orders';
                } else {
                    throw new Error(data.message || 'Failed to update order');
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: `Failed to process update: ${error.message}`,
                });

            }
        });
    });

    // Handle view order buttons
    document.querySelectorAll('.vieworder').forEach(button => {
        button.addEventListener('click', async (e) => {
            try {
                const orderId = button.dataset.id;

                if (!orderId) {
                    throw new Error('Order ID is missing');
                }

                const response = await fetch(`/admin/orderlist/${orderId}`);
                const data = await response.json();

                if (data.success) {
                    populateOrderModal(data.data);
                } else {
                    throw new Error(data.message || 'Failed to fetch order details');
                }
            } catch (error) {
                console.error('Error:', error);

                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: `Failed to fetch order details: ${error.message}`,
                });

            }
        });
    });

    function populateOrderModal(order) {
        try {
            if (!order) {
                throw new Error('No order data provided');
            }
            console.log(order);


            // Populate order summary
            const elements = {
                orderId: order.orderid,
                customerName: order.user.name,
                orderDate: new Date(order.createdAt).toLocaleDateString(),
                shippingAddress: formatAddress(order.shippingAddress)
            };

            // Update DOM elements with error checking
            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });

            // Update status with proper styling
            const statusElement = document.getElementById('orderStatus');
            if (statusElement) {
                statusElement.textContent = order.status;
                statusElement.className = `badge badge-pill badge-${getStatusBadgeClass(order.status)}`;
            }

            // Populate order items
            let itemsHtml = '';
            let subtotal = 0;
            let presentage = 0;

            if (!Array.isArray(order.products)) {
                throw new Error('Products data is invalid');
            }

            order.products.forEach((item, index) => {
                const { productid, status, quantity, price, discount, return: returnStatus } = item;
                if (!productid || !quantity || !price) {
                    console.warn('Incomplete product data:', item);
                    return;
                }
                const { name, images, sku } = productid;
                const notcanceled = order.products.filter(data => data.status == true).reduce((acc, data) => { return acc + (data.price - data.discount) * data.quantity }, 0)

                console.log(notcanceled);
                console.log();
                console.log(order.coupon.discount);
                presentage = (order.coupon.discount * 100) / (order.totalAmount)
                console.log('persentage' + presentage);

                // console.log(adnf);


                subtotal = notcanceled

                const productImage = images && images.length > 0 ? `${images[0]}` : '/placeholder-image.jpg';
                const productTotal = (quantity * (price - discount)).toFixed(2);

                let returnStatusHtml
                if (returnStatus) {
                    returnStatusHtml = ` <div class="mt-2">
                          <span class="badge badge-${getProductStatusBadgeClass(returnStatus)} mr-2 ">
                              ${returnStatus}
                          </span>
                          ${generateReturnButtons(returnStatus, order, productid, quantity)}
                      </div>
                  `}

                else {
                    returnStatusHtml = '<div class="mt-2">No return request</div>'
                };

                itemsHtml += generateProductCard(name, sku, price, quantity, productImage, productTotal, returnStatusHtml, status, notcanceled);
            });

            const orderItemsElement = document.getElementById('orderItems');
            if (orderItemsElement) {
                orderItemsElement.innerHTML = itemsHtml;
            }

            // Update totals
            updateOrderTotals(subtotal, order.coupon, order, presentage);

        } catch (error) {
            console.error('Error in populateOrderModal:', error);

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: `Failed to populate order details`,
                background: '#f8d7da',
                color: '#721c24',
                iconColor: '#721c24',
                customClass: {
                    popup: 'rounded-lg',
                },
            });
        }
    }

    function generateProductCard(name, sku, price, quantity, productImage, productTotal, returnStatusHtml, ostatus, notcanceled) {
        console.log(ostatus);

        if (!ostatus) {
            return `
        <div class="card mb-3 disabled-card">
            <div class="card-body">
                <div class="row">
                    <div class="col-2 p-0">
                        <img src="${productImage}" alt="${name}" 
                             class="img-fluid rounded" 
                             
                             onerror="this.src='/placeholder-image.jpg'">
                    </div>
                    <div class="col-md-6">
                        <h5 class="card-title">${name}</h5>
                        <p class="card-text">
                            <small class="text-muted">SKU: ${sku || 'N/A'}</small><br>
                            Price: ₹${price} | Quantity: ${quantity}
                        </p>
                    </div>
                    <div class="col-4 ">
                        <h5 class="text-right">Total: ₹${productTotal}</h5>
                        ${returnStatusHtml}
                    </div>
                   
                </div>
            </div>
        </div>
    `;
        }
        return `
          <div class="card mb-3">
              <div class="card-body">
                  <div class="row">
                      <div class="col-2 p-0">
                          <img src="${productImage}" alt="${name}" 
                               class="img-fluid rounded" 
                               
                               onerror="this.src='/placeholder-image.jpg'">
                      </div>
                      <div class="col-md-6">
                          <h5 class="card-title">${name}</h5>
                          <p class="card-text">
                              <small class="text-muted">SKU: ${sku || 'N/A'}</small><br>
                              Price: ₹${price} | Quantity: ${quantity}
                          </p>
                      </div>
                      <div class="col-4 ">
                          <h5 class="text-right">Total: ₹${productTotal}</h5>
                          ${returnStatusHtml}
                      </div>
                  </div>
              </div>
          </div>
      `;
    }

    function generateReturnButtons(returnStatus, order, productid, quantity) {
        if (returnStatus !== 'Return requsted') {
            return '<br> ';
        }

        return `
          <div class="btn-group btn-group-sm mt-2">
              <button class="btn btn-sm btn-success product-action" 
                      data-order-id="${order._id}"
                      data-product-id="${productid._id}"
                      data-action="accept">
                  <i class="mdi mdi-check"></i> Accept
              </button>
              <button class="btn btn-sm btn-danger product-action"
                      data-order-id="${order._id}"
                      data-product-id="${productid._id}"
                      data-action="reject">
                  <i class="mdi mdi-close"></i> Reject
              </button>
          </div>
      `;
    }

    function updateOrderTotals(subtotal, coupon, order, presentage) {
        const elements = {
            orderSubtotal: subtotal.toFixed(2),
            orderShipping: order.shippingcharg ? order.shippingcharg : 'Free',
            coupon: coupon.couponcode ? `${coupon.couponcode} (-₹${(subtotal * presentage) / 100})` : 'No coupon applied',
            orderTotal: (subtotal + order.shippingcharg - (coupon ? (subtotal * presentage) / 100 : 0)).toFixed(2)
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    // Handle product actions (Accept/Reject) with error handling
    document.addEventListener('click', async function (event) {
        if (event.target.classList.contains('product-action')) {
            try {
                const button = event.target;
                const orderId = button.dataset.orderId;
                const productId = button.dataset.productId;
                const action = button.dataset.action;
                console.log(orderId);


                if (!orderId || !productId || !action) {
                    throw new Error('Missing required data for product action');
                }

                button.disabled = true;

                fetch(`/admin/order/${orderId}/${productId}/${action}`, {
                    method: 'POST'
                })
                    .then(res => res.json())
                    .then(res => {
                        console.log(res.success);


                        if (res.success) {
                            window.location.reload(true)
                        }
                    })



            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: `Failed to process action: ${error.message}`,
                });


            } finally {
                event.target.disabled = false;
            }
        }
    });

    function getStatusBadgeClass(status) {
        const statusMap = {
            pending: 'warning',
            processing: 'info',
            shipped: 'primary',
            delivered: 'success',
            cancelled: 'danger'
        };
        return statusMap[status.toLowerCase()] || 'secondary';
    }

    function getProductStatusBadgeClass(status) {
        const statusMap = {
            returned: 'success',
            notrequst: 'danger',
            'Return requsted': 'warning'
        };
        console.log(` ${status == 'notrequst' ? 'suu' : ''} form here`);

        return `${statusMap[status] ? statusMap[status] : 'secondary'}  `
    }

    function formatAddress(address) {
        if (!address) {
            return 'Address not available';
        }

        const {
            addressline1 = '',
            addressline2 = '',
            city = '',
            state = '',
            zipcode = '',
            phone = '',
            country = ''
        } = address;

        return `
          ${addressline1} 
          ${addressline2}
          ${city}, ${state} ${zipcode} 
          ${phone} 
          ${country}
        ,
      `.trim();
    }
});