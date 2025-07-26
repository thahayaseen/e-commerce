const addbtn = document.querySelectorAll('.plusbtn');
const minusbtn = document.querySelectorAll('.minusbtn');
const quantities = document.querySelectorAll('.quantityid');
const deletebtn = document.querySelectorAll('.deletebtn');
const toatalprice = document.querySelectorAll('.productprice');
const summerytoatal = document.querySelector('.summerytoatal');
const toatals = document.querySelector('.toatals');

quantities.forEach((quantity, index) => {
    let number = parseInt(quantity.dataset.quntity);
    let stock = parseInt(quantity.dataset.stock);
    let id = quantity.dataset.productid;
    let isLoading = false; // Flag to throttle

    const updateDisplay = () => {
        quantity.textContent = number;
    };

    const checkAndUpdateQuantity = (increase) => {
        if (isLoading) return; // Throttle: don't allow if a request is in progress
        isLoading = true;

        // Disable buttons during request (only disable functional buttons)
        const plusButton = addbtn[index];
        const minusButton = minusbtn[index];
        
        // Only disable buttons that are not already disabled
        if (!plusButton.disabled) plusButton.disabled = true;
        if (!minusButton.disabled) minusButton.disabled = true;

        fetch(`/cart/update/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ index, type: increase ? 'increment' : 'decrement' }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(data);
               
                if (increase) {
                    number++;
                } else {
                    number--;
                    // If quantity becomes 0, remove the item entirely
                    if (number === 0||stock==number) {
                        window.location.href = '/cart'; // Refresh to show updated cart
                        return;
                    }
                }
                
                console.log(Math.floor(data.totalprice));
                console.log(toatalprice,index);
                
                toatalprice[index].textContent = Math.floor(data.totalprice);
                summerytoatal.textContent = data.sumtotal.toFixed();
                toatals.textContent = data.sumtotal.toFixed();
                quantity.textContent = number;
                
                // Update the data attribute
                quantity.dataset.quntity = number;
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
                } else if (data.outOfStock) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Out of Stock',
                        text: data.message || 'This product is currently out of stock.',
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Unable to Update',
                        text: data.message || 'Unable to update quantity.'
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
            // Re-enable buttons based on their original state
            isLoading = false;
            
            // Check if buttons should be enabled based on product status
            const productRow = quantity.closest('.row');
            const isUnlisted = productRow.classList.contains('unlisted-product');
            const isOutOfStock = productRow.classList.contains('outofstock-product');
            
            // Always enable minus button (unless it was specifically disabled for other reasons)
            minusButton.disabled = false;
            
            // Only enable plus button if product is not unlisted or out of stock
            if (!isUnlisted && !isOutOfStock) {
                plusButton.disabled = false;
            }
            // If it's unlisted or out of stock, keep plus button disabled
        });
    };

    const plusButton = addbtn[index];
    const minusButton = minusbtn[index];

    // Check if this product is unlisted or out of stock
    const productRow = quantity.closest('.row');
    const isUnlisted = productRow.classList.contains('unlisted-product');
    const isOutOfStock = productRow.classList.contains('outofstock-product');

    minusButton.addEventListener('click', () => {
        // Allow minus button to work even for unlisted/out of stock items
        // But still check if quantity is greater than 0
        if (number > 0) {
            checkAndUpdateQuantity(false);
        }
    });

    plusButton.addEventListener('click', () => {
        // Don't allow plus button for unlisted or out of stock items
        if (isUnlisted) {
            Swal.fire({
                icon: 'warning',
                title: 'Product Unavailable',
                text: 'This product is currently unavailable and cannot be increased.'
            });
            return;
        }
        
        if (isOutOfStock) {
            Swal.fire({
                icon: 'warning',
                title: 'Out of Stock',
                text: 'This product is out of stock or has insufficient stock.'
            });
            return;
        }
        
        // Normal quantity increase logic for available products
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