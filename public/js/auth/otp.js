const columns = document.querySelectorAll('.otp-input');
const parsotp = document.getElementById('chkotp');
const form = document.querySelector('#otp-form');

// Auto focus next input
columns.forEach((input, index) => {
    input.addEventListener('input', () => {
        if (input.value.length === 1 && index < columns.length - 1) {
            columns[index + 1].focus();
        }
    });
});

// Submitting
form.addEventListener('submit', () => {
    const botp = Array.from(columns).map(inpt => inpt.value).join('');
    parsotp.value = botp;
});

// Timer for Resend OTP
const timeDisplay = document.getElementById('time');
const resendLink = document.getElementById('resend-link');

// Get the stored countdown from localStorage or set it to 30 if not present
let countdown = localStorage.getItem('countdown') ? parseInt(localStorage.getItem('countdown')) : 30;
timeDisplay.textContent = countdown; // Display the initial countdown value

const timer = setInterval(() => {
    countdown--;
    timeDisplay.textContent = countdown;
    localStorage.setItem('countdown', countdown); // Save the countdown in localStorage

    if (countdown <= 0) {
        clearInterval(timer);
        document.getElementById('countdown').style.display = 'none';
        resendLink.style.display = 'inline'; // Show the resend link
        localStorage.removeItem('countdown'); // Remove countdown from localStorage once it reaches 0
    }
}, 1000);

// Resend OTP link click event
resendLink.addEventListener('click', () => {
    // alert("OTP has been resent!");

    // Reset the timer and UI after resending OTP
    countdown = 30;
    timeDisplay.textContent = countdown;
    localStorage.setItem('countdown', countdown); // Store the reset countdown value
    document.getElementById('countdown').style.display = 'block';
    resendLink.style.display = 'none'; // Hide resend link again

    const newTimer = setInterval(() => {
        countdown--;
        timeDisplay.textContent = countdown;
        localStorage.setItem('countdown', countdown); // Update the countdown in localStorage

        if (countdown <= 0) {
            clearInterval(newTimer);
            document.getElementById('countdown').style.display = 'none';
            resendLink.style.display = 'inline'; // Show the resend link again
            localStorage.removeItem('countdown'); // Remove countdown from localStorage
        }
    }, 1000);
});
