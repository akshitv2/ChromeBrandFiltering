let observer = null;


async function loadAllowedBrands() {
    const jsonUrl = chrome.runtime.getURL("brands.json");
    const response = await fetch(jsonUrl);
    const brands = await response.json();
    return brands.map((b) => b.toLowerCase().trim());
}

function getSelectors() {
    const hostname = window.location.hostname;
    if (hostname.includes("myntra.com")) {
        return { product: "li.product-base", brand: "h3.product-brand" };
    }
    if (hostname.includes("amazon.in")) {
        return { product: "div[data-component-type='s-search-result']", brand: "h2 span, .a-size-medium.a-color-base" };
    }
    return null;
}

function applyFilter(allowedBrands, isEnabled) {
    const selectors = getSelectors();
    if (!selectors) return;

    const productItems = document.querySelectorAll(selectors.product);

    productItems.forEach((item) => {
        if (!isEnabled) {
            item.style.display = ""; // Reset visibility
            return;
        }

        const brandElement = item.querySelector(selectors.brand);
        const brandName = brandElement ? brandElement.textContent.trim().toLowerCase() : "";
        const isAllowed = allowedBrands.some((brand) => brandName.includes(brand));

        item.style.display = isAllowed ? "" : "none";
    });
}

async function init() {
    const allowedBrands = await loadAllowedBrands();

    // Check initial state (defaults to true)
    const { extensionEnabled = true } = await chrome.storage.local.get("extensionEnabled");
    applyFilter(allowedBrands, extensionEnabled);

    // Watch DOM changes
    observer = new MutationObserver(() => {
        chrome.storage.local.get("extensionEnabled", ({ extensionEnabled = true }) => {
            applyFilter(allowedBrands, extensionEnabled);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Listen for state toggle events
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === "local" && "extensionEnabled" in changes) {
            applyFilter(allowedBrands, changes.extensionEnabled.newValue);
        }
    });
}

init();