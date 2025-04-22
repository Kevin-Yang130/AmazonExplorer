let cachedReviews = []; // store multiple reviews

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
    // chrome.tabs.sendMessage(tab.id, { action: "scrapeAllReviews" }, (response) => {
    //     if (response.success) {
    //         const { reviewTitle, reviewStars, reviewText } = response;
    //         cachedReview = { reviewTitle, reviewStars, reviewText }; 

    //         showStatus('Review scraped successfully!', 'success');
    //         console.log(reviewStars)
    //         showScrapedData({reviewTitle, reviewStars});
              
    //     } else {
    //         showStatus('No review text found on this page!', 'error');
    //     }
    // });

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
  
    // Build a full prompt to send to ChatGPT
    const prompt = buildPromptFromReviews(cachedReviews);
  
    chrome.runtime.sendMessage({
      action: "openLLM",
      promptText: prompt
    });
  });
  

// document.getElementById('analyzeButton').addEventListener('click', () => {
//     if (!cachedReview) {
//       showStatus('Please scrape a review first.', 'error');
//       return;
//     }
    
//     chrome.runtime.sendMessage({
//         action: "openLLM",
//         ...cachedReview
//       });
//   });
  

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = type;
    statusDiv.style.display = 'block';
}

// function showScrapedData({ reviewTitle, reviewStars }) {
//     const dataDiv = document.getElementById('scrapedData');
//     dataDiv.innerHTML = `
//         <h3>${reviewTitle}</h3>
//         <h3>Stars: <strong>${reviewStars}</strong></h3>
//     `;
//     dataDiv.style.display = 'block';
// }

function showScrapedData(reviews) {
    const dataDiv = document.getElementById('scrapedData');
  
    dataDiv.innerHTML = reviews.map(r => {
      const starCount = Math.round(r.reviewStars || 0);
      const stars = '⭐'.repeat(starCount);
  
      return `
        <div style="margin-bottom: 1em;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>${r.reviewTitle}</strong>
            <span style="font-size: 1.2em;">${stars}</span>
          </div>
          <em>${r.reviewText}</em>
        </div>
      `;
    }).join('');
  
    dataDiv.style.display = 'block';
  }
  
  