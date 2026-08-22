async function loadAllowedBrands() {
    const jsonUrl = chrome.runtime.getURL("brands.json");
    const response = await fetch(jsonUrl);
    const brands = await response.json();
    return brands.map((b) => b.toLowerCase().trim());
}

function getSelectors() {
    const hostname = window.location.hostname;

    if (hostname.includes("myntra.com")) {
        return {
            product: "li.product-base",
            brand: "h3.product-brand"
        };
    }

    if (hostname.includes("amazon.in")) {
        return {
            product: "div[data-component-type='s-search-result']",
            brand: "h2 span, .a-size-medium.a-color-base"
        };
    }

    return null;
}

function filterProducts(allowedBrands) {
    const selectors = getSelectors();
    if (!selectors) return;

    const productItems = document.querySelectorAll(selectors.product);

    productItems.forEach((item) => {
        const brandElement = item.querySelector(selectors.brand);
        const brandName = brandElement ? brandElement.textContent.trim().toLowerCase() : "";

        const isAllowed = allowedBrands.some((brand) => brandName.includes(brand));

        if (!isAllowed) {
            item.style.display = "none";
        }
    });
}

async function init() {
    const allowedBrands = await loadAllowedBrands();

    // Initial filter
    filterProducts(allowedBrands);

    // Filter dynamic/scrolled content
    const observer = new MutationObserver(() => filterProducts(allowedBrands));
    observer.observe(document.body, { childList: true, subtree: true });
}

init();