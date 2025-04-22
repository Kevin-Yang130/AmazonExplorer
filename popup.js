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

    // Send message to content script to scrape reviews
    chrome.tabs.sendMessage(tab.id, { action: "scrapeReviews" }, (response) => {
        if (response && response.reviews && response.reviews.length > 0) {
            // Send the reviews to the background script
            chrome.runtime.sendMessage({
                action: "openLLM",
                reviews: response.reviews
            });
        } else {
            alert('No reviews found on this page!');
        }
    });
}); 