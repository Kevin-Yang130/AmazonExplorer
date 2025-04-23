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
  
    const reviewElements = document.querySelectorAll('[data-hook="review"]');
    const reviews = [];
  
    reviewElements.forEach((el, i) => {
      // Get review title (fallback: no title element shown in your screenshot)
      const titleAnchor = el.querySelector('[data-hook="review-title"]');
const directSpans = titleAnchor?.querySelectorAll(':scope > span') || [];
const reviewTitle = directSpans[1]?.textContent.trim() || '(No title)';




  
      // Get stars rating from alt text like "5.0 out of 5 stars"
      const starEl = el.querySelector('[data-hook="review-star-rating"] .a-icon-alt');
      const starText = starEl?.textContent.trim() || '';
      const reviewStars = parseFloat(starText) || null;
  
      // Get review body text
      const bodyEl = el.querySelector('[data-hook="review-collapsed"]') || el.querySelector('[data-hook="review-body"]');
      const reviewText = bodyEl?.textContent.trim() || '';
  
      if (reviewText) {
        reviews.push({
          reviewTitle,
          reviewStars,
          reviewText,
        });
  
        console.log(`Review ${i + 1}`);
        console.log(`Review title: ` + reviewTitle);
        console.log(`Review Stars: ` + reviewStars);
        console.log(`Review Text: ` + reviewText);


      } else {
        console.log(`Skipping review ${i + 1} — no body text found.`);
      }
    });
  
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