// DOM elements
const orderIdInput = document.getElementById('orderId');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('results');
const resultsContent = document.getElementById('resultsContent');
const clearBtn = document.getElementById('clearBtn');

// Partner configurations
const partners = {
    banxa: {
        name: 'Banxa',
        // Banxa order IDs are strictly 6-8 digit numeric (confirmed by docs and support)
        pattern: /^\d{6,8}$/,
        url: 'https://edge3.banxa.com/status/',
        description: 'Cryptocurrency payment processor'
    },
    paybis: {
        name: 'Paybis',
        // Paybis uses PB-prefixed alphanumeric format
        pattern: /^PB[A-Z0-9]{10,15}$/i,
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
        url: 'https://payment-status.simplex.com/#/',
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
    },
    bity: {
        name: 'Bity',
        // Bity now uses UUID format
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        url: 'https://go.bity.com/order-status?reference=',
        description: 'Swiss crypto exchange & payment processor'
    }
};

const simpleIconsLinks = {
  moonpay: "https://cdn.simpleicons.org/moonpay",
  simplex: "https://cdn.simpleicons.org/simplex",
  changenow: "https://cdn.simpleicons.org/changenow",
  bity: "https://cdn.simpleicons.org/bity"
  // banxa, paybis, letsexchange: fallback to letter
};

// Event listeners
searchBtn.addEventListener('click', handleSearch);
clearBtn.addEventListener('click', clearResults);
orderIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Add input animation
orderIdInput.addEventListener('input', (e) => {
    if (e.target.value.length > 0) {
        e.target.classList.add('has-value');
    } else {
        e.target.classList.remove('has-value');
    }
});

// Search functionality with improved UX
async function handleSearch() {
    const orderId = orderIdInput.value.trim();
    
    if (!orderId) {
        shakeInput();
        return;
    }
    
    // Disable button during search
    searchBtn.disabled = true;
    searchBtn.classList.add('loading');
    
    // Show loading state
    showLoading();
    
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const matches = findMatchingPartners(orderId);
    displayResults(matches, orderId);
    
    // Re-enable button
    searchBtn.disabled = false;
    searchBtn.classList.remove('loading');
}

// Shake animation for empty input
function shakeInput() {
    orderIdInput.classList.add('shake');
    setTimeout(() => {
        orderIdInput.classList.remove('shake');
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

// Display search results with explanations for multiple matches
function displayResults(results, orderId) {
    if (results.length === 0) {
        resultsContent.innerHTML = `
            <div class="no-results">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
                No matching service found for order ID: <strong>${escapeHtml(orderId)}</strong>
                <br>Please check the format and try again.
            </div>
        `;
    } else {
        let explanation = '';
        if (results.length > 1) {
            explanation = `
                <div class="results-explanation">
                    <span>⚠️ This order format could match more than one partner. Please click the partner you used for this order.</span>
                </div>
            `;
        }
        const resultsHTML = results.map((result, index) => {
            // For Paybis, always use the static link
            const link = result.key === 'paybis' ? 'https://payb.is' : result.fullUrl;
            return `
            <div class="result-item" style="animation-delay: ${index * 0.1}s">
                <div class="result-icon ${result.key}">
                    ${getPartnerIcon(result.key)}
                </div>
                <div class="result-content">
                    <div class="result-title">${result.name}</div>
                    <div class="result-description">${result.description}</div>
                    <a href="${link}" target="_blank" rel="noopener noreferrer" class="result-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15,3 21,3 21,9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        View Order Status
                    </a>
                    ${result.key === 'paybis' ? '<div class="result-note">⚠️ Login may be required to view order status</div>' : ''}
                </div>
            </div>
            `;
        }).join('');
        
        resultsContent.innerHTML = explanation + resultsHTML;
    }
    
    resultsContainer.style.display = 'block';
    
    // Smooth scroll to results
    setTimeout(() => {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Get partner icon
function getPartnerIcon(key) {
    const logos = {
        banxa: '<img src="logos/banxa/Banxa Icon RGB.png" alt="Banxa" style="width: 100%; height: 100%; object-fit: contain;">',
        paybis: '<img src="logos/paybis/new2.webp" alt="Paybis" style="width: 100%; height: 100%; object-fit: contain;">',
        moonpay: '<img src="logos/moonpay/Moonpay Logo (1).png" alt="Moonpay" style="width: 100%; height: 100%; object-fit: contain;">',
        simplex: '<img src="logos/simplex/Simplex Nuvei Logo Negative.png" alt="Simplex" style="width: 100%; height: 100%; object-fit: contain;">',
        bity: '<img src="logos/bity/Bity Logo 200x200.jpeg" alt="Bity" style="width: 100%; height: 100%; object-fit: contain;">'
    };
    
    // Return logo if available, otherwise return letter icon
    if (logos[key]) {
        return logos[key];
    }
    
    // Fallback to letter icons for partners without logos
    const icons = {
        changenow: 'C',
        letsexchange: 'L'
    };
    
    return icons[key] || key.charAt(0).toUpperCase();
}

// Show loading state
function showLoading() {
    resultsContent.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <span>Searching for order details...</span>
        </div>
    `;
    resultsContainer.style.display = 'block';
}

// Clear results with animation
function clearResults() {
    resultsContainer.classList.add('fade-out');
    setTimeout(() => {
        resultsContainer.style.display = 'none';
        resultsContainer.classList.remove('fade-out');
        resultsContent.innerHTML = '';
        orderIdInput.value = '';
        orderIdInput.classList.remove('has-value');
        orderIdInput.focus();
    }, 300);
}

// Escape HTML for security
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Focus on input when page loads
    orderIdInput.focus();
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        
        .shake {
            animation: shake 0.5s ease-in-out;
        }
        
        .fade-out {
            animation: fadeOut 0.3s ease-out forwards;
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translateY(-10px);
            }
        }
        
        .search-button.loading {
            pointer-events: none;
            opacity: 0.7;
        }
        
        .search-button.loading span {
            opacity: 0;
        }
        
        .search-button.loading::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            border: 2px solid transparent;
            border-top-color: currentColor;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        
        .result-item {
            animation: slideInFade 0.5s ease-out forwards;
            opacity: 0;
        }
        
        @keyframes slideInFade {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});

// Log helpful information
console.log('%cEdge Order Lookup Tool', 'color: #4be28c; font-size: 20px; font-weight: bold;');
console.log('%cSupported order formats:', 'color: #94a3b8; font-size: 14px;');
console.log('%c• Banxa: 6-8 digit numeric', 'color: #e2e8f0; font-size: 12px;');
console.log('%c• Paybis: PB-prefixed alphanumeric', 'color: #e2e8f0; font-size: 12px;');
console.log('%c• Moonpay/Simplex: UUID format', 'color: #e2e8f0; font-size: 12px;');
console.log('%c• ChangeNow/LetsExchange: 14-character', 'color: #e2e8f0; font-size: 12px;');
console.log('%c• Bity: UUID format', 'color: #e2e8f0; font-size: 12px;'); 