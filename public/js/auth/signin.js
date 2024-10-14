const form = document.getElementById('form');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const cpassword = document.getElementById('cpassword');

form.addEventListener('submit', (e) => {
    if (!validateInputs()) {
        e.preventDefault();  // Prevent form submission only if validation fails
        console.log('Validation error');
    } else {
        console.log('Form submitted successfully');
    }
});

const setError = (element, message) => {
    const Control = element.parentElement;
    const inputControl=Control.parentElement
    const errorDisplay = inputControl.querySelector('.error');

    if (!errorDisplay) {
        const errorDiv = document.createElement('span');
        errorDiv.classList.add('error','text-danger');
        inputControl.appendChild(errorDiv);
    }

    inputControl.querySelector('.error').innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
};

const setSuccess = (element) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    if (errorDisplay) {
        errorDisplay.innerText = '';
    }
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const validateInputs = () => {
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const cpasswordValue = cpassword.value.trim();
    let isValid = true;

    if (usernameValue === '') {
        setError(username,  'Username is required');
        isValid = false;
    } else {
        setSuccess(username);
    }

    if (emailValue === '') {
        setError(email, 'Email is required');
        isValid = false;
    } else if (!isValidEmail(emailValue)) {
        setError(email, 'Provide a valid email address');
        isValid = false;
    } else {
        setSuccess(email);
    }

    if (passwordValue === '') {
        setError(password, 'Password is required');
        isValid = false;
    } else if (passwordValue.length < 8) {
        setError(password, 'Password must be at least 8 characters.');
        isValid = false;
    } else {
        setSuccess(password);
    }

    if (cpasswordValue === '') {
        setError(cpassword, 'Please confirm your password');
        isValid = false;
    } else if (cpasswordValue !== passwordValue) {
        setError(cpassword, 'Passwords do not match');
        isValid = false;
    } else {
        setSuccess(cpassword);
    }

    return isValid;
};
