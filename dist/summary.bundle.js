(() => {
  // summary.js
  (function() {
    document.addEventListener("DOMContentLoaded", () => {
      if (document.getElementById("review-summary-panel")) return;
      chrome.runtime.sendMessage({ action: "requestSummaryData" }, (response) => {
        if (!response || !response.reviews) return;
        const reviews = response.reviews;
        const counts = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
        reviews.forEach((r) => {
          const score = parseInt(r.rating[0]);
          counts[score] = (counts[score] || 0) + 1;
        });
        const panel = document.createElement("div");
        panel.id = "review-summary-panel";
        panel.innerHTML = '<h3>Review Summary</h3><canvas id="stars-chart"></canvas>';
        document.body.appendChild(panel);
        const ctx = document.getElementById("stars-chart").getContext("2d");
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["1\u2605", "2\u2605", "3\u2605", "4\u2605", "5\u2605"],
            datasets: [{
              label: "Count",
              data: [counts["1"], counts["2"], counts["3"], counts["4"], counts["5"]],
              backgroundColor: "rgba(0,0,0,0.1)"
              // default styling
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
})();
