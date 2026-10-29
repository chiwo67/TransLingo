const registerForm = document.getElementById('register-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

registerForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;

    validateForm();
}
);

function validateForm() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === '' || password === '') {
        alert('Please fill in both username and password.');
        return false;
    }else if (username.length < 3 || password.length < 6) {
        alert('Username must be at least 3 characters and password must be at least 6 characters long.');
        return false;
    }else if (username === 'admin') {
        alert('Username "admin" is not allowed.');
        return false;
    } else {
        alert('Registration successful!');
        return true;
        window.location.href = 'index.html'; 
    }
}