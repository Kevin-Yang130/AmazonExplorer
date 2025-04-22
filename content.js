function extractOneReview() {
    console.log('Starting to extract one review...');
    
    // Try to find the first review text
    const reviewText = document.querySelector('[data-hook="review-body"]')?.textContent.trim();
    
    if (reviewText) {
        console.log('Found review text:', reviewText);
        return reviewText;
    } else {
        console.log('No review text found');
        return null;
    }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeOneReview") {
        console.log('Received scrapeOneReview request');
        const reviewText = extractOneReview();
        sendResponse({ reviewText });
    }
    return true;
});