const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

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
        alert('Please fill in both username and password.');
        return false;
    }else if (username !== 'admin' || password !== 'password') {
        alert('Invalid username or password.');
        return false;
    } else {
        alert('Login successful!');
        return true;
    }
}
