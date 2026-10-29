let activeSession;

try {
    activeSession = sessionStorage.getItem('translingoSession');
} catch (error) {
    console.error('Unable to access the current session.', error);
    window.location.href = '../index.html';
}

if (!activeSession) {
    window.location.href = '../index.html';
} else {
    const logoutButton = document.getElementById('logout-btn');
    const logoutMessage = document.getElementById('logout-message');

    logoutButton.addEventListener('click', function () {
        try {
            sessionStorage.removeItem('translingoSession');
        } catch (error) {
            console.error('Unable to clear the current session.', error);
            logoutMessage.textContent = 'Unable to log out in this browser. Check your storage settings and try again.';
            logoutMessage.hidden = false;
            return;
        }

        window.location.href = '../index.html';
    });
}
