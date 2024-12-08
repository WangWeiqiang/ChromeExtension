// Open the popup when the extension icon is clicked
chrome.action.onClicked.addListener(function(tab) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        chrome.action.openPopup();
      }
    });
});
 
function get_url_extension( url ) {
  const regex = /([^\/]+)\.([^\/]+)$/i;

  // Apply the regex to the URL
  const match = url.match(regex);

  // Check if there is a match
  if (match) {
    // Get the file name from the first capture group
    const filemaWithoutExtension = match[1];

    // Get the file extension from the second capture group
    const fileExtension = match[2];
    return {filemaWithoutExtension,fileExtension}
  }
  else
  {
    return {};
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.images) {
      const customName = request.customName;
      const images = request.images;
  
      images.forEach((img, index) => {
        const sequenceNumber = index + 1;
        const extension = get_url_extension(img.url).fileExtension;
        const fileName = request.customName!=""? `${customName}-${sequenceNumber}.${extension}` :img.url.substring(img.url.lastIndexOf('/') + 1); // Customize the filename as needed
        chrome.downloads.download({ url: img.url, filename: fileName });
      });
    }

    
    
});
