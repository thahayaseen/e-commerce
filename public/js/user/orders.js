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
            const orderid = e.target.dataset.orderid;
            const productid=e.target.dataset.productid
            
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
                const response = await fetch(`/user/cancel-product`, {
                    method: 'POST',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({productid,orderid})
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
                    
                   
                    window.location.reload(true)
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
document.querySelectorAll('#retrypayment').forEach(item=>{
    item.addEventListener('click',(e)=>{
        console.log('haloo');
        
        const orderid=item.dataset.orderid
        console.log(orderid);
        fetch('/retrypayment/'+orderid,{method:'POST'})
        .then(data=>data.json())
        .then(data=>{
            if (data.razorpay) {
                // Initialize Razorpay with order data from backend
                const options = {
                    key: 'rzp_test_9qmTVL5YIuQUdW',
                    amount: data.amount,
                    currency: "INR",
                    name: "Your E-Commerce Site",
                    description: "Purchase Description",
                    order_id: data.order_id,
                    handler: async function (response) {
                        try {
                            const verifyResponse = await fetch('/verify-payment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                    orderId: data.orderId
                                }),
                            });

                            const verifyResult = await verifyResponse.json();
                            console.log('helloooooooo');
                            
                            if (verifyResult.success) {
                                Swal.fire({
                                    title: 'Order Placed!',
                                    text: 'Your payment has been successfully.',
                                    icon: 'success',
                                    confirmButtonText: 'Done',
                                    allowOutsideClick: false,
                                    allowEscapeKey: false,
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        window.location.reload(true)
                                    }
                                });
                            } else {
                                throw new Error('Payment verification failed');
                            }
                        } catch (error) {
                            console.error('Verification Error:', error);
                            Swal.fire({
                                text: 'Payment verification failed. Please contact support.',
                                icon: 'error',
                            });
                        }
                    },
                    prefill: {
                        name: "pandi Name",
                        email: "customer@example.com",
                        contact: "9999999999"
                    },
                    theme: {
                        color: "#3399cc"
                    }
                };

                const rzp = new Razorpay(options);
                rzp.on('payment.failed', async function (response) {
                    console.log(response);
                    fetch('/payment-failed/'+data.orderId,{
                        method:'PATCH',
                        headers:{
                            'Content-Type':'applaycoupon/json'
                        }
                        
                    })
                   await  Swal.fire({
                        title: 'Payment Failed!',
                        text: 'Your payment could not be processed. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'Okay',
                    });
                });
                rzp.open()
                
            } 
        })
        
    })
})
