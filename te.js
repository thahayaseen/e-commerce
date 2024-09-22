const columns = document.querySelectorAll('.otp-input');
const parsotp = document.getElementById('chkotp'); // Reference to hidden OTP field
const form = document.getElementById('otp-form'); // Reference to the form

// Auto-focus next input
columns.forEach((input, index) => {
    input.addEventListener('input', () => {
        if (input.value.length === 1 && index < columns.length - 1) {
            columns[index + 1].focus();
        }
    });
});

// Concatenate OTP and set it to the hidden field before form submission
form.addEventListener('submit', (event) => {
    const otpValue = Array.from(columns).map(input => input.value).join('');
    parsotp.value = otpValue; // Set concatenated OTP to hidden field
});

// Timer for Resend OTP
const timeDisplay = document.getElementById('time');
const resendLink = document.getElementById('resend-link');
let countdown = 30;

const timer = setInterval(() => {
    countdown--;
    timeDisplay.textContent = countdown;

    if (countdown <= 0) {
        clearInterval(timer);
        document.getElementById('countdown').style.display = 'none';
        resendLink.style.display = 'inline'; // Show resend link
    }
}, 1000);

// Resend OTP link click event
resendLink.addEventListener('click', () => {
    alert("OTP has been resent!");

    // Reset the timer and UI after resending OTP
    countdown = 30;
    timeDisplay.textContent = countdown;
    document.getElementById('countdown').style.display = 'block';
    resendLink.style.display = 'none'; // Hide resend link again

    const newTimer = setInterval(() => {
        countdown--;
        timeDisplay.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(newTimer);
            document.getElementById('countdown').style.display = 'none';
            resendLink.style.display = 'inline'; // Show resend link again
        }
    }, 1000);
});
