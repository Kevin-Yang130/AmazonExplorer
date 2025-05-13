// Initialize reviews from storage when popup opens
let cachedReviews = [];

// Load existing reviews when popup opens
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['savedReviews'], (result) => {
    if (result.savedReviews) {
      cachedReviews = result.savedReviews;
      
      // Show status if we have reviews
      if (cachedReviews.length > 0) {
        showStatus(`${cachedReviews.length} reviews loaded from last scraping`, 'success');
        showScrapedData(cachedReviews.slice(0, 6));
      }
    }
  });
  
  document.getElementById('aboutMeLink').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://winniewngg.github.io/hugo-mock-landing-page-autodeployed/' });
  });
});

document.getElementById('scrapeButton').addEventListener('click', async () => {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on an Amazon product page
    if (!tab.url.includes('amazon.com') && !tab.url.includes('ebay.com')) {
        showStatus('Please navigate to an Amazon or eBay product page first!', 'error');
        return;
    }

    // Clear previous data display but not stored reviews
    document.getElementById('scrapedData').style.display = 'none';
    showStatus('Scraping review...', 'success');

    chrome.tabs.sendMessage(tab.id, { action: "scrapeAllReviews" }, (response) => {
        if (response.success && response.reviews.length > 0) {
          cachedReviews = response.reviews;

          // Save to storage
          chrome.storage.local.set({ savedReviews: cachedReviews });
          
          showStatus(`Total reviews scraped: ${response.reviews.length}`, 'success');
    
          // Show first 6 reviews in popup for preview
          showScrapedData(response.reviews.slice(0, 6));
        } else {
          showStatus('No reviews found on this page!', 'error');
        }
    });
});

document.getElementById('analyzeButton').addEventListener('click', () => {
    if (cachedReviews.length === 0) {
      showStatus('Please scrape reviews first.', 'error');
      return;
    }
  
    chrome.runtime.sendMessage({
        action: "openLLM",
        reviews: cachedReviews 
    });
});

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = type;
    statusDiv.style.display = 'block';
}

function showScrapedData(reviews) {
    const dataDiv = document.getElementById('scrapedData');
  
    dataDiv.innerHTML = reviews.map(r => {
      let starsHtml = '';
      if (r.reviewStars) {
        const starCount = Math.round(r.reviewStars);
        starsHtml = `<span style="font-size: 1.2em;">${'⭐'.repeat(starCount)}</span>`;
      }

      let reviewTitleHtml = '';
      if (r.reviewTitle) {
        reviewTitleHtml = `<strong>${r.reviewTitle}</strong>`;
      }
  
      let reviewTextHtml = '';
      if (r.reviewText) {
        reviewTextHtml = `<em>${r.reviewText}</em>`;
      }
  
      return `
        <div style="margin-bottom: 1em;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            ${reviewTitleHtml}
            ${starsHtml}
          </div>
          ${reviewTextHtml}
        </div>
      `;
    }).join('');
  
    dataDiv.style.display = 'block';
}
  
  