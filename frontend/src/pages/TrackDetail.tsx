import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Clock, Tag, ShoppingBag, BarChart3 } from 'lucide-react';
import { WaveformPlayer } from '../components/track/WaveformPlayer';
import { TrackList } from '../components/track/TrackList';
import { PurchaseButton } from '../components/marketplace/PurchaseButton';
import { RandomLetterSwapForward } from '../components/ui/random-letter-swap';
import { usePlayer } from '../hooks/usePlayer';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Track } from '../types';

export default function TrackDetail() {
  const { id } = useParams<{ id: string }>();
  const [track, setTrack] = useState<Track | null>(null);
  const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playTrack } = usePlayer();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTrackDetail = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/tracks/${id}`);
        const fetchedTrack = response.data.data;
        setTrack(fetchedTrack);

        const fetchedArtistId = typeof fetchedTrack.artistId === 'string' ? fetchedTrack.artistId : fetchedTrack.artistId?._id;

        // Fetch related tracks by the same artist
        if (fetchedArtistId) {
          const relatedResponse = await api.get(`/tracks/artist/${fetchedArtistId}`);
          const allArtistTracks = relatedResponse.data.data as Track[];
          setRelatedTracks(allArtistTracks.filter((t: Track) => t._id !== id).slice(0, 3));
        }
      } catch (err) {
        const error = err as any;
        setError(error.response?.data?.message || 'Track not found');
      } finally {
        setLoading(false);
      }
    };

    fetchTrackDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-[400px] bg-gray-200 rounded-lg mb-8"></div>
        <div className="h-8 bg-gray-200 w-1/3 mb-4 rounded"></div>
        <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">{error || 'Track not found'}</h2>
        <Link to="/marketplace" className="text-[#1DA0C3] hover:underline mt-4 inline-block">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const artistId = typeof track.artistId === 'string' ? track.artistId : track.artistId._id;
  const artistName = typeof track.artistId === 'string' ? 'Artist' : track.artistId.username;
  const isOwner = user ? (artistId === user._id || user.purchasedTracks?.includes(track._id)) : false;
  const audioUrl = isOwner ? track.audioUrlHigh : track.audioUrlPreview;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg overflow-hidden shadow-lg aspect-square bg-[#F4F4F0] border border-[#E0E0D8]">
            <img 
              src={track.coverArt || '/placeholder-cover.jpg'} 
              alt={track.title} 
              className="w-full h-full object-cover" 
            />
          </div>
          <button
            onClick={() => playTrack(track)}
            className="w-full flex items-center justify-center gap-2 bg-[#1DA0C3] hover:bg-[#188CAA] transition-colors text-white rounded-lg py-3 font-medium"
          >
            <Play className="w-5 h-5 fill-current" />
            Play Preview
          </button>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            <RandomLetterSwapForward text={track.title} />
          </h1>
          
          <Link to={`/artist/${artistId}`} className="text-lg text-[#1DA0C3] hover:underline mt-1 inline-block">
            {artistName}
          </Link>

          <div className="flex gap-2 mt-3">
            <span className="px-3 py-1 bg-[#F4F4F0] text-[#666660] border border-[#E0E0D8] rounded-full text-sm font-medium flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {track.genre}
            </span>
            {track.mood && (
              <span className="px-3 py-1 bg-[#F4F4F0] text-[#666660] border border-[#E0E0D8] rounded-full text-sm font-medium">
                {track.mood}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {track.tags?.map((tag, i) => (
              <span key={i} className="text-xs bg-[#E0E0D8] text-[#666660] px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>

          <p className="mt-4 text-[#666660] whitespace-pre-line leading-relaxed">
            {track.description || 'No description provided.'}
          </p>

          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-[#E0E0D8]">
            <div className="flex items-center gap-2 text-[#666660]">
              <BarChart3 className="w-5 h-5 text-[#A8A9AD]" />
              <span className="font-medium">{track.plays || 0}</span>
              <span className="text-sm">Plays</span>
            </div>
            <div className="flex items-center gap-2 text-[#666660]">
              <ShoppingBag className="w-5 h-5 text-[#A8A9AD]" />
              <span className="font-medium">{track.purchases || 0}</span>
              <span className="text-sm">Purchases</span>
            </div>
            <div className="flex items-center gap-2 text-[#666660]">
              <Clock className="w-5 h-5 text-[#A8A9AD]" />
              <span className="font-medium">{formatDuration(track.duration)}</span>
            </div>
          </div>

          <div className="mt-8 p-6 bg-[#F4F4F0] rounded-lg border border-[#E0E0D8]">
            <PurchaseButton track={track} />
            {track.price === 0 && (
              <p className="text-sm text-[#666660] mt-3 text-center">
                This track is available for free download.
              </p>
            )}
          </div>

          {audioUrl && (
            <div className="mt-8">
              <h3 className="font-medium text-[#1A1A1A] mb-4">Waveform Preview</h3>
              <WaveformPlayer audioUrl={audioUrl} />
            </div>
          )}
        </div>
      </div>

      {relatedTracks.length > 0 && (
        <div className="mt-16 pt-8 border-t border-[#E0E0D8]">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">More by {artistName}</h2>
          <TrackList tracks={relatedTracks} />
        </div>
      )}
    </div>
  );
}
