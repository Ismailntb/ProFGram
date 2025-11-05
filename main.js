// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // RapidAPI Configuration
    // NEW API DETAILS: instagram-api-media-downloader
    RAPIDAPI_KEY: '34ccc1832cmshd3d8ffe2adce195p1f2a47jsn1880330aa693', // ⚠️ NEW API KEY INSERTED HERE
    RAPIDAPI_HOST: 'instagram-api-media-downloader.p.rapidapi.com',
    API_ENDPOINT: 'https://instagram-api-media-downloader.p.rapidapi.com/download', // ⚠️ NEW ENDPOINT
    
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


// ⚠️ NEW: XHR Request Wrapper as a Promise 
// to replace the original 'fetch' function
function xhrPromise(username) {
    return new Promise((resolve, reject) => {
        const url = `${CONFIG.API_ENDPOINT}?username=${username}`; // Use GET with query param
        const xhr = new XMLHttpRequest();
        
        xhr.withCredentials = true;
        
        xhr.open('GET', url);
        xhr.setRequestHeader('x-rapidapi-key', CONFIG.RAPIDAPI_KEY);
        xhr.setRequestHeader('x-rapidapi-host', CONFIG.RAPIDAPI_HOST);
        
        // Handle successful response
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    resolve(data);
                } catch (e) {
                    reject(new Error('Failed to parse API response.'));
                }
            } else if (xhr.status === 404) {
                 reject(new Error('Profile not found. Please check the username.'));
            } else if (xhr.status === 403) {
                 reject(new Error('API key invalid or access denied. Please check your RapidAPI credentials.'));
            } else if (xhr.status === 429) {
                 reject(new Error('Rate limit exceeded. Please try again later.'));
            } else {
                reject(new Error(`HTTP error! status: ${xhr.status}`));
            }
        };
        
        // Handle network errors
        xhr.onerror = function () {
            reject(new Error('Network error or CORS issue.'));
        };
        
        xhr.send();
    });
}

async function fetchProfile(input) {
    hideError();
    showLoading();
    
    try {
        // Extract username from input
        const username = extractUsername(input);
        
        // Validate API key is configured (Updated check)
        if (!CONFIG.RAPIDAPI_KEY || CONFIG.RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY_HERE') {
            throw new Error('API key not configured. Please add your RapidAPI key to the CONFIG object.');
        }

        // ⚠️ REPLACING 'fetch' WITH 'xhrPromise'
        const data = await xhrPromise(username); 
        console.log('API Response:', data); // For debugging
        
        // Parse the response and extract profile information
        // NOTE: The structure below is based on the OLD API. It LIKELY needs adjustment 
        // to match the 'instagram-api-media-downloader' response structure.
        let profileData;
        
        if (data && data.user) {
            // Assuming this new API returns similar structure to the old one's 'data.user'
            const user = data.user;
            // The new API endpoint is '/download', so it might not return all profile data.
            // We'll use the available fields.
            
            // NOTE: The old API had follower counts. This new one may not. 
            // You might need a different API for full profile data.
            profileData = {
                username: user.username || username,
                fullName: user.full_name || 'Instagram User',
                profileImageUrl: user.profile_pic_url_hd || user.profile_pic_url || '',
                downloadUrl: user.profile_pic_url_hd || user.profile_pic_url || '',
                followers: user.follower_count || 0, // This is a guess/fallback
                isPublic: !user.is_private
            };
        } else if (data && data.profile_pic_url_hd) {
            // Simple response focused only on the image
            profileData = {
                username: username,
                fullName: 'Instagram User',
                profileImageUrl: data.profile_pic_url_hd || data.profile_pic_url,
                downloadUrl: data.profile_pic_url_hd || data.profile_pic_url,
                followers: 0, 
                isPublic: true
            };
        } else {
            // Fallback: If we can't parse the response properly
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
            showError('Unable to retrieve profile data. The API format may have changed.');
        } else if (error.message.includes('Profile image not found')) {
            showError('Profile image is not available for this account.');
        } else if (error.message.includes('Network error or CORS issue')) {
            showError('Network error. Check your connection or use a backend proxy for CORS.');
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

The app is now integrated with RapidAPI's Instagram-api-media-downloader API using XMLHttpRequest.

SETUP INSTRUCTIONS:
1. The new API key and endpoint have been added to the CONFIG object.
2. The fetchProfile function now uses an XHR-based promise wrapper.

IMPORTANT NOTES:
- The new API endpoint is a GET request and uses the 'username' as a query parameter.
- The data parsing logic inside fetchProfile (where it extracts username, followers, etc.) is based on the OLD API's response structure. It is highly likely you will need to inspect the response from the 'instagram-api-media-downloader' API and adjust the parsing logic (lines ~260-300) to ensure profile data is extracted correctly.
- If you run into CORS issues, you MUST use a backend proxy. XHR is often more strict with CORS than 'fetch'.
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
console.log('%c⚙️  NEW API CONFIGURED', 'font-size: 14px; font-weight: bold; color: #16a34a;');
console.log('%cUsing: instagram-api-media-downloader (XHR)', 'font-size: 12px; color: #6b7280;');
console.log('%cAPI Key Status: ✅ Configured', 'font-size: 12px; color: #16a34a;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #d1d5db;');
console.log('%c📧 Contact: support@profogram.world', 'font-size: 12px; color: #9ca3af;');
