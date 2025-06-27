# Order Lookup Tool

A modern, responsive web application for looking up cryptocurrency order details from various payment processors and exchange services.

## Overview

This is a cloned and enhanced version of the original order lookup tool from [David Coen's website](https://resources.davidcoen.it/ordercheck/). The tool helps users find their cryptocurrency transaction details by entering their order ID and matching it with the appropriate service provider.

## Features

- **Modern UI/UX**: Clean, responsive design with smooth animations
- **Multi-Provider Support**: Supports Moonpay, Simplex, ChangeNow, and LetsExchange
- **Smart Pattern Matching**: Automatically detects order ID format and suggests relevant providers
- **Real-time Search**: Instant results with loading states
- **Mobile Responsive**: Works perfectly on all device sizes
- **Accessibility**: Keyboard navigation and screen reader friendly

## Supported Order ID Formats

### UUID Format (Moonpay & Simplex)
- **Pattern**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Example**: `550e8400-e29b-41d4-a716-446655440000`

### 14-Character Format (ChangeNow & LetsExchange)
- **Pattern**: `xxxxxxxxxxxxxx` (14 alphanumeric characters)
- **Example**: `1234567890abcd`

### Bity Reference Format
- **Pattern**: 8-12 alphanumeric characters (e.g., A1B2C3D4)
- **Example**: `A1B2C3D4`

## How to Use

1. Open `index.html` in your web browser
2. Enter your order ID in the input field
3. Click "Search" or press Enter
4. View the matching service providers
5. Click "View Order Details" to open the transaction page

## File Structure

```
order-lookup/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Local Development

To run this locally:

1. Clone or download the files to your local machine
2. Open `index.html` in any modern web browser
3. No server setup required - it's a static website

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Customization

### Adding New Providers

To add a new payment processor or exchange service, edit the `partners` object in `script.js`:

```javascript
const partners = {
    // ... existing partners
    newprovider: {
        name: 'New Provider',
        pattern: /^your-pattern-here$/,
        url: 'https://provider.com/transaction/',
        description: 'Provider description'
    }
};
```

### Styling Changes

The CSS uses CSS custom properties and modern features. Main color scheme and styling can be modified in `styles.css`.

## Original Source

This project is based on the original order lookup tool by David Coen, available at: https://resources.davidcoen.it/ordercheck/

## License

This is a personal project for educational and development purposes. Please respect the original creator's work.

## Contributing

Feel free to fork this project and make improvements. Some ideas for enhancement:

- Add more payment processors
- Implement order status checking
- Add transaction history
- Create a mobile app version
- Add dark mode support # Force Vercel redeploy
