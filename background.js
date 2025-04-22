chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openLLM") {
      const reviews = request.reviews;
  
      if (!reviews || reviews.length === 0) {
        console.log("⚠️ No reviews received.");
        return;
      }
  
      console.log(`📦 Received ${reviews.length} reviews`);
  
      // Get saved prompt or fallback to default
      chrome.storage.sync.get(['defaultPrompt'], (result) => {
        const basePrompt = result.defaultPrompt || "Give me a concise list of pros and cons of this product based on these reviews:";
  
        // Build full prompt
        let prompt = `${basePrompt}\n\n`;
  
        reviews.forEach((r, i) => {
          prompt += `Review ${i + 1}:\n`;
          prompt += `Title: ${r.reviewTitle}\n`;
          prompt += `Stars: ${r.reviewStars}\n`;
          prompt += `Text: ${r.reviewText}\n\n`;
        });
  
        // Open ChatGPT and inject the prompt
        chrome.tabs.create({ url: "https://chat.openai.com/", active: true }, (tab) => {
          setTimeout(() => {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (promptText) => {
                const inputDiv = document.querySelector('[contenteditable="true"]');
                if (inputDiv) {
                  inputDiv.innerText = promptText;
                  inputDiv.dispatchEvent(new InputEvent("input", { bubbles: true }));
                  console.log("✅ Prompt inserted into ChatGPT");
                } else {
                  console.log("❌ Could not find contentEditable input");
                }
              },
              args: [prompt]
            });
          }, 3000); 
        });
      }); 
    } 
  }); 
  