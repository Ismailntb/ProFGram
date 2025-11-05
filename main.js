// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // RapidAPI Configuration for Profile Info (Instagram120)
    RAPIDAPI_KEY: 'YOUR_RAPIDAPI_KEY_HERE',
    RAPIDAPI_HOST: 'instagram120.p.rapidapi.com',
    API_ENDPOINT: 'https://instagram120.p.rapidapi.com/api/instagram/posts',

    // RapidAPI Configuration for Media Downloader
    MEDIA_API_HOST: 'instagram-api-media-downloader.p.rapidapi.com',
    MEDIA_API_URL: 'https://instagram-api-media-downloader.p.rapidapi.com/download',
};

// ============================================
// EXISTING FUNCTIONS (unchanged)
// ============================================
// ... all your original code (fetchProfile, displayProfile, showError, etc.)

// ============================================
// NEW FUNCTION: Download Instagram Media (Posts/Reels)
// ============================================
async function fetchInstagramMedia(url) {
    if (!url || !url.includes('instagram.com')) {
        showError('Please enter a valid Instagram post or reel URL.');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${CONFIG.MEDIA_API_URL}?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': CONFIG.MEDIA_API_HOST,
                'x-rapidapi-key': CONFIG.RAPIDAPI_KEY,
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch media. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Media API Response:', data);

        if (!data || !data.media || data.media.length === 0) {
            throw new Error('No media found for this URL.');
        }

        // Download first media item
        const mediaUrl = data.media[0].url;
        const link = document.createElement('a');
        link.href = mediaUrl;
        link.download = 'instagram_media';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Download started!', 'Your Instagram media is being downloaded.');
    } catch (error) {
        console.error('Error fetching media:', error);
        showError('Failed to download media. Please check the URL or try again later.');
    } finally {
        hideLoading();
    }
}

// ============================================
// ADDITION TO HTML UI (OPTIONAL)
// ============================================
// Example: Add a field or button to download media by URL
/*
<form id="mediaForm">
  <input id="mediaUrlInput" placeholder="Paste Instagram post/reel URL here" />
  <button id="mediaButton">Download Media</button>
</form>
*/

const mediaForm = document.getElementById('mediaForm');
const mediaUrlInput = document.getElementById('mediaUrlInput');
const mediaButton = document.getElementById('mediaButton');

if (mediaForm) {
    mediaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = mediaUrlInput.value.trim();
        fetchInstagramMedia(input);
    });
}
