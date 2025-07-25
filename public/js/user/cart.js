const addbtn = document.querySelectorAll('.plusbtn');
const minusbtn = document.querySelectorAll('.minusbtn');
const quantities = document.querySelectorAll('.quantityid');
const deletebtn = document.querySelectorAll('.deletebtn');
const toatalprice = document.querySelectorAll('.productprice');
const summerytoatal = document.querySelector('.summerytoatal');
const toatals = document.querySelector('.toatals');

quantities.forEach((quantity, index) => {
    let number = parseInt(quantity.dataset.quntity);
    let id = quantity.dataset.productid;
    let isLoading = false; // Flag to throttle

    const updateDisplay = () => {
        quantity.textContent = number;
    };

    const checkAndUpdateQuantity = (increase) => {
        if (isLoading) return; // Throttle: don't allow if a request is in progress
        isLoading = true;

        // Disable buttons during request
        addbtn[index].disabled = true;
        minusbtn[index].disabled = true;

        fetch(`/cart/update/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ index, number: increase ? number + 1 : number }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (increase) number++;
                else number--;
                
                toatalprice[index].textContent = Math.floor(data.totalprice);
                summerytoatal.textContent = data.sumtoatal.toFixed();
                toatals.textContent = data.sumtoatal.toFixed();
                quantity.textContent = number;
            } else {
                if (data.unlist) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Product Unavailable',
                        text: data.message || 'This product is no longer available.',
                        confirmButtonText: 'Refresh Page'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.reload();
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Unable to Update',
                        text: data.message || 'This is the maximum quantity that you can take.'
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error updating quantity:', error);
            Swal.fire({
                icon: 'error',
                title: 'Connection Error',
                text: 'An error occurred while updating the quantity. Please try again.'
            });
        })
        .finally(() => {
            // Always re-enable buttons and reset loading state
            isLoading = false;
            addbtn[index].disabled = false;
            minusbtn[index].disabled = false;
        });
    };

    const plusButton = addbtn[index];
    const minusButton = minusbtn[index];

    minusButton.addEventListener('click', () => {
        if (number > 1) {
            checkAndUpdateQuantity(false);
        }
    });

    plusButton.addEventListener('click', () => {
        if (number < 5) {
            checkAndUpdateQuantity(true);
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Maximum Quantity Reached',
                text: 'You have reached the maximum quantity for this item.'
            });
        }
    });

    updateDisplay();
});


// Optional: Add a function to handle unlisted products by hiding them
function handleUnlistedProducts() {
    const productRows = document.querySelectorAll('[data-product-row]');

    productRows.forEach((row, index) => {
        const productId = quantities[index]?.dataset.productid;

        if (productId) {
            // You can add logic here to check if product is unlisted
            // and hide the row if needed
            fetch(`/product/check/${productId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.unlist) {
                        row.style.opacity = '0.5';
                        row.querySelector('.card-title').innerHTML += ' <span class="badge bg-danger">Unavailable</span>';

                        // Disable quantity controls
                        const plusBtn = row.querySelector('.plusbtn');
                        const minusBtn = row.querySelector('.minusbtn');
                        if (plusBtn) plusBtn.disabled = true;
                        if (minusBtn) minusBtn.disabled = true;
                    }
                })
                .catch(error => {
                    console.error('Error checking product status:', error);
                });
        }
    });
}

// Call this function when page loads if you want to check product status
// handleUnlistedProducts();