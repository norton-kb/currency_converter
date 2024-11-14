// Select DOM elements
const dropList = document.querySelectorAll('.drop-list select');
const fromCurrency = document.querySelector('.from select');
const toCurrency = document.querySelector('.to select');
const getButton = document.querySelector("form button");

// Initialize the drop-down lists with currency options and flags
for (let i = 0; i < dropList.length; i++) {
    // Loop through currency codes (Assumed country_code object exists with currency codes and country flags)
    for (currency_code in country_code) {
        let selected = "";
        if (i === 0) {
            selected = currency_code === "USD" ? "selected" : "";
        } else if (i === 1) {
            selected = currency_code === "NPR" ? "selected" : "";
        }
        // Create option tags dynamically for each currency
        let optionTag = `<option value="${currency_code}" ${selected}>${currency_code}</option>`;
        dropList[i].insertAdjacentHTML("beforeend", optionTag);
    }
    
    // Add event listeners to update flag when currency selection changes
    dropList[i].addEventListener("change", (e) => {
        loadFlag(e.target);
    });
}

// Function to load the appropriate flag for the selected currency
function loadFlag(element) {
    for (code in country_code) {
        if (code === element.value) {
            let imgTag = element.parentElement.querySelector("img");
            imgTag.src = `https://flagsapi.com/${country_code[code]}/flat/64.png`;
        }
    }
}

// Fetch exchange rate when page loads
window.addEventListener("load", () => {
    getExchangeRate();
});

// Get exchange rate when the "Convert" button is clicked
getButton.addEventListener("click", (e) => {
    e.preventDefault();
    getExchangeRate();
});

// Swap currencies when the exchange icon is clicked
const exchangeIcon = document.querySelector(".drop-list .icon");
exchangeIcon.addEventListener("click", () => {
    // Swap the values of the "From" and "To" currency
    let tempCode = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = tempCode;
    
    // Update the flags for the swapped currencies
    loadFlag(fromCurrency);
    loadFlag(toCurrency);
    
    // Fetch exchange rate again after swapping
    getExchangeRate();
});

// Function to fetch the exchange rate from the API
function getExchangeRate() {
    const amount = document.querySelector(".amount input");
    const exchangeRatetxt = document.querySelector(".exchange-rate");
    let amountVal = amount.value;

    // Default to 1 if the input is empty or zero
    if (amountVal === "" || amountVal === "0") {
        amount.value = "1";
        amountVal = 1;
    }

    // Display loading message
    exchangeRatetxt.innerText = "Getting Exchange Rate...";

    // Construct the API URL with the base currency (fromCurrency)
    let url = `https://v6.exchangerate-api.com/v6/44f785b8844aa36cf630eb32/latest/${fromCurrency.value}`;

    // Fetch the exchange rate data from the API
    fetch(url)
        .then((response) => response.json())
        .then((result) => {
            // Extract the exchange rate for the selected "To" currency
            let exchangeRate = result.conversion_rates[toCurrency.value];
            // Calculate the total conversion amount
            let totalExchangeRate = (amountVal * exchangeRate).toFixed(2);
            
            // Display the result
            exchangeRatetxt.innerText = `${amountVal} ${fromCurrency.value} = ${totalExchangeRate} ${toCurrency.value}`;
            
            // Add the conversion result to the history
            addToHistory(amountVal, fromCurrency.value, totalExchangeRate, toCurrency.value);
        })
        .catch(() => {
            // Handle errors (e.g., API failure)
            exchangeRatetxt.innerText = "Something went wrong";
        });
}

// DARK MODE TOGGLE FUNCTIONALITY

// Select the dark mode switch checkbox and elements to be affected
const darkModeSwitch = document.getElementById('darkModeSwitch');
const body = document.body;
const wrapper = document.querySelector('.wrapper');
const historySection = document.querySelector('.history');

// Load the user's dark mode preference from localStorage (if any)
if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    wrapper.classList.add('dark-mode');
    historySection.classList.add('dark-mode');
    darkModeSwitch.checked = true;
}

// Toggle dark mode when the switch is toggled
darkModeSwitch.addEventListener('change', () => {
    if (darkModeSwitch.checked) {
        // Activate dark mode
        body.classList.add('dark-mode');
        wrapper.classList.add('dark-mode');
        historySection.classList.add('dark-mode');
        // Save preference in localStorage
        localStorage.setItem('darkMode', 'enabled');
    } else {
        // Deactivate dark mode
        body.classList.remove('dark-mode');
        wrapper.classList.remove('dark-mode');
        historySection.classList.remove('dark-mode');
        // Save preference in localStorage
        localStorage.setItem('darkMode', 'disabled');
    }
});

// HISTORY FUNCTIONALITY

// Select the history list element
const historyList = document.getElementById('historyList');
// Retrieve any saved conversion history from localStorage (if any)
let conversionHistory = JSON.parse(localStorage.getItem('conversionHistory')) || [];

// Function to add a conversion result to the history
function addToHistory(fromAmount, fromCurrency, toAmount, toCurrency) {
    const historyItem = `${fromAmount} ${fromCurrency} = ${toAmount} ${toCurrency}`;
    // Add the new history item to the history array
    conversionHistory.push(historyItem);
    // Save the updated history in localStorage
    localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));

    // Display the new history item in the history list
    const historyElement = document.createElement('li');
    historyElement.textContent = historyItem;
    historyList.appendChild(historyElement);
}

// Load and display existing conversion history from localStorage when the page loads
conversionHistory.forEach((item) => {
    const historyElement = document.createElement('li');
    historyElement.textContent = item;
    historyList.appendChild(historyElement);
});
