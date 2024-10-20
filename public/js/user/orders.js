const ordercancelbtn = document.querySelectorAll('.cancelbtn');

ordercancelbtn.forEach(function(btn) {
    btn.addEventListener('click', async (e) => {
        // Show SweetAlert2 confirmation dialog
        const result = await Swal.fire({
            title: 'Cancel Order',
            text: 'Are you sure you want to cancel your order?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Cancel Order',
            cancelButtonText: 'No, Keep Order',
            customClass: {
                confirmButton: 'btn btn-danger px-4 py-2 mx-2',
                cancelButton: 'btn btn-secondary px-4 py-2 mx-2',
                popup: 'custom-popup'
            },
            buttonsStyling: false,
            reverseButtons: true,
            animation: true,
            background: '#fff',
            width: '24em',
            padding: '1.25em'
        });

        if (result.isConfirmed) {
            const id = e.target.dataset.orderid;
            
            // Show loading state
            Swal.fire({
                title: 'Processing',
                text: 'Canceling your order...',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const response = await fetch(`/orders/${id}`, {
                    method: 'PATCH'
                });
                const data = await response.json();

                if (data.success) {
                   
                    await Swal.fire({
                        icon: 'success',
                        title: 'Order Canceled!',
                        text: 'Your order has been canceled successfully.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    
                   
                    window.location.href = '/user/orders';
                } else {
                    
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: data.message || 'Something went wrong!',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'btn btn-primary px-4 py-2'
                        },
                        buttonsStyling: false
                    });
                }
            } catch (error) {
                // Handle network errors
                Swal.fire({
                    icon: 'error',
                    title: 'Network Error',
                    text: 'Please check your internet connection and try again.',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'btn btn-primary px-4 py-2'
                    },
                    buttonsStyling: false
                });
            }
        }
    });
});