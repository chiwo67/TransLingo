const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('entered-username');
const passwordInput = document.getElementById('entered-password');
const loginMessage = document.getElementById('error-message');

function showLoginMessage(message) {
    loginMessage.textContent = message;
    loginMessage.hidden = false;
}

loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    loginMessage.textContent = '';
    loginMessage.hidden = true;

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    let account;
    try {
        const savedAccount = localStorage.getItem('translingoAccount');
        account = savedAccount ? JSON.parse(savedAccount) : null;
    } catch (error) {
        console.error('Unable to read the saved account from browser storage.', error);
        showLoginMessage('Unable to access saved account data in this browser.');
        return;
    }

    if (!account || typeof account.username !== 'string' || typeof account.password !== 'string') {
        showLoginMessage('No account found. Create an account before logging in.');
        return;
    }

    if (username !== account.username || password !== account.password) {
        showLoginMessage('Invalid username or password.');
        return;
    }

    window.location.href = 'templates/home.html';
});
