document.getElementById('analyzeButton').addEventListener('click', async () => {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on a supported product page
    const isAmazon = tab.url.includes('amazon.com');
    const isEbay = tab.url.includes('ebay.com');
    
    if (!isAmazon && !isEbay) {
        alert('Please navigate to an Amazon or eBay product page first!');
        return;
    }

    // Clear previous data
    document.getElementById('scrapedData').style.display = 'none';
    showStatus('Scraping review...', 'success');

    // Send message to content script to scrape one review
    chrome.tabs.sendMessage(tab.id, { action: "scrapeAllReviews" }, (response) => {
        if (response && response.reviews) {
            showStatus('Reviews scraped successfully!', 'success');
            showScrapedData(response.reviews.join('\n'));
            
            // Send the review to the background script
            // chrome.runtime.sendMessage({
            //     action: "openLLM",
            //     reviewText: response.reviews
            // });
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

function showScrapedData(text) {
    const dataDiv = document.getElementById('scrapedData');
    dataDiv.textContent = text;
    dataDiv.style.display = 'block';
} 