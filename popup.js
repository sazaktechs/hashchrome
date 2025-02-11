document.addEventListener('DOMContentLoaded', function () {
  const saveApiKey = document.getElementById('saveApiKey');
  const checkApiKey = document.getElementById('checkApiKey');
  const removeApiKey = document.getElementById('removeApiKey');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const iconElement = document.getElementById("api-key-icon");
  const messageElement = document.getElementById("api-key-message");
  const iconMessage = document.getElementById("message-icon");
  const messageContainer = document.getElementById("message-container");
  const inputMessage = document.getElementById("message");

  // Select the modal and its elements
  const modal = document.getElementById("error-modal");
  const closeBtn = document.querySelector(".close");
  const errorMessage = document.getElementById("error-message");

  const inputField = document.getElementById("apiKeyInput");

  const confirmationModal = document.getElementById("confirmation-modal");
  const confirmRemoveBtn = document.getElementById("confirm-remove");
  const cancelRemoveBtn = document.getElementById("cancel-remove");
  const closeConfirmationBtn = document.getElementById("conf-close");

  inputField.addEventListener("input", function () {
    if (inputField.value.trim() !== "") {
      messageContainer.style.display = "none";
    } else {
      // Show label when input is empty

      chrome.storage.local.get("popupMessage", (data) => {
        const message = data.popupMessage;  // || "No message provided."
        if (message == null || message == undefined || message == '') {
          messageContainer.style.display = "none";
        } else {
          messageContainer.style.display = "grid";
          // Set failure icon and message
          iconMessage.textContent = "\u26A0"; // Unicode escape for ⚠️
          iconMessage.style.color = "yellow"; 
          inputMessage.textContent = message;
        }
      });
    }
  });

  // Function to show the modal with a specific error message
  function showError(message) {
    errorMessage.textContent = message; // Set the error message
    modal.style.display = "flex"; // Show the modal
  }

  // Function to close the modal
  function closeModal() {
    modal.style.display = "none"; // Hide the modal
  }

  // Add event listeners
  closeBtn.addEventListener("click", closeModal);
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(); // Close if clicking outside the modal
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "error") {
      showError(request.message);

    }
    return true; // Required for async responses
  });

  window.addEventListener("click", (event) => {
    if (event.target === confirmationModal) {
      closeConfirmationModal(); // Close if clicking outside the modal
    }
  });

  // Show modal when "Remove API Key" button is clicked
  removeApiKey.addEventListener("click", () => {
    confirmationModal.style.display = "flex";
  });

  // Show modal when "Remove API Key" button is clicked
  closeConfirmationBtn.addEventListener("click", () => {
    confirmationModal.style.display = "none";
  });

  // Hide modal when "No" button is clicked
  cancelRemoveBtn.addEventListener("click", () => {
    confirmationModal.style.display = "none";
  });

  confirmRemoveBtn.addEventListener("click", () => {
    messageContainer.style.display = "none";
    messageContainer.style.visibility = 'hidden';
    document.getElementById("api-key-message").textContent = "";
    iconMessage.textContent = "";
    iconElement.textContent = "";
    apiKeyInput.value = "";
    chrome.runtime.sendMessage({ type: 'removeApiKey', }, (response) => {

      if (response.noApiKey) {
        messageContainer.style.display = "grid";
        messageContainer.style.visibility = 'visible';
        iconMessage.style.visibility = 'visible';
        // Set failure icon and message
        iconMessage.textContent = "\u26A0"; // Unicode escape for ⚠️
        iconMessage.style.color = "yellow";
        document.getElementById("message").style.color = "red";
        document.getElementById("message").textContent = "Please provide an API key!";

        removeApiKey.style.display = 'none';
        checkApiKey.style.display = 'none';
      } else {

        if (response.success) {
          // Show success message to user
          removeApiKey.style.display = 'none';
          checkApiKey.style.display = 'none';
          messageElement.textContent = "Your api key removed successfully!"
          confirmationModal.style.display = "none";
          showError("\u2705 Your api key removed successfully!"); // "\u2705" Unicode escape for ✅
        } else {
          // Show error message to user
          messageElement.textContent = "Error!"
        }
      }
    });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "error") {
      showError(request.message);

    }
    return true; // Required for async responses
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
            border-left-color: #2c9b22;
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

  chrome.storage.local.get("popupMessage", (data) => {
    const message = data.popupMessage;  // || "No message provided."
    if (message == null || message == undefined || message == '') {
      messageContainer.style.display = "none";
      messageContainer.style.visibility = 'hidden';
    } else {
      messageContainer.style.display = "grid";
      messageContainer.style.visibility = 'visible';
      // Set failure icon and message
      iconMessage.textContent = "\u26A0"; // Unicode escape for ⚠️
      iconMessage.style.color = "yellow";
      document.getElementById("message").textContent = message;
    }
  });

  // check if api key provided 
  chrome.storage.local.get("isApiKey", (data) => {
    const message = data.isApiKey;  // || "No message provided."
    if (message === true) {
      removeApiKey.style.display = 'block';
      checkApiKey.style.display = 'block';
    } else {
      removeApiKey.style.display = 'none';
      checkApiKey.style.display = 'none';
    }
  });

  // Save button click handler
  saveApiKey.addEventListener('click', function () {

    messageElement.textContent = "";
    iconElement.textContent = "";
    iconMessage.style.visibility = "visible";
    const apiKeyValue = apiKeyInput.value.trim();  // Trim whitespace from input
    // show the "Show API Key" button after saving
    if (apiKeyValue == '') {
      messageContainer.style.display = "grid";
      messageContainer.style.visibility = 'visible';
      // Set failure icon and message
      iconMessage.textContent = "\u26A0"; // Unicode escape for ⚠️
      iconMessage.style.color = "yellow";
      document.getElementById('message').style.color = "red";
      document.getElementById("message").textContent = "This field cannot be empty!";
    } 
    else if (!(/^sk-proj-[A-Za-z0-9_-]{30,}$/.test(apiKeyValue) || /^[a-zA-Z0-9]{30,}$/.test(apiKeyValue))) {
      messageContainer.style.display = "grid";
      messageContainer.style.visibility = 'visible';
      iconMessage.textContent = "\u26A0"; // Unicode escape for ⚠️
      iconMessage.style.color = "yellow";
      document.getElementById('message').style.color = "red";
      document.getElementById("message").textContent = "Invalid API key format.";
    } 
    else {
      const encryptedKey = btoa(apiKeyValue); 
      // Send the API key to background.js
      chrome.runtime.sendMessage({ type: 'setApiKey', encryptedKey }, (response) => {
        if (response.success) {
          // Show success message to user
          messageContainer.style.display = "grid";
          messageContainer.style.visibility = 'visible';
          iconMessage.style.visibility = "visible";
          iconMessage.textContent = "\u2705"; // Unicode escape for ✅
          iconMessage.style.color = "green"; 
          document.getElementById('message').style.color = "green"; // Optional: Style the message
          document.getElementById("message").textContent = "Your API key was saved successfully!";
          chrome.storage.local.set({ popupMessage: "" });
          apiKeyInput.value = "";
          checkApiKey.style.display = "block";
          removeApiKey.style.display = "block";

        } else {
          // Show error message to user
          messageContainer.style.display = "grid";
          document.getElementById('message').textContent = "There was an error saving your API key.";
          document.getElementById('message').style.color = "red"; // Optional: Style the message
        }
      });

    }
  });

  // check api key
  checkApiKey.addEventListener('click', function () {
    messageContainer.style.display = "none";
    showSpinner();
    messageContainer.style.visibility = 'hidden';
    document.getElementById("api-key-message").textContent = "";
    iconMessage.textContent = "";
    iconElement.textContent = "";
    apiKeyInput.value = "";
    const checkApiKeyMessage = "";

    // Check the API key in the background.js
    chrome.runtime.sendMessage({ type: 'checkApiKey', }, (response) => {

      if (response.apiMessage) {
        messageContainer.style.display = "grid";
        messageContainer.style.visibility = 'visible';
        // Set failure icon and message
        iconMessage.textContent = "\u26A0"; // Unicode escape for ⚠️
        iconMessage.style.color = "yellow";
        iconMessage.style.visibility = 'visible';
        document.getElementById("message").style.color = "red";
        document.getElementById("message").textContent = "Please provide an API key!";
        hideSpinner();
      } else {
        if (response.errorMessage) {
          hideSpinner();
          showError(`\u274C ${response.errorMessage}`);
          // Set failure icon and message
          iconElement.textContent = "\u274C"; // Unicode escape for ❌
          iconElement.className = "failure"; // Red color
          // Display the error message
          messageElement.textContent = response.errorMessage;

        }
        else {
          showError("\u2705 Your API key is valid");
          hideSpinner();

          iconElement.textContent = "\u2705"; // Unicode escape for ✅
          iconElement.className = "success"; // Green color
          messageElement.textContent = "Your API key is valid";
        }
      }

    });

  });

});