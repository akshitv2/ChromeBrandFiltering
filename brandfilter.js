async function fetchAndFormat() {
    const response = await fetch('https://api.example.com/data.json');
    const data = await response.json();

    // Assuming the array is under a property named 'items'
    const items = data.items;

    const result = items.join('%2A');
    console.log(result);
}

fetchAndFormat();