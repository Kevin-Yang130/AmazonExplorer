let cachedReviews = []; // store multiple reviews

document.getElementById('scrapeButton').addEventListener('click', async () => {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on an Amazon product page
    if (!tab.url.includes('amazon.com') && !tab.url.includes('ebay.com')) {
        showStatus('Please navigate to an Amazon or eBay product page first!', 'error');
        return;
    }

    // Clear previous data
    document.getElementById('scrapedData').style.display = 'none';
    showStatus('Scraping review...', 'success');

    chrome.tabs.sendMessage(tab.id, { action: "scrapeAllReviews" }, (response) => {
        if (response.success && response.reviews.length > 0) {
          cachedReviews = response.reviews; // save array of reviews
          showStatus(`Scraped ${cachedReviews.length} reviews!`, 'success');
    
          // Show first 3 reviews in popup for preview
          showScrapedData(cachedReviews.slice(0, 6));
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
  
  