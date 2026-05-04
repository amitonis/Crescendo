import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Search, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { Track } from '../types';
import { TrackCard } from '../components/track/TrackCard';
import { TrackList } from '../components/track/TrackList';
import { DitheringShader } from '../components/ui/dithering-shader';
import { RandomLetterSwapPingPong } from '../components/ui/random-letter-swap';

export default function Landing() {
  const [latestTracks, setLatestTracks] = useState<Track[]>([]);
  const [featuredTracks, setFeaturedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stats = {
    artists: "10K+",
    tracks: "50K+",
    sold: "100K+"
  };

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const [latestRes, featuredRes] = await Promise.all([
          api.get('/tracks?limit=10&sort=newest'),
          api.get('/tracks?limit=6')
        ]);
        setLatestTracks(latestRes.data.data?.tracks || latestRes.data.tracks || []);
        setFeaturedTracks(featuredRes.data.data?.tracks || featuredRes.data.tracks || []);
      } catch (err) {
        console.error('Failed to load tracks:', err);
        setError('Failed to load tracks.');
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F4F0] text-[#1A1A1A]">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center -mt-16 pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <DitheringShader shape="wave" type="8x8" colorBack="#F4F4F0" colorFront="#A8A9AD" pxSize={3} speed={0.6} />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 text-center">
          <h1 
            className="text-5xl md:text-7xl font-bold text-[#1A1A1A]"
          >
            <RandomLetterSwapPingPong text="Crescendo" speed={80} />
          </h1>
          <p className="text-xl text-[#1A1A1A] mt-4 max-w-2xl">
            Independent music, directly from artists
          </p>
          <div className="flex flex-wrap gap-4 mt-8 justify-center">
            <Link to="/marketplace" className="bg-[#1DA0C3] hover:bg-[#1589A8] text-white rounded-lg px-8 py-3 font-medium transition-colors">
              Explore Music
            </Link>
            <Link to="/register" className="border border-[#1DA0C3] text-[#1DA0C3] hover:bg-[#1DA0C3] hover:text-white rounded-lg px-8 py-3 font-medium transition-colors">
              Start Selling
            </Link>
          </div>
          <div className="flex gap-8 mt-12 text-center flex-wrap justify-center pointer-events-none">
            <div>
              <div className="text-2xl font-bold text-[#1A1A1A]">{stats.artists}</div>
              <div className="text-sm text-[#666660]">Artists</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1A1A1A]">{stats.tracks}</div>
              <div className="text-sm text-[#666660]">Tracks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1A1A1A]">{stats.sold}</div>
              <div className="text-sm text-[#666660]">Sold</div>
            </div>
          </div>
        </div>
      </section>

      {/* Selling Right Now Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-8 text-[#1A1A1A]">
          <RandomLetterSwapPingPong text="Selling Right Now" />
        </h2>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[250px] aspect-[3/4] bg-[#E0E0D8] animate-pulse rounded-lg flex-shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x flex-nowrap hide-scrollbar">
            {latestTracks.length > 0 ? latestTracks.map((track) => (
              <div key={track._id} className="min-w-[250px] w-[250px] snap-start flex-shrink-0">
                <TrackCard track={track} />
              </div>
            )) : (
              <p className="text-[#666660]">No tracks found.</p>
            )}
          </div>
        )}
      </section>

      {/* Featured Tracks Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full bg-white rounded-2xl shadow-sm border border-[#E0E0D8]">
        <h2 className="text-3xl font-bold mb-8 text-[#1A1A1A]">
          <RandomLetterSwapPingPong text="Featured Tracks" />
        </h2>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : loading ? (
          <TrackList tracks={[]} loading={true} />
        ) : (
          <TrackList tracks={featuredTracks} />
        )}
        <div className="mt-8 text-center">
          <Link to="/marketplace" className="text-[#1DA0C3] hover:underline font-medium inline-flex items-center gap-2">
            Browse All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full mb-16">
        <h2 className="text-3xl font-bold mb-12 text-center text-[#1A1A1A]">
          <RandomLetterSwapPingPong text="How It Works" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-[#E0E0D8]">
            <div className="w-16 h-16 bg-[#F4F4F0] rounded-full flex items-center justify-center mb-6 text-[#1DA0C3]">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3"><RandomLetterSwapPingPong text="Upload Your Music" /></h3>
            <p className="text-[#666660]">Share your tracks with the world.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-[#E0E0D8]">
            <div className="w-16 h-16 bg-[#F4F4F0] rounded-full flex items-center justify-center mb-6 text-[#1DA0C3]">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3"><RandomLetterSwapPingPong text="Discover & Stream" /></h3>
            <p className="text-[#666660]">Find new artists and preview tracks.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-[#E0E0D8]">
            <div className="w-16 h-16 bg-[#F4F4F0] rounded-full flex items-center justify-center mb-6 text-[#1DA0C3]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3"><RandomLetterSwapPingPong text="Buy & Own" /></h3>
            <p className="text-[#666660]">Support artists, own high-quality audio.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
