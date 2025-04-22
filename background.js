chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openLLM") {
        // Get the default prompt from storage
        chrome.storage.sync.get(['defaultPrompt'], function(result) {
            const defaultPrompt = result.defaultPrompt || "Please analyze these Amazon reviews and provide a concise list of pros and cons of the product:";
            
            // Get product details from the first review
            const productDetails = request.reviews[0];
            
            // Format the reviews for the prompt
            const formattedReviews = request.reviews.map((review, index) => 
                `Review ${index + 1}:
Title: ${review.title}
Rating: ${review.rating}
Date: ${review.date}
${review.verified ? 'Status: ' + review.verified + '\n' : ''}${review.helpfulVotes ? 'Helpful Votes: ' + review.helpfulVotes + '\n' : ''}
Review Text:
${review.text}

-------------------`
            ).join('\n\n');

            const fullPrompt = `${defaultPrompt}

Product: ${productDetails.productTitle}
Overall Rating: ${productDetails.productRating}
Total Reviews: ${productDetails.totalReviews}

Here are the reviews:

${formattedReviews}`;

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