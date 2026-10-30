# TransLingo

A small, browser-based language translation demo.

## Run locally

Open the project with a local web server (for example, the VS Code Live Server
extension) and visit `index.html`. Registration, login, and the translator use
browser storage, so they are intended for a single-browser demo and do not
provide real account security. The translation feature requires an internet
connection and the MyMemory translation service.

The image translator recognizes text in the browser with Tesseract.js and
supports English, Swahili, French, Spanish, German, and Simplified Chinese
source text. Recognized text is sent to MyMemory for translation. Image
translation is limited to 10 MB, 20 megapixels, and 30 detected text lines.
The downloaded image covers text with a sampled background color, so complex
image backgrounds and text layouts may not be reproduced perfectly.