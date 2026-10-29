const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;

    validateForm();

});

function validateForm() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === '' || password === '') {
       errorMessage('Please fill in both username and password.');
        return false;
    }else if (username !== 'admin' || password !== 'password') {
        errorMessage('Invalid username or password.');
        return false;
    } else {
        errorMessage('Login successful!');
        return true;
    }
}

function errorMessage(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function clearErrorMessage() {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
}   


