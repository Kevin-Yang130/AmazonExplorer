# Review Analyzer Chrome Extension

This Chrome extension scrapes reviews from Amazon and Ebay product pages for analysis using LLMs (ChatGPT, DeepSeek, etc.). Users will be able to obtain review titles, stars, and text content, and then be brought to an LLM webpage of choice to paste in the reviews for summarization. The goal of this extension is to make the process of obtaining more detailed information from reviews quickly (beyond just average star rating) much easier.

## Features

- Scrapes reviews from Amazon and Ebay product pages
- Configurable default prompt for analysis
- Automatically opens LLM chat interface with formatted reviews
- Supports multiple LLM platforms (ChatGPT, DeepSeek)

# Known Bugs and Incomplete Features
- No known bugs
- Possible feature of saving scraped reviews and having the option to put multiple into LLM for comparison

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to any Amazon product page with reviews
2. Click the extension icon in your Chrome toolbar
3. Click "Analyze Reviews"
4. The extension will:
   - Scrape the reviews from the page
   - Open a new tab with your preferred LLM
   - Paste the formatted reviews and your default prompt

## Configuration

1. Click the extension icon
2. Click "Configure Default Prompt"
3. Enter your preferred prompt for analyzing reviews
4. Click "Save"

## Default Prompt Example

```
Please analyze these Amazon reviews and provide a concise list of pros and cons of the product:
```

## Notes

- The extension works best on Amazon product pages with reviews
- Make sure you're logged into your preferred LLM platform before using the extension
- The extension currently supports ChatGPT and DeepSeek, but can be modified to support other LLM platforms 