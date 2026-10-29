chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-crawler") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id && tab.url && !tab.url.startsWith("chrome://") && !tab.url.startsWith("edge://")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
    }
  }
});
