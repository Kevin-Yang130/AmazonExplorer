function extractAllReviews() {
    console.log('Extracting all reviews...');
  
    const reviewElements = document.querySelectorAll('.fdbk-container__details__comment span');
    const reviews = [];
    
    if (reviewElements && reviewElements.length > 0) {
        console.log(`Found ${reviewElements.length} reviews`);
        
        reviewElements.forEach((element, index) => {
            const reviewText = element.textContent.trim();
            if (reviewText) {
                reviews.push({
                    reviewText,
                    reviewTitle: null,
                    reviewStars: null,
                });
                console.log(`Extracted review #${index + 1}`);
            }
        });
    } 
    
    return {
        success: reviews.length > 0,
        reviews
    };
}
  
// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeAllReviews") {
        const reviewData = extractAllReviews();
        sendResponse(reviewData);
    }
    return true;
});