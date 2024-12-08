const images = Array.from(document.querySelectorAll("img")).map(img => img.src);

// Store the collected images in local storage
chrome.storage.local.set({ "images": images });
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  if (request.refresh) {
    
    const images = Array.from(document.querySelectorAll("img")).map(img => img.src);

    // Store the collected images in local storage
    chrome.storage.local.set({ "images": images });

    chrome.runtime.sendMessage({ refresh: true });
  }
});