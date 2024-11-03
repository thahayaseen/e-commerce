// Form validation function
function validateForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const addressLine1 = document.getElementById('addressLine1').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    const country = document.getElementById('country').value;
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const addressType = document.getElementById('addressType').value;

    let isValid = true;
    let errorMessage = '';

    if (!fullName) errorMessage += 'Full Name is required.\n';
    if (!addressLine1) errorMessage += 'Address Line 1 is required.\n';
    if (!city) errorMessage += 'City is required.\n';
    if (!state) errorMessage += 'State is required.\n';
    if (!zipCode) errorMessage += 'ZIP Code is required.\n';
    if (!country) errorMessage += 'Country is required.\n';
    if (!phoneNumber) errorMessage += 'Phone Number is required.\n';
    if (!addressType) errorMessage += 'Address Type is required.\n';

    const phonePattern = /^[0-9]+$/;
    if (!phonePattern.test(phoneNumber)) errorMessage += 'Please provide a valid phone number (digits only).';

    if (errorMessage) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: errorMessage,
        });
        return false;
    }
    return true;
}

// Event listener for form submission with validation
document.getElementById('newAddressForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (validateForm()) {
        const data = new FormData(this);
        const jsonObject = {};
        data.forEach((value, key) => jsonObject[key] = value);

        const jsonData = JSON.stringify(jsonObject);
        console.log(jsonData);

        fetch('/address', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonData
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) window.location.href = '/user/address';
            });
    }
});

// Edit button setup with dataset value handling
function setupEditButtons() {
    document.addEventListener('DOMContentLoaded',(e)=>{
        const editBtns = document.querySelectorAll('.btn-outline-primary');
    editBtns.forEach((btn) => {
        btn.addEventListener('click', function (e) {
            const { name, line1, line2, city, country, phone, state, id: addresid, zip } = e.target.dataset;
            console.log(zip);

            document.getElementById('efullName').value = name || '';
            document.getElementById('eaddressLine1').value = line1 || '';
            document.getElementById('eaddressLine2').value = line2 || '';
            document.getElementById('ecity').value = city || '';
            document.getElementById('estate').value = state || '';
            document.getElementById('econtry').value = country || '';
            document.getElementById('addresid').value = addresid || '';
            document.getElementById('ezip').value = zip || '';
            document.getElementById('ephone').value = phone || '';
        });
    });
    })
}
setupEditButtons();

// Remove button setup 
function setupRemoveButtons() {
    const removeBtns = document.querySelectorAll('.removebtn');
    removeBtns.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Do you want to delete this address?')) {
                const id = button.dataset.id;
                console.log(id);
                fetch(`/address/${id}`, { method: 'DELETE' })
                    .then(res => res.json())
                    .then(res => {
                        if (res.success) window.location.href = '/user/address';
                    });
            }
        });
    });
}
setupRemoveButtons();

// Edit address form submission handler
document.querySelector('.add-address').addEventListener('submit', (e) => {
    e.preventDefault();
    if (evalidateForm()) {
        const formData = new FormData(e.target);
        const jsonForm = {};

        formData.forEach((value, key) => { jsonForm[key] = value; });
        console.log(jsonForm);

        fetch('/address/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonForm)
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) window.location.href = '/user/address';
            });
    }
});


function evalidateForm() {
    const fullName = document.getElementById('efullName').value.trim();
    const addressLine1 = document.getElementById('eaddressLine1').value.trim();
    const city = document.getElementById('ecity').value.trim();
    const state = document.getElementById('estate').value.trim();
    const zipCode = document.getElementById('ezip').value.trim();
    const country = document.getElementById('econtry').value;
    const phoneNumber = document.getElementById('ephone').value.trim();
    const addressType = document.getElementById('eaddress').value;


    let errorMessage = '';

    if (!fullName) errorMessage += 'Full Name is required.\n';
    if (!addressLine1) errorMessage += 'Address Line 1 is required.\n';
    if (!city) errorMessage += 'City is required.\n';
    if (!state) errorMessage += 'State is required.\n';
    if (!zipCode) errorMessage += 'ZIP Code is required.\n';
    if (!country) errorMessage += 'Country is required.\n';
    if (!phoneNumber) errorMessage += 'Phone Number is required.\n';
    if (!addressType) errorMessage += 'Address Type is required.\n';

    const phonePattern = /^[0-9]+$/;
    if (!phonePattern.test(phoneNumber)) errorMessage += 'Please provide a valid phone number (digits only).';

    if (errorMessage) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: errorMessage,
        });
        return false;
    }
    return true;
}