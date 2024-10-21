

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

    const updateDisplay = () => {
        quantity.textContent = number;
    };

    const checkAndUpdateQuantity = (increase) => {
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
                toatalprice[index].textContent = Math.floor(data.totalprice);
                summerytoatal.textContent = data.sumtoatal;
                toatals.textContent = data.sumtoatal;
                quantity.textContent = number;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: data.message || 'This is the maximum quantity that you can take.'
                });
            }
        })
        .catch(error => {
            console.error('Error updating quantity:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while updating the quantity.'
            });
        });
    };

    const plusButton = addbtn[index];
    const minusButton = minusbtn[index];

    minusButton.addEventListener('click', () => {
        if (number > 1) {
            number--;
            checkAndUpdateQuantity(false);
        }
    });

    plusButton.addEventListener('click', () => {
        if(number < 5){
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

    // Delete button
    deletebtn[index].addEventListener('click', (e) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to remove this item from the cart?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/cart/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ index }),
                })
                .then(res => res.json())
                .then(res => {
                    if (res.success) {
                        window.location.href = '/cart';
                    }
                })
                .catch(error => {
                    console.error('Error deleting item from cart:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'An error occurred while removing the item from the cart.'
                    });
                });
            }
        });
    });
});