chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openLLM") {
        // Get the default prompt from storage
        chrome.storage.sync.get(['defaultPrompt'], function(result) {
            const defaultPrompt = result.defaultPrompt || "Please analyze this Amazon review:";
            
            const fullPrompt = `${defaultPrompt}

${request.reviewText}`;

            // Open the LLM tab (default to ChatGPT)
            chrome.tabs.create({
                url: 'https://chat.openai.com/',
                active: true
            }, function(tab) {
                // Wait for the tab to load
                setTimeout(() => {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: (prompt) => {
                            // Find the textarea and paste the content
                            const textarea = document.querySelector('textarea');
                            if (textarea) {
                                textarea.value = prompt;
                                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        },
                        args: [fullPrompt]
                    });
                }, 2000); // Wait 2 seconds for the page to load
            });
        });
    }
}); 