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
form.addEventListener('submit', (e) => {
    e.preventDefault()
    const botp = Array.from(columns).map(inpt => inpt.value).join('');
    parsotp.value = botp;
    fetch('/otp',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({otp:botp})
    })
    .then(res=>res.json())
    .then(res=>{
        if(res.success){
            window.location.href='/signin'
        }
        else{
            document.querySelector('.errorspace').inneText=res.message
        }
    })
});

// Timer for Resend OTP
const timeDisplay = document.getElementById('time');
const resendLink = document.getElementById('resend-link');


let countdown = localStorage.getItem('countdown') ? parseInt(localStorage.getItem('countdown')) : 30;
timeDisplay.textContent = countdown; 

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
    
    countdown = 30;
    timeDisplay.textContent = countdown;
    localStorage.setItem('countdown', countdown); 
    document.getElementById('countdown').style.display = 'block';
    resendLink.style.display = 'none';

    const newTimer = setInterval(() => {
        countdown--;
        timeDisplay.textContent = countdown;
        localStorage.setItem('countdown', countdown); 

        if (countdown <= 0) {
            clearInterval(newTimer);
            document.getElementById('countdown').style.display = 'none';
            resendLink.style.display = 'inline'; 
            localStorage.removeItem('countdown'); 
        }
    }, 1000);
});
