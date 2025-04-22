chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "openLLM") {
      const { reviewTitle, reviewStars, reviewText } = request;

      console.log("Title: " + reviewTitle)
      console.log("Stars: " +reviewStars)
      console.log("text: " + reviewText)

      const prompt = `Give me a concise list of pros and cons of this product given these reviews: \n\n${reviewText}`;
    
      // Open ChatGPT
      chrome.tabs.create({ url: "https://chat.openai.com/", active: true }, (tab) => {
        // Wait for the tab to load, then inject code
        setTimeout(() => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (promptText) => {
              const inputDiv = document.querySelector('[contenteditable="true"]');
  
              if (inputDiv) {
                inputDiv.innerText = promptText;
  
                inputDiv.dispatchEvent(
                  new InputEvent("input", { bubbles: true })
                );
  
                console.log("Prompt inserted into ChatGPT");
              } else {
                console.log("Could not find contentEditable input");
              }
            },
            args: [prompt]
          });
        }, 3000); 
      });
    }
  });
  