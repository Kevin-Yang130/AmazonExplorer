/* ebay-content.js - eBay Review Scraper & LLM Integration */

console.log('eBay content script loaded!');

// Basic message listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Message received in eBay content script:', request);
  sendResponse({success: true, count: 0});
  return true;
});

// Extract reviews from eBay product pages
function extractEbayReviews() {
    const reviews = [];
    console.log('🔍 Starting eBay review extraction...');
  
    // Get product information
    const productTitle = document.querySelector('h1.x-item-title__mainTitle')?.textContent.trim() || 
                       document.querySelector('h1.product-title')?.textContent.trim() || '';
    
    // Get overall rating if available
    const ratingElement = document.querySelector('.star-ratings') || 
                        document.querySelector('.ebay-star-rating');
    const averageRating = ratingElement ? ratingElement.textContent.trim() : '';
    
    // Get total reviews count if available
    const totalReviewsElement = document.querySelector('.fdbk-container__count');
    const totalReviews = totalReviewsElement ? totalReviewsElement.textContent.trim() : '';
  
    // Target the specific container with review cards
    const reviewCards = document.querySelectorAll('ul.fdbk-detail-list__cards > li.fdbk-container');
  
    console.log(`🔎 Found ${reviewCards.length} eBay review cards`);
  
    reviewCards.forEach((card, i) => {
      console.log(`📄 Processing eBay review #${i + 1}`);
      
      // Get rating stars (typically has aria-label with the rating)
      const ratingEl = card.querySelector('.fdbk-container__stars');
      const rating = ratingEl ? (ratingEl.getAttribute('aria-label') || ratingEl.textContent.trim()) : '';
      
      // Get the review text
      const body = card.querySelector('.fdbk-container__details')?.textContent.trim() || '';
      
      // Get reviewer info and date
      const reviewerEl = card.querySelector('.fdbk-container__details-heading');
      const reviewer = reviewerEl ? reviewerEl.textContent.trim() : '';
      
      // Get date from the container
      const dateEl = card.querySelector('.fdbk-container__date');
      const date = dateEl ? dateEl.textContent.trim() : '';
      
      // Get if reviewer is a verified buyer
      const verifiedEl = card.querySelector('.fdbk-container__verified');
      const verified = verifiedEl ? 'Verified Buyer' : '';
      
      // Helpful votes (if available)
      const helpfulEl = card.querySelector('.fdbk-container__helpful');
      const helpful = helpfulEl ? helpfulEl.textContent.trim() : '';
      
      // Construct a title from the rating or first part of the review
      const title = rating || (body.length > 30 ? body.substring(0, 30) + '...' : body);
  
      if (body) {
        reviews.push({ 
          title, 
          rating, 
          text: body, 
          date, 
          reviewer,
          verified,
          helpful,
          productTitle,
          productRating: averageRating,
          totalReviews
        });
        console.log(`✔️ Added eBay review:`, { title, rating });
      }
    });
  
    console.log(`🎉 Extracted ${reviews.length} eBay reviews total.`);
    return reviews;
  }
  
  // Format the reviews into a single text block
  function formatReviewsPayload(reviews) {
    return reviews.map((r, idx) => (
      `Review ${idx+1}:
  Title: ${r.title}
  Rating: ${r.rating}
  Date: ${r.date}
  Verified: ${r.verified}
  Helpful: ${r.helpful}
  Content: ${r.text}
  ---`
    )).join('\n');
  }
  
  // Open new LLM tab and copy prompt+reviews to clipboard
  function openLLMWithPayload(text) {
    // Retrieve user-defined default prompt
    chrome.storage.sync.get(['defaultPrompt'], ({ defaultPrompt = '' }) => {
      const fullPrompt = `${defaultPrompt}\n\n${text}`;
  
      // Copy to clipboard
      navigator.clipboard.writeText(fullPrompt)
        .then(() => {
          console.log('📋 Prompt copied to clipboard. Opening ChatGPT...');
          window.open('https://chat.openai.com/', '_blank');
        })
        .catch(err => console.error('❌ Clipboard write failed:', err));
    });
  }
  
  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action === 'scrapeAndRun') {
      console.log('▶️ Received scrapeAndRun command for eBay page');
      const reviews = extractEbayReviews();
      if (reviews.length) {
        const payload = formatReviewsPayload(reviews);
        openLLMWithPayload(payload);
        sendResponse({ success: true, count: reviews.length });
      } else {
        sendResponse({ success: false, error: 'No eBay reviews found' });
      }
    }
    return true;
  });