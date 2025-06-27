// DOM elements
const orderIdInput = document.getElementById('orderId');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('results');
const resultsContent = document.getElementById('resultsContent');
const clearBtn = document.getElementById('clearBtn');

// Partner configurations - FIXED with correct URLs and patterns
const partners = {
    banxa: {
        name: 'Banxa',
        pattern: /^\d{6,8}$/, // 6-8 digit numeric IDs like 17258381
        url: 'https://edge3.banxa.com/status/',
        description: 'Cryptocurrency payment processor'
    },
    paybis: {
        name: 'Paybis',
        pattern: /^[A-Z0-9]{10,15}$/, // Alphanumeric IDs like PB25014430124TX8
        url: 'https://onramp.payb.is/?requestId=',
        description: 'Cryptocurrency payment processor'
    },
    moonpay: {
        name: 'Moonpay',
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        url: 'https://buy.moonpay.com/transaction_receipt?transactionId=',
        description: 'Cryptocurrency payment processor'
    },
    simplex: {
        name: 'Simplex',
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        url: 'https://payment-status.simplex.com/#/', // FIXED URL
        description: 'Cryptocurrency payment processor'
    },
    changenow: {
        name: 'ChangeNow',
        pattern: /^[a-zA-Z0-9]{14}$/,
        url: 'https://changenow.io/exchange/',
        description: 'Cryptocurrency exchange service'
    },
    letsexchange: {
        name: 'LetsExchange',
        pattern: /^[a-zA-Z0-9]{14}$/,
        url: 'https://letsexchange.io/exchange/',
        description: 'Cryptocurrency exchange service'
    }
};

// Event listeners
searchBtn.addEventListener('click', handleSearch);
clearBtn.addEventListener('click', clearResults);
orderIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Search functionality
function handleSearch() {
    const orderId = orderIdInput.value.trim();
    
    if (!orderId) {
        showError('Please enter an order ID');
        return;
    }
    
    // Show loading state
    showLoading();
    
    // Simulate API call delay
    setTimeout(() => {
        const results = findMatchingPartners(orderId);
        displayResults(results, orderId);
    }, 500);
}

// Find matching partners based on order ID pattern
function findMatchingPartners(orderId) {
    const matches = [];
    
    for (const [key, partner] of Object.entries(partners)) {
        if (partner.pattern.test(orderId)) {
            matches.push({
                ...partner,
                key,
                fullUrl: partner.url + orderId
            });
        }
    }
    
    return matches;
}

// Display search results
function displayResults(results, orderId) {
    if (results.length === 0) {
        showError(`No matching partners found for order ID: ${orderId}`);
        return;
    }
    
    const resultsHTML = results.map(result => `
        <div class="result-item">
            <div class="result-icon ${result.key}">
                ${result.name.charAt(0)}
            </div>
            <div class="result-content">
                <div class="result-title">${result.name}</div>
                <div class="result-description">${result.description}</div>
                <a href="${result.fullUrl}" target="_blank" rel="noopener noreferrer" class="result-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15,3 21,3 21,9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    View Order Details
                </a>
            </div>
        </div>
    `).join('');
    
    resultsContent.innerHTML = resultsHTML;
    resultsContainer.style.display = 'block';
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Show loading state
function showLoading() {
    resultsContent.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            Searching for order details...
        </div>
    `;
    resultsContainer.style.display = 'block';
}

// Show error message
function showError(message) {
    resultsContent.innerHTML = `
        <div class="error">
            ${message}
        </div>
    `;
    resultsContainer.style.display = 'block';
}

// Clear results
function clearResults() {
    resultsContainer.style.display = 'none';
    resultsContent.innerHTML = '';
    orderIdInput.value = '';
    orderIdInput.focus();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Focus on input when page loads
    orderIdInput.focus();
});

// Add some helpful console messages
console.log('Order Lookup Tool loaded successfully!');
console.log('Supported order ID formats:');
console.log('- Banxa: 6-8 digit numeric (e.g., 17258381)');
console.log('- Paybis: 10-15 character alphanumeric (e.g., PB25014430124TX8)');
console.log('- Moonpay/Simplex: UUID format (e.g., 5a062495-c006-4e91-b243-f5c9880079a7)');
console.log('- ChangeNow/LetsExchange: 14-char format (e.g., 1234567890abcd)'); 