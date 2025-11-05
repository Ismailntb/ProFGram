// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // API Configuration fields are now placeholders, assuming a backend will handle the Graph API.
    // The Graph API is not run directly from this client-side code for security.
    RAPIDAPI_HOST: null,
    API_ENDPOINT: null,
    
    // Use a backend proxy for security:
    USE_BACKEND_PROXY: true,
    // This URL is where your secure server (that runs the Graph API call) is located.
    BACKEND_URL: 'https://api.your-secure-backend.com/api/v1/fetch-instagram-profile' 
};

// ============================================
// DOM Elements
// ... (DOM elements remain unchanged)
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
// ... (Helper functions remain unchanged)
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


// ⚠️ START: Refactored fetchProfile for Backend Proxy
async function fetchProfile(input) {
    hideError();
    showLoading();
    
    const username = extractUsername(input);

    try {
        // 1. Send the request to your secure backend
        const response = await fetch(CONFIG.BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // No API key here! The backend holds the token securely.
            },
            body: JSON.stringify({ 
                username: username 
            })
        });

        if (!response.ok) {
            if (response.status === 404) {
                 throw new Error('Profile not found via backend. Check ID/Username.');
            } else if (response.status === 403) {
                 throw new Error('Backend failed: Graph API token error.');
            } else {
                throw new Error(`Backend error! status: ${response.status}`);
            }
        }
        
        const data = await response.json();
        console.log('Backend Response (from Graph API):', data); // For debugging

        // 2. Parse the response based on the fields requested in your curl command
        // The structure below assumes your backend translates the Graph API fields 
        // back into a clean JSON format for the frontend.
        let profileData;
        
        if (data && data.username && data.profile_pic) {
            profileData = {
                username: data.username,
                fullName: data.name || 'Instagram User',
                profileImageUrl: data.profile_pic,
                downloadUrl: data.profile_pic.replace('/s150x150/', '/'), // Simple guess to get a larger size
                followers: data.follower_count || 0,
                isPublic: true // Graph API typically works with business/creator accounts
            };
        } else {
            // Fallback: If we can't parse the response properly, assume a structural issue
            console.warn('Unexpected Backend response structure:', data);
            throw new Error('Unable to parse profile data from backend response.');
        }
        
        // Validate that we have at least a profile image
        if (!profileData.profileImageUrl) {
            throw new Error('Profile image not found in the API response.');
        }
        
        displayProfile(profileData);
        addToHistory(username);
        
    } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Display appropriate error message
        if (error.message.includes('Profile not found')) {
            showError(`Profile '${username}' not found. Check if the user is linked to your app.`);
        } else if (error.message.includes('token error')) {
            showError('Authentication failed. Check your Graph API access token on the backend.');
        } else if (error.message.includes('parse profile data')) {
            showError('Data received, but failed to extract profile information. Check backend payload.');
        } else {
            showError(`Failed to fetch profile: ${error.message}`);
        }
    } finally {
        hideLoading();
    }
}
// ⚠️ END: Refactored fetchProfile for Backend Proxy

function downloadProfile() {
// ... (downloadProfile and Event Listeners functions remain unchanged)
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
const exampleUsernames = [
    'instagram',
    'natgeo',
    'nasa',
    'cristiano',
    'therock'
];

// Auto-populate with random example on page load (optional - for demo purposes)
// window.addEventListener('load', () => {
//     const randomExample = exampleUsernames[Math.floor(Math.random() * exampleUsernames.length)];
//     usernameInput.placeholder = `@username or https://instagram.com/username (try: @${randomExample})`;
// });

// API Integration Notes:
/*
META GRAPH API INTEGRATION

The client-side code is now configured to call a secure backend proxy to fetch data.

SECURITY WARNING:
The Graph API call you provided (curl...) contains sensitive data (an access token) 
and MUST be executed on a secure, server-side environment (Node.js, Python, etc.).
DO NOT expose your access_token in client-side JavaScript.

BACKEND IMPLEMENTATION (Conceptual Flow):
1.  **Client-side (This Script):** Calls POST to `CONFIG.BACKEND_URL` with `{ username: "..." }`.
2.  **Server-side:**
    a.  Receives the `username`.
    b.  **Crucially:** Translates the public username into the Instagram Scoped User ID. (This usually requires a prior search API call).
    c.  Constructs and runs your `curl` command (as an HTTP request, e.g., using `fetch` or a library like `axios`) with the secure, hidden `access_token` and the retrieved User ID.
    d.  Parses the Meta Graph API response.
    e.  Sends a clean JSON response back to the client-side.

CURRENT STATUS:
The 'fetchProfile' function is ready to connect to your secure backend at:
**`https://api.your-secure-backend.com/api/v1/fetch-instagram-profile`**
*/

// Additional features you might want to add:
// ... (all other helper functions remain unchanged)

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

function addToHistory(username) {
    let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    history = [username, ...history.filter(u => u !== username)].slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(history));
}

function getHistory() {
    return JSON.parse(localStorage.getItem('searchHistory') || '[]');
}

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
console.log('%c🔒 SECURE BACKEND INTEGRATION READY', 'font-size: 14px; font-weight: bold; color: #059669;');
console.log('%cClient is calling: ' + CONFIG.BACKEND_URL, 'font-size: 12px; color: #6b7280;');
console.log('%cYou must build a server to execute the Graph API call.', 'font-size: 12px; color: #dc2626;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #d1d5db;');
console.log('%c📧 Contact: support@profogram.world', 'font-size: 12px; color: #9ca3af;');
