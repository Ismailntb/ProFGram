// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // RapidAPI Configuration
    // Get your API key from: https://rapidapi.com/
    // Subscribe to Instagram120 API: https://rapidapi.com/instagram120-instagram120-default/api/instagram120
    RAPIDAPI_KEY: 'YOUR_RAPIDAPI_KEY_HERE', // ⚠️ REPLACE THIS WITH YOUR ACTUAL API KEY
    RAPIDAPI_HOST: 'instagram120.p.rapidapi.com',
    API_ENDPOINT: 'https://instagram120.p.rapidapi.com/api/instagram/posts',
    
    // For production, use a backend proxy instead of exposing the API key:
    // USE_BACKEND_PROXY: true,
    // BACKEND_URL: 'https://api.profogram.world/api/v1/fetch'
};

// ============================================
// DOM Elements
// ============================================
const fetchForm = document.getElementById('fetchForm');
const usernameInput = document.getElementById('usernameInput');
const fetchButton = document.getElementById('fetchButton');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const profilePreview = document.getElementById('profilePreview');
const profileImage = document.getElementById('profileImage');
const profileUsername = document.getElementById('profileUsername');
const profileFullName = document.getElementById('profileFullName');
const profileFollowers = document.getElementById('profileFollowers');
const downloadButton = document.getElementById('downloadButton');
const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toastTitle');
const toastDescription = document.getElementById('toastDescription');

// ============================================
// State
// ============================================
let currentProfileData = null;

// Helper Functions
function extractUsername(input) {
    // Extract username from URL or @username
    if (input.includes('instagram.com/')) {
        const match = input.match(/instagram\.com\/([^/?]+)/);
        return match ? match[1] : input;
    }
    return input.replace('@', '');
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function showToast(title, description) {
    toastTitle.textContent = title;
    toastDescription.textContent = description;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showLoading() {
    loadingSpinner.classList.remove('hidden');
    profilePreview.classList.add('hidden');
    fetchButton.disabled = true;
    usernameInput.disabled = true;
    
    // Update button text
    const buttonText = fetchButton.querySelector('.button-text');
    const buttonIcon = fetchButton.querySelector('.button-icon');
    
    buttonIcon.innerHTML = `
        <svg class="button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 0.8s linear infinite;">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
    `;
    buttonText.textContent = 'Fetching...';
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
    fetchButton.disabled = false;
    usernameInput.disabled = false;
    
    // Reset button
    const buttonText = fetchButton.querySelector('.button-text');
    const buttonIcon = fetchButton.querySelector('.button-icon');
    
    buttonIcon.innerHTML = `
        <svg class="button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
        </svg>
    `;
    buttonText.textContent = 'Fetch Profile';
}

function displayProfile(profileData) {
    currentProfileData = profileData;
    
    profileImage.src = profileData.profileImageUrl;
    profileImage.alt = `${profileData.username}'s profile photo`;
    profileUsername.textContent = `@${profileData.username}`;
    profileFullName.textContent = profileData.fullName;
    profileFollowers.textContent = `${formatNumber(profileData.followers)} followers`;
    
    profilePreview.classList.remove('hidden');
}

async function fetchProfile(input) {
    hideError();
    showLoading();
    
    try {
        // Extract username from input
        const username = extractUsername(input);
        
        // Validate API key is configured
        if (CONFIG.RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY_HERE') {
            throw new Error('API key not configured. Please add your RapidAPI key to the CONFIG object in main.js');
        }
        
        // Make request to Instagram API via RapidAPI
        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'x-rapidapi-host': CONFIG.RAPIDAPI_HOST,
                'x-rapidapi-key': CONFIG.RAPIDAPI_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                maxId: ''
            })
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Profile not found. Please check the username.');
            } else if (response.status === 403) {
                throw new Error('API key invalid or access denied. Please check your RapidAPI credentials.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        
        const data = await response.json();
        console.log('API Response:', data); // For debugging
        
        // Parse the response and extract profile information
        // The response structure may vary, adjust based on actual API response
        let profileData;
        
        if (data && data.data && data.data.user) {
            // If the API returns user data directly
            const user = data.data.user;
            profileData = {
                username: user.username || username,
                fullName: user.full_name || user.name || 'Instagram User',
                profileImageUrl: user.profile_pic_url_hd || user.profile_pic_url || user.hd_profile_pic_url_info?.url || '',
                downloadUrl: user.profile_pic_url_hd || user.profile_pic_url || user.hd_profile_pic_url_info?.url || '',
                followers: user.follower_count || user.edge_followed_by?.count || 0,
                isPublic: !user.is_private
            };
        } else if (data && data.user) {
            // Alternative response structure
            const user = data.user;
            profileData = {
                username: user.username || username,
                fullName: user.full_name || user.name || 'Instagram User',
                profileImageUrl: user.profile_pic_url_hd || user.profile_pic_url || '',
                downloadUrl: user.profile_pic_url_hd || user.profile_pic_url || '',
                followers: user.follower_count || 0,
                isPublic: !user.is_private
            };
        } else {
            // Fallback: If we can't parse the response properly, use mock data
            console.warn('Unexpected API response structure:', data);
            throw new Error('Unable to parse profile data. The API response format may have changed.');
        }
        
        // Validate that we have at least a profile image
        if (!profileData.profileImageUrl) {
            throw new Error('Profile image not found in the API response.');
        }
        
        displayProfile(profileData);
        
        // Add to search history
        addToHistory(username);
        
    } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Display appropriate error message
        if (error.message.includes('Rate limit')) {
            showError('Rate limit exceeded. Please try again in a few moments.');
        } else if (error.message.includes('API key')) {
            showError('API configuration error. Please contact support.');
        } else if (error.message.includes('Profile not found')) {
            showError('Profile not found. Please check the username and try again.');
        } else if (error.message.includes('parse profile data')) {
            showError('Unable to retrieve profile data. Please try again later.');
        } else if (error.message.includes('Profile image not found')) {
            showError('Profile image is not available for this account.');
        } else {
            showError('Failed to fetch profile. Please check the username and try again.');
        }
    } finally {
        hideLoading();
    }
}

