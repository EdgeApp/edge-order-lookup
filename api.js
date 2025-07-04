const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Partner configurations (same as in script.js)
const partners = {
    banxa: {
        name: 'Banxa',
        pattern: /^\d{6,8}$/,
        url: 'https://edge3.banxa.com/status/',
        description: 'Cryptocurrency payment processor'
    },
    paybis: {
        name: 'Paybis',
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
        url: 'https://payment-status.simplex.com/?#/payment/',
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
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        url: 'https://sophia.bity.com/?id=',
        description: 'Swiss crypto exchange & payment processor'
    }
};

// Cryptocurrency transaction patterns
const cryptoPatterns = {
    evm: {
        name: 'Ethereum / EVM Network',
        pattern: /^0x[0-9a-fA-F]{64}$/,
        description: 'EVM-compatible blockchain transaction',
        getBlockchairUrl: (txId) => `https://blockchair.com/search?q=${txId}`
    },
    bitcoin: {
        name: 'Bitcoin',
        pattern: /^[0-9a-fA-F]{64}$/,
        description: 'Bitcoin transaction',
        getBlockchairUrl: (txId) => `https://blockchair.com/bitcoin/transaction/${txId}`
    },
    solana: {
        name: 'Solana',
        pattern: /^[1-9A-HJ-NP-Za-km-z]{87,88}$/,
        description: 'Solana transaction',
        getBlockchairUrl: (txId) => `https://blockchair.com/solana/transaction/${txId}`
    }
};

// Detect cryptocurrency transaction
function detectCryptoTransaction(txId) {
    // Check EVM first (most specific pattern with 0x prefix)
    if (cryptoPatterns.evm.pattern.test(txId)) {
        return {
            type: 'evm',
            ...cryptoPatterns.evm,
            txId,
            blockchairUrl: cryptoPatterns.evm.getBlockchairUrl(txId)
        };
    }
    
    // Check Solana (base58 encoded, typically 87-88 chars)
    if (cryptoPatterns.solana.pattern.test(txId)) {
        return {
            type: 'solana',
            ...cryptoPatterns.solana,
            txId,
            blockchairUrl: cryptoPatterns.solana.getBlockchairUrl(txId)
        };
    }
    
    // Check Bitcoin last (64 hex chars, but without 0x prefix)
    if (cryptoPatterns.bitcoin.pattern.test(txId)) {
        return {
            type: 'bitcoin',
            ...cryptoPatterns.bitcoin,
            txId,
            blockchairUrl: cryptoPatterns.bitcoin.getBlockchairUrl(txId)
        };
    }
    
    return null;
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

// API Routes
app.get('/api/lookup/:orderId', (req, res) => {
    const { orderId } = req.params;
    
    if (!orderId) {
        return res.status(400).json({
            success: false,
            error: 'Order ID is required'
        });
    }
    
    // Check if it's a cryptocurrency transaction first
    const cryptoTx = detectCryptoTransaction(orderId);
    if (cryptoTx) {
        return res.json({
            success: true,
            orderId,
            isCryptoTransaction: true,
            cryptoDetails: {
                network: cryptoTx.name,
                type: cryptoTx.type,
                description: cryptoTx.description,
                blockchairUrl: cryptoTx.blockchairUrl,
                message: `This is a ${cryptoTx.name} blockchain transaction hash, not an exchange order ID. To track blockchain transactions, please use a blockchain explorer.`
            },
            results: [],
            count: 0
        });
    }
    
    // If not a crypto transaction, look for partner matches
    const results = findMatchingPartners(orderId);
    
    res.json({
        success: true,
        orderId,
        isCryptoTransaction: false,
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
    
    // Check if it's a cryptocurrency transaction first
    const cryptoTx = detectCryptoTransaction(orderId);
    if (cryptoTx) {
        return res.json({
            success: true,
            orderId,
            isCryptoTransaction: true,
            cryptoDetails: {
                network: cryptoTx.name,
                type: cryptoTx.type,
                description: cryptoTx.description,
                blockchairUrl: cryptoTx.blockchairUrl,
                message: `This is a ${cryptoTx.name} blockchain transaction hash, not an exchange order ID. To track blockchain transactions, please use a blockchain explorer.`
            },
            results: [],
            count: 0
        });
    }
    
    // If not a crypto transaction, look for partner matches
    const results = findMatchingPartners(orderId);
    
    res.json({
        success: true,
        orderId,
        isCryptoTransaction: false,
        results,
        count: results.length
    });
});

// Write to stats.json
app.get('/api/stats', async (req, res) => {
    // Write the provider param as an increment to the stats.json file
    const { provider } = req.query;
    
    try {
        // Use async file operations to avoid blocking
        const statsPath = path.join(__dirname, 'stats.json');
        
        // Check if file exists and read current stats
        let stats = {};
        try {
            const statsData = await fs.promises.readFile(statsPath, 'utf8');
            stats = JSON.parse(statsData);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
            // File doesn't exist, start with empty stats object
        }
        
        // Increment the provider count
        stats[provider] = (stats[provider] || 0) + 1;
        
        // Write updated stats back to file
        await fs.promises.writeFile(statsPath, JSON.stringify(stats, null, 2));
        
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error updating stats:', error);
        res.status(500).json({ success: false, error: 'Failed to update stats' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        supportedPartners: Object.keys(partners),
        supportedCryptoNetworks: Object.keys(cryptoPatterns)
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
