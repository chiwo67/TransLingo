const registerForm = document.getElementById('register-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const registrationMessage = document.getElementById('error-message');

function showRegistrationMessage(message) {
    registrationMessage.textContent = message;
    registrationMessage.hidden = false;
}

registerForm.addEventListener('submit', function (event) {
    event.preventDefault();
    registrationMessage.textContent = '';
    registrationMessage.hidden = true;

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username.length < 3) {
        showRegistrationMessage('Username must be at least 3 characters long.');
        return;
    }

    if (password.length < 6) {
        showRegistrationMessage('Password must be at least 6 characters long.');
        return;
    }

    if (username.toLowerCase() === 'admin') {
        showRegistrationMessage('The username "admin" is not allowed.');
        return;
    }

    try {
        localStorage.setItem('translingoAccount', JSON.stringify({ username, password }));
    } catch (error) {
        console.error('Unable to save the account in browser storage.', error);
        showRegistrationMessage('Unable to save your account in this browser. Check your storage settings and try again.');
        return;
    }

    window.location.href = '../index.html';
});
