document.getElementById('analyzeButton').addEventListener('click', async () => {
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
    chrome.tabs.sendMessage(tab.id, { action: "scrapeOneReview" }, (response) => {
        if (response.success) {
            const { reviewTitle, reviewStars, reviewText } = response;
            showStatus('Review scraped successfully!', 'success');
            console.log(reviewStars)
            showScrapedData({reviewTitle, reviewStars});
            
            // Send the review to the background script
            // chrome.runtime.sendMessage({
            //     action: "openLLM",
            //     reviewTitle,
            //     reviewStars,
            //     reviewText
            //   });
              
        } else {
            showStatus('No review text found on this page!', 'error');
        }
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