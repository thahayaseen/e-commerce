const columns = document.querySelectorAll('.otp-input');
        const parsotp = document.getElementById('chkotp');
        const form=document.querySelector('#otp-form')

        // Auto focus next input
        columns.forEach((input, index) => {
            input.addEventListener('input', () => {
                if (input.value.length === 1 && index < columns.length - 1) {
                    columns[index + 1].focus();
                }
            });
        });
        // submitting
        form.addEventListener('submit',()=>{
            const botp=Array.from(columns).map(inpt=>inpt.value).join('')
            parsotp.value=botp
        })
        
        // Timer for Resend OTP
        const timeDisplay = document.getElementById('time');
        const resendLink = document.getElementById('resend-link')
        let countdown = 30;
        const timer = setInterval(() => {
            countdown--;
            timeDisplay.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(timer);
                document.getElementById('countdown').style.display = 'none';
                resendLink.style.display = 'inline'; // Show the resend link
            }
        }, 1000);

        // Resend OTP link click event
        resendLink.addEventListener('click', () => {
            // pars otp 
           
            alert("OTP has been reseent!");
           
            
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
                    resendLink.style.display = 'inline'; // Show the resend link again
                }
            }, 1000);
        });