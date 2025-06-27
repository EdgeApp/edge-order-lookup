# Order Lookup Integration Options

Here are the main ways you can integrate the order lookup functionality into other systems:

## 1. **API Endpoint** (Recommended)

### Setup
```bash
npm install
npm start
```

### API Endpoints
- `GET /api/lookup/:orderId` - Look up an order by ID
- `POST /api/lookup` - Look up an order (send orderId in body)
- `GET /api/health` - Health check

### Example Usage
```javascript
// GET request
const response = await fetch('https://your-api.com/api/lookup/550e8400-e29b-41d4-a716-446655440000');
const result = await response.json();

// POST request
const response = await fetch('https://your-api.com/api/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: '550e8400-e29b-41d4-a716-446655440000' })
});
```

### Response Format
```json
{
    "success": true,
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "results": [
        {
            "name": "Moonpay",
            "description": "Cryptocurrency payment processor",
            "fullUrl": "https://buy.moonpay.com/transaction_receipt?transactionId=550e8400-e29b-41d4-a716-446655440000",
            "key": "moonpay"
        },
        {
            "name": "Simplex",
            "description": "Cryptocurrency payment processor", 
            "fullUrl": "https://checkout.simplex.com/transaction/550e8400-e29b-41d4-a716-446655440000",
            "key": "simplex"
        }
    ],
    "count": 2
}
```

## 2. **Zendesk Chatbot Integration**

### Features
- Automatically detects order IDs in chat messages
- Provides rich responses with clickable buttons
- Handles both UUID and 14-character formats
- Error handling and user-friendly messages

### Implementation
```javascript
const { OrderLookupBot } = require('./zendesk-integration');

const bot = new OrderLookupBot();

// In your Zendesk chatbot handler
const response = await bot.handleMessage(userMessage, visitor);
```

### Example Chat Flow
```
User: "I need help with my order 550e8400-e29b-41d4-a716-446655440000"
Bot: "I found 2 matching service(s) for your order ID: 550e8400-e29b-41d4-a716-446655440000

• Moonpay: Cryptocurrency payment processor
• Simplex: Cryptocurrency payment processor

Click the buttons below to view your order details:"
[View Moonpay Order] [View Simplex Order]
```

## 3. **Slack Bot Integration**

### Example Implementation
```javascript
const { WebClient } = require('@slack/web-api');
const slack = new WebClient(process.env.SLACK_TOKEN);

app.post('/slack/events', async (req, res) => {
    const { text, channel } = req.body.event;
    const orderId = extractOrderId(text);
    
    if (orderId) {
        const results = await lookupOrder(orderId);
        const message = formatSlackMessage(results, orderId);
        
        await slack.chat.postMessage({
            channel,
            ...message
        });
    }
    
    res.sendStatus(200);
});
```

## 4. **Discord Bot Integration**

### Example Implementation
```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    const orderId = extractOrderId(message.content);
    if (orderId) {
        const results = await lookupOrder(orderId);
        const embed = formatDiscordEmbed(results, orderId);
        
        await message.reply({ embeds: [embed] });
    }
});
```

## 5. **Email Integration**

### Example Implementation
```javascript
const nodemailer = require('nodemailer');

// Auto-reply to emails containing order IDs
app.post('/email-webhook', async (req, res) => {
    const { from, subject, body } = req.body;
    const orderId = extractOrderId(body);
    
    if (orderId) {
        const results = await lookupOrder(orderId);
        const emailContent = formatEmailResponse(results, orderId);
        
        await sendEmail(from, 'Order Lookup Results', emailContent);
    }
    
    res.sendStatus(200);
});
```

## 6. **Browser Extension**

### Manifest.json
```json
{
    "manifest_version": 3,
    "name": "Order Lookup Helper",
    "version": "1.0",
    "permissions": ["activeTab"],
    "content_scripts": [{
        "matches": ["<all_urls>"],
        "js": ["content.js"]
    }]
}
```

### Content Script
```javascript
// Auto-detect order IDs on web pages
document.addEventListener('mouseup', () => {
    const selection = window.getSelection().toString();
    const orderId = extractOrderId(selection);
    
    if (orderId) {
        showLookupTooltip(orderId);
    }
});
```

## 7. **Mobile App Integration**

### React Native Example
```javascript
import { Alert } from 'react-native';

const lookupOrder = async (orderId) => {
    try {
        const response = await fetch(`https://your-api.com/api/lookup/${orderId}`);
        const result = await response.json();
        
        if (result.success && result.results.length > 0) {
            const options = result.results.map(r => ({
                text: r.name,
                onPress: () => Linking.openURL(r.fullUrl)
            }));
            
            Alert.alert(
                'Order Found',
                `Found ${result.results.length} matching service(s)`,
                options
            );
        }
    } catch (error) {
        Alert.alert('Error', 'Could not lookup order');
    }
};
```

## 8. **WordPress Plugin**

### Example Plugin Structure
```php
<?php
/*
Plugin Name: Order Lookup Widget
Description: Adds order lookup functionality to WordPress
*/

function order_lookup_shortcode($atts) {
    $order_id = isset($atts['id']) ? $atts['id'] : '';
    
    if ($order_id) {
        $results = call_order_lookup_api($order_id);
        return format_lookup_results($results);
    }
    
    return '<div class="order-lookup-widget">[order_lookup id="ORDER_ID"]</div>';
}

add_shortcode('order_lookup', 'order_lookup_shortcode');
```

## Deployment Options

### 1. **Heroku**
```bash
heroku create your-order-lookup-api
git push heroku main
```

### 2. **Vercel**
```bash
npm install -g vercel
vercel
```

### 3. **AWS Lambda**
```javascript
// serverless.yml
functions:
  lookup:
    handler: api.lookup
    events:
      - http:
          path: /api/lookup/{orderId}
          method: get
```

### 4. **Docker**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Security Considerations

1. **Rate Limiting**: Implement rate limiting to prevent abuse
2. **CORS**: Configure CORS properly for your domain
3. **Input Validation**: Validate order IDs server-side
4. **HTTPS**: Always use HTTPS in production
5. **API Keys**: Consider adding API key authentication for sensitive integrations

## Monitoring & Analytics

- Track API usage and response times
- Monitor for failed lookups
- Log order ID patterns for optimization
- Set up alerts for API downtime 