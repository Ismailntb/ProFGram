// ============================================
// CONFIGURATION
// ============================================
const data = null;

const xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener('readystatechange', function () {
	if (this.readyState === this.DONE) {
		console.log(this.responseText);
	}
});

xhr.open('GET', 'https://instagram-api-media-downloader.p.rapidapi.com/download');
xhr.setRequestHeader('x-rapidapi-key', '34ccc1832cmshd3d8ffe2adce195p1f2a47jsn1880330aa693');
xhr.setRequestHeader('x-rapidapi-host', 'instagram-api-media-downloader.p.rapidapi.com');

xhr.send(data);
};

// ============================================
// FETCH PROFILE FUNCTION (Replaced API Section)
// ============================================
async function fetchProfile(input) {
    hideError();
    showLoading();

    try {
        const username = extractUsername(input);

        if (CONFIG.RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY_HERE') {
            throw new Error('API key not configured. Please add your RapidAPI key to CONFIG.');
        }

        // ✅ New API call using XMLHttpRequest
        const data = null;
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener('readystatechange', function () {
            if (this.readyState === this.DONE) {
                console.log('API Response:', this.responseText);
                // يمكنك هنا تعالج البيانات حسب الحاجة
            }
        });

        xhr.open('GET', CONFIG.API_ENDPOINT);
        xhr.setRequestHeader('x-rapidapi-key', CONFIG.RAPIDAPI_KEY);
        xhr.setRequestHeader('x-rapidapi-host', CONFIG.RAPIDAPI_HOST);
        xhr.send(data);

    } catch (error) {
        console.error('Error fetching profile:', error);
        showError('Failed to fetch profile. Please check and try again.');
    } finally {
        hideLoading();
    }
}
