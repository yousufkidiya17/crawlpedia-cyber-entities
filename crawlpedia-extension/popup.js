document.getElementById("spawnBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id && tab.url && !tab.url.startsWith("chrome://") && !tab.url.startsWith("edge://")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
    window.close();
  }
});

document.getElementById("dismissBtn").addEventListener("click", async () => {
