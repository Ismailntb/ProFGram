import { useState } from 'react';
import { FetchForm } from './components/FetchForm';
import { ProfilePreview } from './components/ProfilePreview';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toaster } from './components/ui/sonner';

export interface ProfileData {
  username: string;
  fullName: string;
  profileImageUrl: string;
  downloadUrl: string;
  followers: number;
  isPublic: boolean;
}

export default function App() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async (input: string) => {
    setLoading(true);
    setError(null);
    setProfileData(null);

    try {
      // Mock API call - in production this would call your backend
      // POST /api/v1/fetch with { "input": input }
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock response
      const mockProfile: ProfileData = {
        username: extractUsername(input),
        fullName: 'Demo User',
        profileImageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800',
        downloadUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800',
        followers: 12500,
        isPublic: true
      };

      setProfileData(mockProfile);
    } catch (err) {
      setError('Failed to fetch profile. Please check the username and try again.');
    } finally {
      setLoading(false);
    }
  };

  const extractUsername = (input: string): string => {
    // Extract username from URL or @username
    if (input.includes('instagram.com/')) {
      const match = input.match(/instagram\.com\/([^/?]+)/);
      return match ? match[1] : input;
    }
    return input.replace('@', '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col">
      <Toaster />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            Profogram
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Instantly retrieve and download high-resolution Instagram profile photos. 
            Simply paste a public profile URL or @username below.
          </p>
        </div>

        <FetchForm onFetch={handleFetch} loading={loading} />

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        {profileData && (
          <ProfilePreview profile={profileData} />
        )}

        <div className="mt-12 p-6 bg-white/60 backdrop-blur rounded-lg border border-gray-200">
          <h2 className="mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                1
              </div>
              <h3>Enter Username</h3>
              <p className="text-gray-600">Paste an Instagram URL or @username into the input field.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                2
              </div>
              <h3>Fetch Profile</h3>
              <p className="text-gray-600">Our backend securely retrieves the profile photo from Instagram's public API.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                3
              </div>
              <h3>Download HD</h3>
              <p className="text-gray-600">Get the optimized, high-resolution image delivered via our CDN.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="mb-2">Important Notes</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Only public Instagram profiles are supported</li>
            <li>• No user credentials or login required</li>
            <li>• All access limited to publicly available content</li>
            <li>• Service complies with Instagram's Terms of Service</li>
            <li>• Images are optimized and cached on our edge CDN</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
