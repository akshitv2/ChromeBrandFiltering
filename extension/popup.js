const toggle = document.getElementById("toggleExtension");

// Load active state
chrome.storage.local.get("extensionEnabled", ({ extensionEnabled = true }) => {
    toggle.checked = extensionEnabled;
});

// Update state on toggle
toggle.addEventListener("change", () => {
    chrome.storage.local.set({ extensionEnabled: toggle.checked });
});