function extractOneReview() {
    console.log('Starting to extract one review...');
    
    // Try to find the first review text
    const titleEl = document.querySelector('[data-hook="review-title"]');
    const spans = titleEl?.querySelectorAll('span') || [];
    const reviewTitle = spans.length
      ? spans[spans.length - 1].textContent.trim()
      : "";

    

    const reviewText = document.querySelector('[data-hook="review-collapsed"]')?.textContent.trim();
    
    if (reviewText) {
        console.log('Review Title:', reviewTitle);
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
        sendResponse({ reviewText});
    }
    return true;
});