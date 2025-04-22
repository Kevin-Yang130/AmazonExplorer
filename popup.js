let cachedReview = null; // store review data between button clicks

document.getElementById('scrapeButton').addEventListener('click', async () => {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on an Amazon product page
    if (!tab.url.includes('amazon.com')) {
        showStatus('Please navigate to an Amazon product page first!', 'error');
        return;
    }

    // Clear previous data
    document.getElementById('scrapedData').style.display = 'none';
    showStatus('Scraping review...', 'success');

    // Send message to content script to scrape one review
    chrome.tabs.sendMessage(tab.id, { action: "scrapeAllReviews" }, (response) => {
        if (response.success) {
            const { reviewTitle, reviewStars, reviewText } = response;
            cachedReview = { reviewTitle, reviewStars, reviewText }; 

            showStatus('Review scraped successfully!', 'success');
            console.log(reviewStars)
            showScrapedData({reviewTitle, reviewStars});
              
        } else {
            showStatus('No review text found on this page!', 'error');
        }
    });
});

document.getElementById('analyzeButton').addEventListener('click', () => {
    if (!cachedReview) {
      showStatus('Please scrape a review first.', 'error');
      return;
    }
    
    chrome.runtime.sendMessage({
        action: "openLLM",
        ...cachedReview
      });
  });
  

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = type;
    statusDiv.style.display = 'block';
}

function showScrapedData({ reviewTitle, reviewStars }) {
    const dataDiv = document.getElementById('scrapedData');
    dataDiv.innerHTML = `
        <h3>${reviewTitle}</h3>
        <h3>Stars: <strong>${reviewStars}</strong></h3>
    `;
    dataDiv.style.display = 'block';
}

