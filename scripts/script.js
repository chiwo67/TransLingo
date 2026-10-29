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

    try {
        const savedAccount = localStorage.getItem('translingoAccount');
        const account = savedAccount ? JSON.parse(savedAccount) : null;

        if (!account || typeof account.username !== 'string' || typeof account.password !== 'string') {
            showLoginMessage('No account found. Create an account before logging in.');
            return;
        }

        if (username !== account.username || password !== account.password) {
            showLoginMessage('Invalid username or password.');
            return;
        }

        sessionStorage.setItem('translingoSession', account.username);
    } catch (error) {
        console.error('Unable to access account data in browser storage.', error);
        showLoginMessage('Unable to access account data in this browser. Check your storage settings and try again.');
        return;
    }

    window.location.href = 'templates/home.html';
});
