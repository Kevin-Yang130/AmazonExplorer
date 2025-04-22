// Load saved prompt when options page opens
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(['defaultPrompt'], function(result) {
        document.getElementById('defaultPrompt').value = result.defaultPrompt || '';
    });
});

// Save the prompt when the save button is clicked
document.getElementById('saveButton').addEventListener('click', function() {
    const prompt = document.getElementById('defaultPrompt').value;
    chrome.storage.sync.set({ defaultPrompt: prompt }, function() {
        // Show success message
        const status = document.getElementById('status');
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
        }, 2000);
    });
}); 