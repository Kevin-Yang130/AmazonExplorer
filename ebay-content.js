/* ebay-content.js - eBay Review Scraper & LLM Integration */

// Extract reviews from eBay product pages
function extractEbayReviews() {
    const reviews = [];
    console.log('🔍 Starting eBay review extraction...');
  
    // Get product information
    const productTitle = document.querySelector('h1.x-item-title__mainTitle')?.textContent.trim() || 
                       document.querySelector('h1.product-title')?.textContent.trim() || '';
    
    // Look for overall product rating
    const ratingElement = document.querySelector('div.reviews-star-rating span.star-rating') || 
                        document.querySelector('div.ebay-star-rating') || 
                        document.querySelector('span.sar-rating');
    const averageRating = ratingElement ? ratingElement.textContent.trim() : '';
    
    // Look for total review count
    const totalReviewsElement = document.querySelector('div.reviews-total-rating') || 
                              document.querySelector('a.reviews-read-all') ||
                              document.querySelector('span.product-reviews-count');
    const totalReviews = totalReviewsElement ? totalReviewsElement.textContent.trim() : '';
  
    // Find review containers in different possible eBay layouts
    const reviewContainers = document.querySelectorAll('div.review-item, div.ebay-review-section, div.review-card, div.ux-review-item');
  
    console.log(`🔎 Found ${reviewContainers.length} potential review elements`);
  
    // Extract each review
    reviewContainers.forEach((el, i) => {
      console.log(`📄 Processing eBay review #${i + 1}`);
      
      // Extract review details based on different possible eBay layouts
      const title = el.querySelector('.review-title, .review-heading, .ux-review-title')?.textContent.trim() || '';
      
      // Extract rating (could be stars, text, or numeric)
      let rating = '';
      const ratingEl = el.querySelector('.ebay-star-rating, .review-rating, .ux-star-rating');
      if (ratingEl) {
        // Could be text or could have aria-label with rating
        rating = ratingEl.getAttribute('aria-label') || ratingEl.textContent.trim();
      }
      
      const body = el.querySelector('.review-content, .review-text, .ux-review-text')?.textContent.trim() || '';
      const date = el.querySelector('.review-item-date, .review-date, .ux-review-date')?.textContent.trim() || '';
      
      // eBay equivalent of verified purchase
      const verifiedEl = el.querySelector('.review-item-verified, .review-verified, .ux-review-verified');
      const verified = verifiedEl ? 'Verified Purchase' : '';
      
      // Helpful votes
      const helpfulEl = el.querySelector('.review-helpful-votes, .review-helpful, .ux-review-helpful');
      const helpful = helpfulEl ? helpfulEl.textContent.trim() : '';
  
      if (title || body) {
        reviews.push({ title, rating, body, date, verified, helpful, productTitle, averageRating, totalReviews });
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
  Content: ${r.body}
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