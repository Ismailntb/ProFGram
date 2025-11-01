# Profogram - Instagram Profile Photo Downloader

Instantly retrieve and download high-resolution Instagram profile photos from public accounts.

## 🚀 Features

- Fetch high-resolution Instagram profile photos
- Download HD images from public profiles
- Modern, responsive UI with gradient design
- Real-time profile information display
- Toast notifications for user feedback
- Keyboard shortcuts for better UX

## 📋 Setup Instructions

### 1. Get RapidAPI Access

1. Sign up for a free account at [RapidAPI](https://rapidapi.com/)
2. Subscribe to the [Instagram120 API](https://rapidapi.com/instagram120-instagram120-default/api/instagram120)
3. Copy your API key from the RapidAPI dashboard

### 2. Configure the Application

Open `main.js` and find the `CONFIG` object at the top of the file (around line 4):

```javascript
const CONFIG = {
    RAPIDAPI_KEY: 'YOUR_RAPIDAPI_KEY_HERE', // ⚠️ REPLACE THIS
    RAPIDAPI_HOST: 'instagram120.p.rapidapi.com',
    API_ENDPOINT: 'https://instagram120.p.rapidapi.com/api/instagram/posts',
};
```

Replace `'YOUR_RAPIDAPI_KEY_HERE'` with your actual RapidAPI key.

### 3. Run the Application

#### Option A: Simple Local Server (Recommended)

Using Python:
```bash
python -m http.server 8000
```

Using Node.js:
```bash
npx http-server
```

Then open `http://localhost:8000` in your browser.

#### Option B: Open Directly

Simply open `index.html` in your web browser. Note: Some browsers may block API requests due to CORS policies when opening files directly.

## 🔒 Security Notes

**IMPORTANT:** The current implementation exposes the API key in the frontend code. This is acceptable for:
- Local development
- Personal use
- Testing purposes

**For production deployment**, you should:

1. Create a backend server (Node.js, Python, PHP, etc.)
2. Store the API key securely on the server (environment variables)
3. Create a proxy endpoint that handles RapidAPI requests
4. Update the frontend to call your backend instead of RapidAPI directly

### Example Backend Proxy (Node.js/Express)

```javascript
const express = require('express');
const app = express();

app.post('/api/v1/fetch', async (req, res) => {
    const { username } = req.body;
    
    try {
        const response = await fetch('https://instagram120.p.rapidapi.com/api/instagram/posts', {
            method: 'POST',
            headers: {
                'x-rapidapi-host': 'instagram120.p.rapidapi.com',
                'x-rapidapi-key': process.env.RAPIDAPI_KEY, // Secure!
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, maxId: '' })
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000);
```

## 🎯 Usage

1. Enter an Instagram username (e.g., `@instagram`) or profile URL (e.g., `https://instagram.com/instagram`)
2. Click "Fetch Profile"
3. View the profile information and preview
4. Click "Download HD Profile Photo" to save the image

## ⚠️ Important Notes

- **Only public profiles are supported** - Private profiles cannot be accessed
- **No login required** - The service only accesses publicly available data
- **Rate limits apply** - Based on your RapidAPI subscription plan
- **Compliance** - Service complies with Instagram's Terms of Service
- **No PII collection** - No personal information is stored or collected

## 🛠️ Troubleshooting

### "API key not configured" error
- Make sure you've replaced `YOUR_RAPIDAPI_KEY_HERE` with your actual API key in `main.js`

### CORS errors
- Use a local server (see Setup step 3) instead of opening `index.html` directly
- Or deploy with a backend proxy (recommended for production)

### 403 Forbidden errors
- Check that your RapidAPI key is valid
- Verify you're subscribed to the Instagram120 API on RapidAPI
- Check your RapidAPI subscription status and limits

### 429 Rate Limit errors
- You've exceeded your API quota
- Upgrade your RapidAPI plan or wait for the limit to reset

### Profile not found
- Verify the username is correct
- Check that the profile is public
- Try accessing the profile directly on Instagram first

## 📁 File Structure

```
profogram/
├── index.html          # Main HTML structure
├── styles.css          # All styling and responsive design
├── main.js            # JavaScript logic and API integration
└── README.md          # This file
```

## 🔧 Customization

### Change the Color Scheme

Edit the CSS variables in `styles.css`:

```css
:root {
    --purple-600: #9333ea;
    --pink-600: #db2777;
    --orange-600: #ea580c;
    /* ... more colors */
}
```

### Modify API Endpoint

If you want to use a different API or your own backend, update the `CONFIG` object in `main.js`:

```javascript
const CONFIG = {
    USE_BACKEND_PROXY: true,
    BACKEND_URL: 'https://your-api.com/fetch'
};
```

## 📞 Support

For support or business inquiries, contact: **support@profogram.world**

## 📄 License

This project is for educational and personal use. Ensure compliance with Instagram's Terms of Service and API usage policies.

---

**Disclaimer:** This tool only accesses publicly available Instagram data. It does not bypass privacy settings, require user credentials, or access private profiles. Always respect user privacy and Instagram's Terms of Service.
