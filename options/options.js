document.getElementById('autofillForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the form from submitting normally

    let formData = {};
    // Grab each input element and store its value
    for (let input of event.target.elements) {
        if (input.id) {
            formData[input.id] = input.value;
        }
    }

    // Save the form data into local storage
    chrome.storage.local.set({'autofillData': formData}, function() {
        console.log('Data saved successfully.');
    });
});
