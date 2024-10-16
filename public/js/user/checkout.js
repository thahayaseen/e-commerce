// Address form validation
const address = document.getElementById('newAddressForm')

function validateForm(event) {
    const fullName = document.getElementById('fullName').value.trim();
    const addressLine1 = document.getElementById('addressLine1').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    const country = document.getElementById('country').value;
    const phoneNumber = document.getElementById('phoneNumber').value
    const addressType = document.getElementById('addressType').value;

    let isValid = true;
    let errorMessage = '';

    if (!fullName) {
        isValid = false;
        errorMessage += 'Full Name is required.\n';
    }
    if (!addressLine1) {
        isValid = false;
        errorMessage += 'Address Line 1 is required.\n';
    }
    if (!city) {
        isValid = false;
        errorMessage += 'City is required.\n';
    }
    if (!state) {
        isValid = false;
        errorMessage += 'State is required.\n';
    }
    if (!zipCode) {
        isValid = false;
        errorMessage += 'ZIP Code is required.\n';
    }
    if (!country) {
        isValid = false;
        errorMessage += 'Country is required.\n';
    }
    if (!phoneNumber) {
        isValid = false;
        errorMessage += 'Phone Number is required.\n';
    }
    if (!addressType) {
        isValid = false;
        errorMessage += 'Address Type is required.\n';
    }
    const phonePattern = /^[0-9]+$/;
    if (!phonePattern.test(phoneNumber)) {
        isValid = false;
        errorMessage += 'Please provide a valid phone number (digits only).\n';
    }

    if (!isValid) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: errorMessage,
        });
    }

    return isValid;
}

// coupon code 
let cname
let discountprice=0
const coupon=document.getElementById('apply')
const applaysubmit=document.getElementById('applysubmit')
applaysubmit.addEventListener('click',(e)=>{
    e.preventDefault()
    const code=coupon.value

    fetch(`/applaycoupon/${code}`,{
        method:'GET'
    })
    .then(res=>res.json())
    .then(res=>{
        if(res.success==false){
            document.getElementById('applayerror').innerText=res.erromsg
           return console.log(res.erromsg);
            
        }
        if(res.success){
            document.querySelector('.discount-charge').classList.remove('d-none')
            document.querySelector('.discount-charge').classList.add('d-flex')
            const rate=res.toatal-res.discount
            discountprice=res.discount
            cname=res.coupon
            console.log(rate);
            
            document.getElementById('total').innerText=rate
            document.getElementById('coupondiscount').innerText='-'+res.discount
        }
    })

    
})


// New address form submission
address.addEventListener('submit', async function (e) {
    e.preventDefault()
    const isValid = validateForm()
    if (isValid) {
        const data = new FormData(this)
        const jsonObject = {};
        data.forEach((value, key) => {
            jsonObject[key] = value;
        });
        const jsonData = JSON.stringify(jsonObject);
        console.log(jsonData);
        fetch('/address', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonData
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    window.location.href = '/checkout'
                }
            })
    }
})

// Order placement
function placeOrder() {
    Swal.fire({
        title: 'Order Placed!',
        text: 'Your order has been successfully placed.',
        icon: 'success',
        confirmButtonText: 'Go to Home',
        allowOutsideClick: false,
        allowEscapeKey: false,
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/';
        }
    });
}

// Main checkout form handling
// const checkoutForm = document.getElementById('checkoutForm')
// const paymentForm = document.querySelector('.paymentclass')

// Main checkout form handling
const checkoutForm = document.getElementById('checkoutForm');
const paymentForm = document.querySelector('.paymentclass');

paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const addressForm = new FormData(checkoutForm);
    let formData = Object.fromEntries(addressForm);

    if (Object.keys(formData).length === 0) {
        return Swal.fire({
            text: 'Please select an address before continuing',
            icon: 'error',
        });
    }

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (!paymentMethod) {
        return Swal.fire({
            text: 'Please select a payment method',
            icon: 'error',
        });
    }

    formData.paymentmethods = paymentMethod.value;
    formData.discount = Math.round(discountprice);
    formData.cname = cname;

    try {
        const response = await fetch('/orders', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            if (data.razorpay) {
                // Initialize Razorpay with order data from backend
                const options = {
                    key: data.razorpay_key,
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
                            if (verifyResult.success) {
                                Swal.fire({
                                    title: 'Order Placed!',
                                    text: 'Your order has been successfully placed.',
                                    icon: 'success',
                                    confirmButtonText: 'Go to Home',
                                    allowOutsideClick: false,
                                    allowEscapeKey: false,
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        window.location.href = '/';
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
                rzp.open();
            } else {
                // For non-Razorpay payments (e.g., COD)
                placeOrder();
            }
        } else {
            throw new Error('Order placement failed');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            text: 'There was an error processing your request. Please try again.',
            icon: 'error',
        });
    }
});

// Address card selection
const addressCards = document.querySelectorAll('.address-card');
addressCards.forEach(card => {
    card.addEventListener('click', () => {
        addressCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        card.querySelector('input[type="radio"]').checked = true;
    });
});
