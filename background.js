let storedVariable = null;

// Handle saving the API key
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'setApiKey') {
    const decryptedKey = atob(message.encryptedKey); // Decrypt
    chrome.storage.local.set({ apiKey: message.encryptedKey }, () => {
      // Send a response back to popup.js indicating success
      sendResponse({ success: true });

      chrome.storage.local.set({isApiKey: true});

    });
    return true; // Keep the message channel open for async response
  }
});

// Handle removing the API key
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'removeApiKey') {

    chrome.storage.local.get(['apiKey'], function (result) {

      if (result.apiKey == null || result.apiKey == '' || result.apiKey === undefined) {
 
        sendResponse({ noApiKey: true });

      } else {
        chrome.storage.local.remove("apiKey", () => {
          // Send a response back to popup.js indicating success
          chrome.storage.local.set({isApiKey: false});
          sendResponse({ success: true });

          storedVariable = null;
        });

      }

    });

  }
  return true; // Keep the message channel open for async response
});

// Handle checking the API key
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'checkApiKey') {

    chrome.storage.local.get(['apiKey'], function (result) {

      if (result.apiKey == null || result.apiKey == '' || result.apiKey === undefined) {
        sendResponse({ apiMessage: true });

      } else {
        const decryptedKey = atob(result.apiKey); // Decrypt
        try {
          const apiKey = decryptedKey;
          const url = "https://api.openai.com/v1/chat/completions";
          const data = {
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content:
                  "Hi!",
              },
            ],
          };
          fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(data),
          })
            .then((response) => {

              if (!response.ok) {
                // Handle the error response
                return response.json().then((errorData) => {

                  // Determine the error type and show appropriate messages
                  let errorMessage = "An unknown error occurred.";
                  if (errorData.error) {
                    switch (errorData.error.type) {
                      case "invalid_request_error":
                        errorMessage = "Invalid API key!";
                        break;
                      case "authentication_error":
                        errorMessage = "Please check your API key.";
                        break;
                      case "rate_limit_error":
                        errorMessage = "Please try again later.";
                        break;
                      case "server_error":
                        errorMessage = "Please try again later.";
                        break;
                      default:
                        errorMessage = errorData.error.message || errorMessage;
                    }
                  }

                  sendResponse({ errorMessage: errorMessage });
                  return null; // Stop further processing
                });
              }
              return response.json(); // Parse the successful response
            })
            .then((data) => {

              // Only process data if it is valid
              if (data) {
                sendResponse({ isKeyValid: true });

              }
            })
            .catch((error) => {
              if (error.message === 'Failed to fetch') {
                sendResponse({ errorMessage: "No internet connection. Please check your network and try again." });
              } else {
                sendResponse({ errorMessage: "An unexpected error occurred. Please try again." });
              }
              // Handle unexpected errors

            });
        } catch (error) {

          sendResponse({ errorMessage: "An unexpected error occurred. Please try again." });
        }

      }

    });

    return true; // Keep the message channel open for async response
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'hideSpinner') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: hideSpinner
      });
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showPopup") {
    chrome.storage.local.set({ popupMessage: message.message }, () => {
      chrome.action.openPopup();
    });
  }
});

