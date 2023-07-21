let apiKey = 'API KEY HERE';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === 'autofill') {
        fetchGptResponse(request.pageHTML)
            .then(response => sendResponse({success: true, data: response}))
            .catch(error => sendResponse({success: false, error: error}));

        // Indicate that response will be sent asynchronously
        return true;
    }
});

async function fetchGptResponse(pageHTML) {
    // Fetch user data from storage
    let autofillData = await new Promise(resolve => {
        chrome.storage.local.get('autofillData', function(data) {
            resolve(data.autofillData);
        });
    });

    // Format autofill data as a string
    let autofillDataString = '';
    for (let key in autofillData) {
        autofillDataString += key + ': ' + autofillData[key] + '\n';
    }

    // Construct the prompt
    let prompt = `
        Given the following user autofill data:
        ${autofillDataString}

        And the HTML of a webpage:
        ${pageHTML}

        Please provide the most plausible autofill suggestions. For each suggestion, identify the CSS selector of the form field and associate it with the appropriate user data key. Separate the CSS selector and the data key with a comma. List each suggestion on a new line.
    `;

    // Make the API request
    let response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'prompt': prompt,
            'max_tokens': 200
        })
    });

    // Parse the response
    let gptResponse = await response.json();

    return gptResponse;
}
