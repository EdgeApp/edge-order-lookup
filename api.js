const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Partner configurations (same as in script.js)
const partners = {
    moonpay: {
        name: 'Moonpay',
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        url: 'https://buy.moonpay.com/transaction_receipt?transactionId=',
        description: 'Cryptocurrency payment processor'
    },
    simplex: {
        name: 'Simplex',
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        url: 'https://checkout.simplex.com/transaction/',
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

// API Routes
app.get('/api/lookup/:orderId', (req, res) => {
    const { orderId } = req.params;
    
    if (!orderId) {
        return res.status(400).json({
            success: false,
            error: 'Order ID is required'
        });
    }
    
    const results = findMatchingPartners(orderId);
    
    res.json({
        success: true,
        orderId,
        results,
        count: results.length
    });
});

// POST endpoint for more flexibility
app.post('/api/lookup', (req, res) => {
    const { orderId } = req.body;
    
    if (!orderId) {
        return res.status(400).json({
            success: false,
            error: 'Order ID is required in request body'
        });
    }
    
    const results = findMatchingPartners(orderId);
    
    res.json({
        success: true,
        orderId,
        results,
        count: results.length
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        supportedPartners: Object.keys(partners)
    });
});

// Serve static files (optional - for the web interface)
app.use(express.static('.'));

app.listen(PORT, () => {
    console.log(`Order Lookup API running on port ${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  GET  /api/lookup/:orderId`);
    console.log(`  POST /api/lookup`);
    console.log(`  GET  /api/health`);
    console.log(`  Web interface: http://localhost:${PORT}`);
}); 