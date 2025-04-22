/* content.js - Amazon Review Scraper & LLM Integration */

// Extract reviews from Amazon product pages
function extractReviews() {
    const reviews = [];
    console.log('🔍 Starting review extraction...');
  
    // Common review container selectors
    const reviewSelectors = [
      '[data-hook="review"]',
      '#cm_cr-review_list .review',
      '.review-views',
      '.review-data'
    ];
  
    let reviewElements = [];
    for (const sel of reviewSelectors) {
      const els = document.querySelectorAll(sel);
      if (els.length) {
        console.log(`✅ Found reviews using selector: ${sel}`);
        reviewElements = els;
        break;
      }
    }
  
    // Fallback: scan for any divs containing review-like text
    if (!reviewElements.length) {
      console.log('⚠️ No standard review nodes, scanning all divs...');
      reviewElements = Array.from(document.querySelectorAll('div')).filter(el => {
        const txt = el.textContent || '';
        return /out of 5 stars/.test(txt) || /Verified Purchase/.test(txt);
      });
    }
  
    console.log(`🔎 Found ${reviewElements.length} potential review elements`);
  
    // Grab product-level info once
    const productTitle = document.querySelector('#productTitle')?.textContent.trim() || '';
    const averageRating = document.querySelector('.a-icon-star .a-icon-alt')?.textContent.trim() || '';
    const totalReviews = document.querySelector('#acrCustomerReviewText')?.textContent.trim() || '';
  
    reviewElements.forEach((el, i) => {
      console.log(`📄 Processing review #${i + 1}`);
      const title = el.querySelector('[data-hook="review-title"], .review-title')?.textContent.trim() || '';
      const rating = el.querySelector('[data-hook="review-star-rating"], .review-rating')?.textContent.trim() || '';
      const body = el.querySelector('[data-hook="review-body"], .review-text')?.textContent.trim() || '';
      const date  = el.querySelector('[data-hook="review-date"]')?.textContent.trim() || '';
      const verified = el.querySelector('[data-hook="avp-badge"]') ? 'Verified Purchase' : '';
      const helpful = el.querySelector('[data-hook="helpful-vote-statement"]')?.textContent.trim() || '';
  
      if (title || body) {
        reviews.push({ title, rating, body, date, verified, helpful, productTitle, averageRating, totalReviews });
        console.log(`✔️  Added review:`, { title, rating });
      }
    });
  
    console.log(`🎉 Extracted ${reviews.length} reviews total.`);
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
      console.log('▶️ Received scrapeAndRun command');
      const reviews = extractReviews();
      if (reviews.length) {
        const payload = formatReviewsPayload(reviews);
        openLLMWithPayload(payload);
        sendResponse({ success: true, count: reviews.length });
      } else {
        sendResponse({ success: false, error: 'No reviews found' });
      }
    }
    return true;
  });
  