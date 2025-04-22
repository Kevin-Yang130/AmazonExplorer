// summary.js - Renders summary charts in a floating panel
(function() {
    // Wait until the page and content script run
    document.addEventListener('DOMContentLoaded', () => {
      // Only inject once
      if (document.getElementById('review-summary-panel')) return;
  
      // Request scraped reviews from content script
      chrome.runtime.sendMessage({ action: 'requestSummaryData' }, (response) => {
        if (!response || !response.reviews) return;
        const reviews = response.reviews;
  
        // Compute rating distribution
        const counts = { '1':0,'2':0,'3':0,'4':0,'5':0 };
        reviews.forEach(r => {
          const score = parseInt(r.rating[0]); // assumes format "5.0 out of 5 stars"
          counts[score] = (counts[score] || 0) + 1;
        });
  
        // Create panel container
        const panel = document.createElement('div');
        panel.id = 'review-summary-panel';
        panel.innerHTML = '<h3>Review Summary</h3><canvas id="stars-chart"></canvas>';
        document.body.appendChild(panel);
  
        // Render star histogram
        const ctx = document.getElementById('stars-chart').getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['1★','2★','3★','4★','5★'],
            datasets: [{
              label: 'Count',
              data: [counts['1'],counts['2'],counts['3'],counts['4'],counts['5']],
              backgroundColor: 'rgba(0,0,0,0.1)' // default styling
            }]
          },
          options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
          }
        });
      });
    });
  })();