function downloadProfile() {
    if (!currentProfileData) return;
    
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = currentProfileData.downloadUrl;
    link.download = `${currentProfileData.username}_profile_hd.jpg`;
    link.target = '_blank';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success toast
    showToast(
        'Download started!',
        'Your high-resolution profile photo is being downloaded.'
    );
}

// Event Listeners
fetchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const input = usernameInput.value.trim();
    
    if (!input) {
        showError('Please enter an Instagram username or URL');
        return;
    }
    
    fetchProfile(input);
});

downloadButton.addEventListener('click', downloadProfile);

// Input validation - clear error on input
usernameInput.addEventListener('input', () => {
    if (errorMessage.classList.contains('hidden') === false) {
        hideError();
    }
});

// Example usernames for testing (optional)
// You can remove this section in production
const exampleUsernames = [
    'instagram',
    'natgeo',
    'nasa',
    'cristiano',
    'therock'
];

// Auto-populate with random example on page load (optional - for demo purposes)
// Comment out or remove in production
// window.addEventListener('load', () => {
//     const randomExample = exampleUsernames[Math.floor(Math.random() * exampleUsernames.length)];
//     usernameInput.placeholder = `@username or https://instagram.com/username (try: @${randomExample})`;
// });

// API Integration Notes:
/*
RAPIDAPI INSTAGRAM API INTEGRATION (CURRENT IMPLEMENTATION)

The app is now integrated with RapidAPI's Instagram120 API.

SETUP INSTRUCTIONS:
1. Sign up for RapidAPI at https://rapidapi.com/
2. Subscribe to the Instagram120 API: https://rapidapi.com/instagram120-instagram120-default/api/instagram120
3. Get your API key from the RapidAPI dashboard
4. Replace 'YOUR_RAPIDAPI_KEY_HERE' in the fetchProfile function (line ~120) with your actual API key

IMPORTANT NOTES:
- RapidAPI has rate limits based on your subscription plan (free tier is limited)
- The API key should be kept secure. For production, use a backend proxy to hide the API key
- Due to CORS restrictions, you may need to run this through a backend server or use a CORS proxy
- Instagram's API policies are strict - ensure you comply with their Terms of Service

PRODUCTION DEPLOYMENT:
For production, it's recommended to:
1. Create a backend server (Node.js, Python, etc.) that:
   - Receives requests from the frontend
   - Makes authenticated requests to RapidAPI with your API key
   - Processes and optimizes images
   - Caches results to reduce API calls
   - Returns processed data to the frontend

2. Update the fetchProfile function to call your backend instead:
   
   const response = await fetch('https://api.profogram.world/api/v1/fetch', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json'
       },
       body: JSON.stringify({ username: username })
   });

This way, your RapidAPI key remains secure on the server side.

ALTERNATIVE: Using a Backend Proxy
If you want to keep the API key secure, create a simple backend endpoint:

// Backend (Node.js/Express example)
app.post('/api/v1/fetch', async (req, res) => {
    const { username } = req.body;
    
    try {
        const response = await fetch('https://instagram120.p.rapidapi.com/api/instagram/posts', {
            method: 'POST',
            headers: {
                'x-rapidapi-host': 'instagram120.p.rapidapi.com',
                'x-rapidapi-key': process.env.RAPIDAPI_KEY, // Stored securely in environment variables
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, maxId: '' })
        });
        
        const data = await response.json();
        // Process and return data
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

TROUBLESHOOTING:
- If you get CORS errors, you need to use a backend proxy or enable CORS on your server
- If you get 403 errors, check your RapidAPI key and subscription status
- If you get 429 errors, you've hit the rate limit - upgrade your plan or wait
- If profile images don't load, the API response structure may have changed - check console logs
*/

