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
            icon: 'error', // or 'success', 'warning', 'info', 'question'
            title: 'Oops...',
            text: errorMessage, // your error message
        });

    }

    return isValid; // Prevent default submission if not valid
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
                    window.location.href = '/user/address'
                }
            })
    }

})

const editBtns = document.querySelectorAll('.btn-outline-primary');

editBtns.forEach((btn, index) => {
    btn.addEventListener('click', function (e) {
        // Accessing dataset values
        const name = e.target.dataset.name;
        const line1 = e.target.dataset.line1;
        const line2 = e.target.dataset.line2;
        const city = e.target.dataset.city;
        const country = e.target.dataset.country;
        const phone = e.target.dataset.phone;
        const state = e.target.dataset.state;

        // Log the values to check if they are being retrieved
        console.log(name, line1, line2, city, country, phone);

        // Set the values in the modal inputs
        document.getElementById('efullName').value = name;
        document.getElementById('eaddressLine1').value = line1;
        document.getElementById('eaddressLine2').value = line2;
        document.getElementById('ecity').value = city;
        document.getElementById('estate').value = state; 
        document.getElementById('econtry').value = country; 

        // Ensure you handle the phone if needed
        document.getElementById('ephone').value = phone; // If you have an input for phone
    });
});

const removebtn=document.querySelectorAll('.removebtn')

removebtn.forEach(rbutten=>{
    rbutten.addEventListener('click',(e)=>{
        e.preventDefault()
       const conform=confirm('do you want to delete this address')

       if (conform  ) {
        const id=rbutten.dataset.id
        console.log(id);
            fetch(`/address/${id}`,{
                method:'PATCH'

        })
        .then(res=>res.json())
        .then(res=>{
            if (res.success) {
                window.location.href='/user/address'
            }
        })
       }
        
    
    
    })
})

    const editaddress=document.querySelector('.add-address')

    editaddress.addEventListener('submit',(e)=>{
        e.preventDefault()
        const formdata=new FormData(e.target)
        let jsonform={}
        formdata.forEach((data,ind)=>{
            jsonform[ind]=data
        })
        console.log(jsonform);
        

    })