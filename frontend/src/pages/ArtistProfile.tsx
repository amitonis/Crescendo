import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, User as UserIcon } from 'lucide-react';
import { TrackList } from '../components/track/TrackList';
import api from '../services/api';
import { Track } from '../types';

interface ArtistInfo {
  _id: string;
  username: string;
  profileImage?: string;
  bio?: string;
  createdAt?: string;
}

export default function ArtistProfile() {
  const { id } = useParams<{ id: string }>();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artistInfo, setArtistInfo] = useState<ArtistInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/tracks/artist/${id}`);
        const artistTracks = response.data.data as Track[];
        setTracks(artistTracks);
        
        // Extract artist info from the first track if available
        if (artistTracks.length > 0 && artistTracks[0].artistId) {
          setArtistInfo(artistTracks[0].artistId as unknown as ArtistInfo);
        } else {
          // If no tracks, we don't have the artist info in this simple flow.
          // Fallback to ID
          setArtistInfo({ _id: id, username: 'Artist' });
        }
      } catch (err) {
        setError('Artist not found or could not load tracks');
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 md:h-64 bg-gradient-to-r from-[#A8A9AD] to-[#E0E0D8] w-full"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-24 h-24 rounded-full bg-gray-300 border-4 border-white -mt-12 relative z-10"></div>
          <div className="h-8 bg-gray-200 w-1/4 mt-4 rounded"></div>
          <div className="h-4 bg-gray-200 w-1/3 mt-2 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !artistInfo) {
    return (
      <div className="py-16 px-8 text-center">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">{error || 'Artist not found'}</h2>
      </div>
    );
  }

  const totalPlays = tracks.reduce((sum, track) => sum + (track.plays || 0), 0);
  const joinDate = artistInfo.createdAt 
    ? new Date(artistInfo.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-[#1A1A1A] via-[#A8A9AD] to-[#E0E0D8]"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Profile Header */}
        <div className="relative -mt-12 sm:flex sm:items-end sm:space-x-5">
          <div className="relative">
            {artistInfo.profileImage ? (
              <img 
                src={artistInfo.profileImage} 
                alt={artistInfo.username} 
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg bg-[#A8A9AD] flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                {artistInfo.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="mt-4 sm:mt-0 sm:flex-1 pb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] truncate">
              {artistInfo.username}
            </h1>
            <p className="text-[#666660] mt-1 max-w-2xl text-sm sm:text-base line-clamp-3">
              {artistInfo.bio || 'No bio provided.'}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap gap-6 sm:gap-8 mt-6 py-4 border-y border-[#E0E0D8]">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#1DA0C3]">{tracks.length}</span>
            <span className="text-sm font-medium text-[#666660] uppercase tracking-wider">Tracks</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#1DA0C3]">{totalPlays}</span>
            <span className="text-sm font-medium text-[#666660] uppercase tracking-wider">Total Plays</span>
          </div>
          <div className="flex flex-col justify-end pb-1">
            <div className="flex items-center gap-2 text-[#666660]">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Joined {joinDate}</span>
            </div>
          </div>
        </div>

        {/* Tracks Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">
            Tracks by {artistInfo.username}
          </h2>
          
          {tracks.length > 0 ? (
            <TrackList tracks={tracks} />
          ) : (
            <div className="text-center py-12 bg-[#F4F4F0] rounded-lg border border-[#E0E0D8]">
              <UserIcon className="w-12 h-12 text-[#A8A9AD] mx-auto mb-3" />
              <h3 className="text-lg font-medium text-[#1A1A1A]">No tracks yet</h3>
              <p className="text-[#666660] mt-1">This artist hasn't uploaded any tracks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