// Additional features you might want to add:

// 1. Copy download URL to clipboard
function copyDownloadUrl() {
    if (!currentProfileData) return;
    
    navigator.clipboard.writeText(currentProfileData.downloadUrl)
        .then(() => {
            showToast('Copied!', 'Download URL copied to clipboard');
        })
        .catch(err => {
            console.error('Failed to copy:', err);
        });
}

// 2. Share functionality
function shareProfile() {
    if (!currentProfileData || !navigator.share) return;
    
    navigator.share({
        title: `@${currentProfileData.username} Profile Photo`,
        text: `Check out this Instagram profile photo`,
        url: currentProfileData.downloadUrl
    }).catch(err => {
        console.error('Share failed:', err);
    });
}

// 3. History of recent searches (localStorage)
function addToHistory(username) {
    let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    history = [username, ...history.filter(u => u !== username)].slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(history));
}

function getHistory() {
    return JSON.parse(localStorage.getItem('searchHistory') || '[]');
}

// 4. Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        usernameInput.focus();
    }
    
    // Escape to clear input
    if (e.key === 'Escape' && document.activeElement === usernameInput) {
        usernameInput.value = '';
        hideError();
    }
});

// Console message for developers
console.log('%c🚀 Profogram', 'font-size: 20px; font-weight: bold; color: #9333ea;');
console.log('%cInstagram Profile Photo Downloader', 'font-size: 14px; color: #6b7280;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #d1d5db;');
console.log('%c⚙️  SETUP REQUIRED', 'font-size: 14px; font-weight: bold; color: #ea580c;');
console.log('%c1. Get RapidAPI key: https://rapidapi.com/', 'font-size: 12px; color: #6b7280;');
console.log('%c2. Subscribe to Instagram120 API', 'font-size: 12px; color: #6b7280;');
console.log('%c3. Add your API key to CONFIG.RAPIDAPI_KEY in main.js', 'font-size: 12px; color: #6b7280;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #d1d5db;');
console.log('%cAPI Key Status: ' + (CONFIG.RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY_HERE' ? '❌ Not configured' : '✅ Configured'), 
    'font-size: 12px; color: ' + (CONFIG.RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY_HERE' ? '#dc2626' : '#16a34a') + ';');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #d1d5db;');
console.log('%c📧 Contact: support@profogram.world', 'font-size: 12px; color: #9ca3af;');
