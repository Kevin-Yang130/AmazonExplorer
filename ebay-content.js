function extractOneReview() {
    console.log('Starting to extract one review...');
    
    // Try to find the first review text
    const reviewHeader = document.querySelector('[data-hook="review-title"]');
    const spans = reviewHeader?.querySelectorAll('span') || [];
    const reviewTitle = spans.length ? spans[spans.length - 1].textContent.trim(): "";

    const titleSpan = document.querySelector('[data-hook="review-title"] span:not(.a-letter-space)');
    const reviewStars = titleSpan?.textContent.trim()[0] || "";

    const reviewText = document.querySelector('[data-hook="review-collapsed"]')?.textContent.trim();

    if (!reviewText) {
        console.log('No review text found');
        return { success: false };
    }
    console.log("Review Title: " + reviewTitle)
    console.log("Review stars: " + reviewStars)
    console.log("Review Text: " + reviewText)


    return {
        success:true,
        reviewTitle,
        reviewStars,
        reviewText,
      };
}

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