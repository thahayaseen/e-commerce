
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
    const phonePattern = /^[0-9]+$/; // Allow digits, spaces, parentheses, and dashes
    if (!phonePattern.test(phoneNumber)) {
        isValid = false;
        errorMessage += 'Please provide a valid phone number (digits.';
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



address.addEventListener('submit', async function (e) {
    e.preventDefault()
    const isvalid = validateForm()
    if (isvalid) {
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

let method
const paymentform=document.querySelector('.paymentclass')

    paymentform.addEventListener('submit',(e)=>{
        e.preventDefault()
    method=document.querySelector('input[name="paymentMethod"]:checked').value
        console.log(method);
        
    })




//place order


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
         
            window.location.href = '/home'; 
        } 
    });
}


const placebtn = document.querySelector('.placeorderbtn')

const checkoutForm = document.getElementById('checkoutForm')
placebtn.addEventListener('click', () => {
    
    const addressform = new FormData(checkoutForm)
    console.log(addressform);
    let formdata = {}
    addressform.forEach((data, index) => {
        formdata[index] = data
    })
    if (Object.keys(formdata).length==0) {
       return alert('please select address before continue')
        
    }
    formdata.paymentmethods=method
    const addresid=JSON.stringify(formdata)
    fetch('/orders',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:addresid

    })
    .then(res=>res.json())
    .then(res=>{
        if (res.success=true) {
            console.log('done');
            
            placeOrder();
        }
    })
    console.log(addresid);

})