// Function to send HTML content to the background script
function fetchGptResponse(htmlContent) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            contentScriptQuery: "fetchGptResponse", 
            pageHTML: htmlContent
        }, function(response) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}

// On user action, collect the current page's HTML
document.addEventListener('YOUR_USER_ACTION', function() {
    let pageHTML = document.documentElement.outerHTML;
    
    // Send the HTML to the background script
    chrome.runtime.sendMessage({message: 'autofill', pageHTML: pageHTML}, function(response) {
        if (response.success) {
            let gptResponse = response.data;

            // Fetch user data from storage
            chrome.storage.local.get('autofillData', function(data) {
                let autofillData = data.autofillData;

                for (let suggestion of gptResponse.choices[0].text.split("\n")) {
                    let [cssSelector, dataKey] = suggestion.split(',');

                    // Use the CSS selector to locate the form field
                    let formField = document.querySelector(cssSelector.trim());

                    // Apply the corresponding data to the form field
                    if (formField && autofillData[dataKey]) {
                        formField.value = autofillData[dataKey];
                    }
                }
            });
        } else {
            console.error('Error:', response.error);
        }
    });
});

