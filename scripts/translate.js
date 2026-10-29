function initializeTranslator() {
    let activeSession;
    try {
        activeSession = sessionStorage.getItem('translingoSession');
    } catch (error) {
        console.error('Unable to access the current session.', error);
        window.location.href = '../index.html';
        return;
    }

    if (!activeSession) {
        window.location.href = '../index.html';
        return;
    }

    const fromSelect = document.getElementById('from-lang');
    const toSelect = document.getElementById('to-lang');
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const translateButton = document.getElementById('translate-btn');
    const swapButton = document.getElementById('swap-btn');
    const copyButton = document.getElementById('copy-btn');
    const logoutButton = document.getElementById('logout-btn');
    const statusMessage = document.getElementById('error-message');

    function showStatus(message) {
        statusMessage.textContent = message;
        statusMessage.hidden = !message;
    }

    async function translate() {
        const text = inputText.value.trim();
        const from = fromSelect.value;
        const to = toSelect.value;

        showStatus('');
        outputText.value = '';

        if (!text) {
            showStatus('Enter some text to translate.');
            inputText.focus();
            return;
        }

        if (from === to) {
            outputText.value = text;
            return;
        }

        translateButton.disabled = true;
        translateButton.textContent = 'Translating...';

        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`The translation service returned HTTP ${response.status}.`);
            }

            const data = await response.json();
            const translatedText = data && data.responseData && data.responseData.translatedText;
            if (Number(data && data.responseStatus) !== 200 || typeof translatedText !== 'string' || !translatedText) {
                throw new Error((data && data.responseDetails) || 'The translation service did not return a translation.');
            }

            outputText.value = translatedText;
        } catch (error) {
            console.error('Translation failed.', error);
            showStatus(`Translation failed. ${error instanceof Error ? error.message : 'Check your connection and try again.'}`);
        } finally {
            translateButton.disabled = false;
            translateButton.textContent = 'Translate';
        }
    }

    async function copyTranslation() {
        if (!outputText.value) {
            showStatus('There is no translation to copy.');
            return;
        }

        try {
            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                throw new Error('Clipboard access is unavailable.');
            }
            await navigator.clipboard.writeText(outputText.value);
            showStatus('Translation copied.');
        } catch (error) {
            console.error('Clipboard copy failed.', error);
            outputText.focus();
            outputText.select();
            showStatus('Copy was blocked. Select the translation and copy it manually.');
        }
    }

    translateButton.addEventListener('click', translate);

    swapButton.addEventListener('click', function () {
        const previousFrom = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = previousFrom;
        inputText.value = outputText.value;
        outputText.value = '';
        showStatus('');
        inputText.focus();
    });

    copyButton.addEventListener('click', copyTranslation);

    logoutButton.addEventListener('click', function () {
        try {
            sessionStorage.removeItem('translingoSession');
        } catch (error) {
            console.error('Unable to clear the current session.', error);
            showStatus('Unable to log out in this browser. Check your storage settings and try again.');
            return;
        }
        window.location.href = '../index.html';
    });
}

initializeTranslator();
