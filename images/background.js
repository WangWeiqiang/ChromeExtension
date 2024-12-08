// background.js

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.action.openPopup();
  });
  