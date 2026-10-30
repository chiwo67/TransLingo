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
    const imageFileInput = document.getElementById('image-file');
    const imageTranslateButton = document.getElementById('image-translate-btn');
    const imageDownloadLink = document.getElementById('image-download');
    const imageStatus = document.getElementById('image-status');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imageResultFigure = document.getElementById('image-result-figure');
    const originalCanvas = document.getElementById('image-original');
    const translatedCanvas = document.getElementById('image-preview');
    let selectedImage = null;
    let selectedImageName = '';

    function showStatus(message) {
        statusMessage.textContent = message;
        statusMessage.hidden = !message;
    }

    function showImageStatus(message) {
        imageStatus.textContent = message;
        imageStatus.hidden = !message;
    }

    async function requestTranslation(text, from, to) {
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

        return translatedText;
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
            outputText.value = await requestTranslation(text, from, to);
        } catch (error) {
            console.error('Translation failed.', error);
            showStatus(`Translation failed. ${error instanceof Error ? error.message : 'Check your connection and try again.'}`);
        } finally {
            translateButton.disabled = false;
            translateButton.textContent = 'Translate';
        }
    }

    function loadImage(file) {
        return new Promise(function (resolve, reject) {
            const imageUrl = URL.createObjectURL(file);
            const image = new Image();

            image.onload = function () {
                URL.revokeObjectURL(imageUrl);
                resolve(image);
            };
            image.onerror = function () {
                URL.revokeObjectURL(imageUrl);
                reject(new Error('This image could not be opened. Try another image file.'));
            };
            image.src = imageUrl;
        });
    }

    function getBackgroundColor(context, box) {
        const samples = [];
        const points = [
            [box.x + box.width / 2, box.y - 2],
            [box.x + box.width / 2, box.y + box.height + 2],
            [box.x - 2, box.y + box.height / 2],
            [box.x + box.width + 2, box.y + box.height / 2]
        ];

        for (const [x, y] of points) {
            if (x < 0 || y < 0 || x >= context.canvas.width || y >= context.canvas.height) {
                continue;
            }
            const pixel = context.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
            samples.push([pixel[0], pixel[1], pixel[2]]);
        }

        if (samples.length === 0) {
            return 'rgb(255, 255, 255)';
        }

        const average = samples[0].map(function (_, channel) {
            return Math.round(samples.reduce((sum, sample) => sum + sample[channel], 0) / samples.length);
        });
        return `rgb(${average[0]}, ${average[1]}, ${average[2]})`;
    }

    function drawTranslatedLines(image, lines, translations) {
        const canvas = translatedCanvas;
        const context = canvas.getContext('2d');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        context.drawImage(image, 0, 0);

        const boxes = lines.map(function (line, index) {
            const padding = Math.max(2, Math.round((line.bbox.y1 - line.bbox.y0) * 0.08));
            const x = Math.max(0, Math.floor(line.bbox.x0) - padding);
            const y = Math.max(0, Math.floor(line.bbox.y0) - padding);
            const right = Math.min(canvas.width, Math.ceil(line.bbox.x1) + padding);
            const bottom = Math.min(canvas.height, Math.ceil(line.bbox.y1) + padding);
            const box = {
                x,
                y,
                width: Math.max(1, right - x),
                height: Math.max(1, bottom - y)
            };

            return {
                box,
                text: translations[index].replace(/\s+/g, ' ').trim(),
                background: getBackgroundColor(context, box)
            };
        });

        for (const item of boxes) {
            context.fillStyle = item.background;
            context.fillRect(item.box.x, item.box.y, item.box.width, item.box.height);
        }

        for (const item of boxes) {
            const luminance = item.background.match(/\d+/g).slice(0, 3).reduce((sum, value, index) => {
                return sum + Number(value) * [0.299, 0.587, 0.114][index];
            }, 0);
            const fontSize = Math.max(8, Math.floor(item.box.height * 0.72));
            context.fillStyle = luminance > 150 ? '#111111' : '#ffffff';
            context.font = `${fontSize}px sans-serif`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(
                item.text,
                item.box.x + item.box.width / 2,
                item.box.y + item.box.height / 2,
                Math.max(1, item.box.width - 4)
            );
        }

        imageDownloadLink.href = canvas.toDataURL('image/png');
        imageDownloadLink.download = `${selectedImageName.replace(/\.[^.]+$/, '') || 'image'}-translated.png`;
        imageDownloadLink.classList.remove('hidden');
        imageResultFigure.hidden = false;
    }

    async function translateImage() {
        if (!selectedImage) {
            showImageStatus('Choose an image before translating.');
            return;
        }

        const ocrLanguages = {
            en: 'eng',
            sw: 'swa',
            fr: 'fra',
            es: 'spa',
            de: 'deu',
            'zh-CN': 'chi_sim'
        };
        const from = fromSelect.value;
        const to = toSelect.value;
        const ocrLanguage = ocrLanguages[from];

        if (!ocrLanguage) {
            showImageStatus('Text recognition is not available for the selected source language.');
            return;
        }

        if (selectedImage.naturalWidth * selectedImage.naturalHeight > 20000000) {
            showImageStatus('This image is too large to process. Choose an image with 20 megapixels or fewer.');
            return;
        }

        imageTranslateButton.disabled = true;
        imageFileInput.disabled = true;
        imageTranslateButton.textContent = 'Processing...';
        imageDownloadLink.classList.add('hidden');
        imageResultFigure.hidden = true;
        showImageStatus('Loading text recognition...');

        let worker;
        try {
            if (!window.Tesseract || typeof window.Tesseract.createWorker !== 'function') {
                throw new Error('Text recognition could not load. Check your internet connection and try again.');
            }

            worker = await window.Tesseract.createWorker(ocrLanguage, 1, {
                logger: function (progress) {
                    if (progress.status === 'recognizing text' && Number.isFinite(progress.progress)) {
                        showImageStatus(`Recognizing image text... ${Math.round(progress.progress * 100)}%`);
                    }
                }
            });

            const result = await worker.recognize(selectedImage);
            const lines = result.data.lines.filter(function (line) {
                return line.text.trim() && line.bbox && Number.isFinite(line.bbox.x0) &&
                    Number.isFinite(line.bbox.y0) && Number.isFinite(line.bbox.x1) &&
                    Number.isFinite(line.bbox.y1) && line.bbox.x1 > line.bbox.x0 &&
                    line.bbox.y1 > line.bbox.y0;
            });

            if (lines.length === 0) {
                throw new Error('No readable text was found in this image.');
            }
            if (lines.length > 30) {
                throw new Error('This image contains too many text lines to translate at once. Try cropping it to a smaller area.');
            }

            const translations = [];
            for (let index = 0; index < lines.length; index += 1) {
                const text = lines[index].text.trim();
                if (from === to) {
                    translations.push(text);
                } else {
                    showImageStatus(`Translating line ${index + 1} of ${lines.length}...`);
                    translations.push(await requestTranslation(text, from, to));
                }
            }

            drawTranslatedLines(selectedImage, lines, translations);
            showImageStatus(`Done. Translated ${lines.length} text line${lines.length === 1 ? '' : 's'}. Review the preview before downloading.`);
        } catch (error) {
            console.error('Image translation failed.', error);
            showImageStatus(`Image translation failed. ${error instanceof Error ? error.message : 'Check your connection and try again.'}`);
        } finally {
            if (worker) {
                try {
                    await worker.terminate();
                } catch (error) {
                    console.error('Unable to stop the text recognition worker.', error);
                }
            }
            imageTranslateButton.disabled = false;
            imageFileInput.disabled = false;
            imageTranslateButton.textContent = 'Translate image';
        }
    }

    imageFileInput.addEventListener('change', async function () {
        const file = imageFileInput.files && imageFileInput.files[0];
        selectedImage = null;
        selectedImageName = '';
        imageTranslateButton.disabled = true;
        imageDownloadLink.classList.add('hidden');
        imageResultFigure.hidden = true;
        imagePreviewContainer.hidden = true;
        showImageStatus('');

        if (!file) {
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            showImageStatus('Choose a JPG, PNG, or WebP image.');
            imageFileInput.value = '';
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showImageStatus('The image must be 10 MB or smaller.');
            imageFileInput.value = '';
            return;
        }

        showImageStatus('Loading image...');
        try {
            const image = await loadImage(file);
            if (image.naturalWidth * image.naturalHeight > 20000000) {
                throw new Error('This image is too large to process. Choose an image with 20 megapixels or fewer.');
            }
            selectedImage = image;
            selectedImageName = file.name;
            originalCanvas.width = image.naturalWidth;
            originalCanvas.height = image.naturalHeight;
            originalCanvas.getContext('2d').drawImage(image, 0, 0);
            imagePreviewContainer.hidden = false;
            imageTranslateButton.disabled = false;
            showImageStatus('Image ready. Select the source and target languages above, then translate.');
        } catch (error) {
            console.error('Image loading failed.', error);
            showImageStatus(error instanceof Error ? error.message : 'This image could not be opened.');
            imageFileInput.value = '';
        }
    });

    imageTranslateButton.addEventListener('click', translateImage);

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
