const btn = document.getElementById('butten')
btn.addEventListener('click', (e) => {
    console.log("asfgwdfgsdfgsgasd");


    if (!validate()) {
        e.preventDefault();
    }
})

const setError = (id, massage) => {
    const input = id.parentElement
    const err = input.querySelector('.error')

    err.innerText = massage
    input.classList.add('error')
    input.classList.remove('success')
}

const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};
function validate() {
    const usernameElement = document.getElementById('username')
    const username = usernameElement.value.trim()

    const passwordElement = document.getElementById('password')
    const password = passwordElement.value.trim()
    let isval = true

    if (username === '') {
        setError(usernameElement, 'Username is required')
        isval = false
    } else {
        setSuccess(usernameElement)
    }
    if (password === '') {
        setError(passwordElement, 'password is required')
        isval = false
    }
    else if (password.length < 8) {
        setError(passwordElement, "password need more that 8 charecters")
        isval = false
    }
    else {
        setSuccess(passwordElement)
    }

    return isval

}