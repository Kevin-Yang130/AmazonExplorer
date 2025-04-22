/* ebay-content.js - eBay Review Scraper & LLM Integration */

function extractOneReview() {
    console.log('Starting to extract one review...');
    
    // Try to find the first review text
    const reviewElement = document.querySelector('.fdbk-container__details__comment span');
    const reviewText = reviewElement?.textContent.trim();
    
    if (reviewText) {
        console.log('Found review text:', reviewText);
        return reviewText;
    } else {
        console.log('No review text found');
        return null;
    }
}

function extractAllReviews() {
    console.log('Starting to extract all reviews...');
    
    // Try to find all review containers with the correct selector
    const reviewElements = document.querySelectorAll('.fdbk-container__details__comment span');
    const reviews = [];
    
    if (reviewElements && reviewElements.length > 0) {
        console.log(`Found ${reviewElements.length} reviews`);
        
        reviewElements.forEach((element, index) => {
            const reviewText = element.textContent.trim();
            if (reviewText) {
                reviews.push(reviewText);
                console.log(`Extracted review #${index + 1}`);
            }
        });
        
        return reviews;
    } else {
        console.log('No reviews found');
        return [];
    }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeOneReview") {
        console.log('Received scrapeOneReview request');
        const reviewText = extractOneReview();
        sendResponse({ reviewText });
    } else if (request.action === "scrapeAllReviews") {
        console.log('Received scrapeAllReviews request');
        const reviews = extractAllReviews();
        sendResponse({ reviews });
    }
    return true;
});