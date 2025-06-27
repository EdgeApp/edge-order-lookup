// Zendesk Chatbot Integration Example
// This shows how to integrate the order lookup functionality into a Zendesk chatbot

// Configuration
const API_BASE_URL = 'https://your-api-domain.com'; // Replace with your deployed API URL

// Zendesk Chatbot Integration
class OrderLookupBot {
    constructor() {
        this.apiUrl = API_BASE_URL;
    }

    // Main handler for Zendesk chatbot
    async handleMessage(message, context) {
        const orderId = this.extractOrderId(message);
        
        if (!orderId) {
            return {
                type: 'text',
                content: "I can help you look up your cryptocurrency order! Please share your order ID and I'll find the relevant transaction details for you."
            };
        }

        try {
            const results = await this.lookupOrder(orderId);
            return this.formatResponse(results, orderId);
        } catch (error) {
            console.error('Lookup error:', error);
            return {
                type: 'text',
                content: "Sorry, I couldn't process your order ID. Please make sure it's a valid order ID and try again."
            };
        }
    }

    // Extract order ID from user message
    extractOrderId(message) {
        // Look for UUID pattern
        const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const uuidMatch = message.match(uuidPattern);
        if (uuidMatch) return uuidMatch[0];

        // Look for 14-character pattern
        const char14Pattern = /\b[a-zA-Z0-9]{14}\b/;
        const char14Match = message.match(char14Pattern);
        if (char14Match) return char14Match[0];

        return null;
    }

    // Call the lookup API
    async lookupOrder(orderId) {
        const response = await fetch(`${this.apiUrl}/api/lookup/${orderId}`);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        return await response.json();
    }

    // Format response for Zendesk chatbot
    formatResponse(apiResponse, orderId) {
        if (!apiResponse.success || apiResponse.count === 0) {
            return {
                type: 'text',
                content: `I couldn't find any matching services for order ID: ${orderId}. Please check the order ID and try again.`
            };
        }

        const results = apiResponse.results;
        
        // Create rich message with buttons
        const buttons = results.map(result => ({
            type: 'button',
            text: `View ${result.name} Order`,
            value: result.fullUrl,
            style: 'primary'
        }));

        const message = `I found ${results.length} matching service(s) for your order ID: ${orderId}\n\n` +
            results.map(result => `• **${result.name}**: ${result.description}`).join('\n') +
            '\n\nClick the buttons below to view your order details:';

        return {
            type: 'rich_message',
            content: {
                text: message,
                buttons: buttons
            }
        };
    }

    // Alternative: Simple text response
    formatSimpleResponse(apiResponse, orderId) {
        if (!apiResponse.success || apiResponse.count === 0) {
            return {
                type: 'text',
                content: `No matching services found for order ID: ${orderId}`
            };
        }

        const results = apiResponse.results;
        const links = results.map(result => 
            `${result.name}: ${result.fullUrl}`
        ).join('\n');

        return {
            type: 'text',
            content: `Found ${results.length} matching service(s) for order ID: ${orderId}\n\n${links}`
        };
    }
}

// Example usage in Zendesk chatbot
const bot = new OrderLookupBot();

// Example message handler (adapt to your Zendesk setup)
async function handleZendeskMessage(message, visitor) {
    return await bot.handleMessage(message, { visitor });
}

// Export for use in other modules
module.exports = {
    OrderLookupBot,
    handleZendeskMessage
};

// Example usage:
/*
// In your Zendesk chatbot code:
const { handleZendeskMessage } = require('./zendesk-integration');

// When a message comes in:
const response = await handleZendeskMessage(userMessage, visitor);
// Send response back to user
*/ 