function showSpinner() {
  let spinner = document.createElement('div');
  spinner.id = 'page-spinner';
  spinner.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);">
          <div class="spinner"></div>
      </div>`;
  const style = document.createElement('style');
  style.textContent = `
      .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border-left-color: #09f;
          animation: spin 1s ease infinite;
      }
      @keyframes spin {
          0% {
              transform: rotate(0deg);
          }
          100% {
              transform: rotate(360deg);
          }
      }
      #page-spinner {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.1);
          z-index: 9999;
      }`;
  document.head.appendChild(style);
  document.body.appendChild(spinner);
}

function hideSpinner() {
  const spinner = document.getElementById('page-spinner');
  if (spinner) {
    spinner.remove();
  }
}

function execute() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0].id;
    try {
      // get the api key from storage
      chrome.storage.local.get(['apiKey'], function (result) {
        const myApiKey = atob(result.apiKey); // Decrypt
        if (result.apiKey == null || result.apiKey == '' || result.apiKey === undefined) {
          const apiMessage = "Please provide an API key!";
          chrome.runtime.sendMessage({ action: "showPopup", message: apiMessage });
          return;
        } else {
          storedVariable = myApiKey;
        }
      });
    } catch (error) {
    }
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: showSpinner
    }, () => {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: showText,
        args: [storedVariable, tabId] // Pass storedVariable as argument
      });
    });
  });
}

// Create a context menu that only appears inside text boxes
chrome.runtime.onInstalled.addListener(() => {
  // this page automatically opens when the extension installed
  chrome.tabs.create({ url: "https://sazaktechs.com/hashchrome.html" });
  chrome.contextMenus.create({
    id: "proofRead",
    title: "Proofread with HashChrome",
    contexts: ["editable"], // Restrict to text boxes and editable fields
  });
});

// Add a listener to handle clicks on the context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "proofRead") {
    execute();
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "proofread") {
    execute();
  }
});

async function showText(storedVariable, tabId) {
  let apiMessage;
  let selectedText = null;
  if (storedVariable) {
    apiMessage = "Please check your API key status!";
  } else {
    apiMessage = "Please provide an API key!";
  }
  let textArea = "";
  let textAreas = [];
  let textBox = "";
  let numTextAreas = 0;
  let textToProofread = "";
  try {
    // slack
    if (document.querySelectorAll('[data-qa="message_input"] div[contenteditable="true"]')) {
      textAreas = document.querySelectorAll('[data-qa="message_input"] div[contenteditable="true"]');
      let activeTextArea = null;
      // number of text areas
      textAreas.forEach((textArea1) => {
        numTextAreas += 1;
        if (document.activeElement === textArea1) {
          activeTextArea = textArea1;
        }
      });
      // whatsapp
      if (numTextAreas == 0) {

        textArea = document.querySelector(
          '#main .copyable-area [contenteditable="true"][role="textbox"]'
        );
      } else if (numTextAreas = 4) {

        if (activeTextArea) {
          const ariaLabel = activeTextArea.getAttribute('aria-label');
          if (ariaLabel && ariaLabel.includes('Message to')) {
            textBox = "message";
          } else if (ariaLabel && ariaLabel.includes('Reply to thread')) {
            textBox = "thread";
          }
        } else {
        }
        if (textAreas.length > 2) {
          if (textBox == "thread") {
            textArea = textAreas[2];
          } else if (textBox == "message") {
            textArea = textAreas[0];
          } else {
            textArea = textAreas[1];
          }
          try {
          } catch (error) {
            textArea = textAreas[0];
          }
        } else {
          textArea = textAreas[0];
        }
      } else if (numTextAreas == 2) {

        if (activeTextArea) {
          const ariaLabel = activeTextArea.getAttribute('aria-label');
          if (ariaLabel && ariaLabel.includes('Message to')) {
            textBox = "message";
          } else if (ariaLabel && ariaLabel.includes('Reply to thread')) {
            textBox = "thread";
          }
        } else {
        }
        if (textAreas.length >= 2) {
          if (textBox == "thread") {
            textArea = textAreas[0];
          } else if (textBox == "message") {
            textArea = textAreas[1];
          } else {
            return 0;
          }
        } else {
          textArea = textAreas[0];
        }
      }

      textToProofread = textArea.textContent;

      // Get the current selection
      let selection = window.getSelection();

      // Check if the selection is within the textArea

      if (selection.toString().length > 0) {
        let range = selection.getRangeAt(0); // Get the selected range

        // Verify that the selection is inside the message input box
        if (textArea.contains(range.commonAncestorContainer)) {
          selectedText = selection.toString(); // Extract the selected text
          textToProofread = selectedText;

        } else {
          console.log("No text selected within the message input box.");
        }
      } else {
        selectedText = null;
      }

    }
  } catch (error) {
    // whatsapp
    try {
      textArea = document.querySelector(
        '#main .copyable-area [contenteditable="true"][role="textbox"]'
      );
    } catch (error) {
    }
  }
  try {
    const apiKey = storedVariable;
    const url = "https://api.openai.com/v1/chat/completions";

    const data = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Please proofread the following text for grammar, punctuation, spelling, and any other language issues. Only make corrections to the text and do not provide answers or additional information, even if the text includes questions and the text has no error.",
        },
        { role: "user", content: textToProofread },
      ],
    };
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        // Create a new DataTransfer object and set the new text data
        const dataTransfer = new DataTransfer();

        if (selectedText !== null) {
          dataTransfer.setData("text", data.choices[0].message.content);
        } else {
          dataTransfer.setData("text", "\n\n" + data.choices[0].message.content);

          // Create a range and move it to the end of the content
          const range = document.createRange();
          range.selectNodeContents(textArea); // Select the text area
          range.collapse(false); // Collapse the range to the end of the text area

          // Set the selection to the end of the content
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);

        }

        // Create a ClipboardEvent for pasting the text
        const pasteEvent = new ClipboardEvent("paste", {
          clipboardData: dataTransfer,
          bubbles: true,
        });
        // Dispatch the event to the target element
        textArea.dispatchEvent(pasteEvent);
        // Execute hideSpinner in the background context
        chrome.runtime.sendMessage({ action: 'hideSpinner' });
      })
      .catch((error) => {
        // Execute hideSpinner in the background context
        chrome.runtime.sendMessage({ action: 'hideSpinner' });
        chrome.runtime.sendMessage({ action: "showPopup", message: apiMessage });
      });
  } catch (error) {
    chrome.runtime.sendMessage({ action: 'hideSpinner' });
  }
}