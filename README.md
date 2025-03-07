[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/nkmhiiaddgijccgppefkaedjddnhnomd.svg)](https://chrome.google.com/webstore/detail/nkmhiiaddgijccgppefkaedjddnhnomd)
# HashChrome

## Description

HashChrome is a Chrome extension that helps users proofread their messages on WhatsApp and Slack using OpenAI’s API.

### Key Features
- Enter and save an OpenAI API key.
- Proofread messages on WhatsApp and Slack.
- Use `Ctrl+Shift+K` / `Cmd+Shift+K` or right-click to proofread.
- Check API key validity.
- Remove API key when needed.

### How It Works
- Users enter their OpenAI API key in the extension’s popup and save it.
- Press `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Shift+K` (Mac) to proofread.
- Alternatively, right-click and select "Proofread."
- If no text is selected, the entire message is proofread; otherwise, only the selected portion is checked.
- Users can verify if their API key is valid and remove it when needed.

## Installation Guide

### Install from Chrome Web Store
[HashChrome on Chrome Web Store](https://chromewebstore.google.com/detail/hashchrome/nkmhiiaddgijccgppefkaedjddnhnomd)

### Manual Installation
1. Clone this repository:
   ```sh
   git clone https://github.com/sazaktechs/hashchrome.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the cloned `hashchrome` directory.
5. The extension is now installed and ready to use.

## Usage Instructions
1. Click on the HashChrome extension icon.
2. Enter your OpenAI API key and save it.
3. Proofread messages:
   - Press `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Shift+K` (Mac).
   - Or right-click a message and select **Proofread**.
4. Manage your API key:
   - Check if the key is valid.
   - Remove the key if needed.

## Development & Contribution Guide

### Setting Up the Project
1. Clone the repository:
   ```sh
   git clone https://github.com/sazaktechs/hashchrome.git
   ```
2. Load the extension as an unpacked extension in Chrome (see manual installation steps above).
3. Start contributing!

### Contribution Guidelines
- Fork the repository.
- Create a feature branch: `git checkout -b feature-name`.
- Commit your changes: `git commit -m "Add feature-name"`.
- Push to your fork and create a pull request.
- Follow coding standards and document your changes.

## License
This project is licensed under the [MIT License](LICENSE).
