import { useEffect, useState } from 'react';
import { Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TrackList } from '../components/track/TrackList';
import api from '../services/api';
import { Transaction, Track, ApiResponse } from '../types';
import { useAuth } from '../hooks/useAuth';

export default function FanCollection() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    const fetchCollection = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get<ApiResponse<Transaction[]>>('/transactions/my-purchases');
        
        if (!isMounted) return;
        
        if (data.success && data.data) {
          const fetchedTransactions = data.data;
          
          let spent = 0;
          const extractedTracks: Track[] = [];
          
          fetchedTransactions.forEach(tx => {
            if (tx.status === 'success') {
              spent += tx.amount;
              if (tx.trackId && typeof tx.trackId !== 'string') {
                extractedTracks.push(tx.trackId as Track);
              }
            }
          });
          
          setTracks(extractedTracks);
          setTotalSpent(spent);
        } else {
          setError(data.message || 'Failed to fetch collection');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.response?.data?.message || err.message || 'An error occurred');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCollection();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (!user || user.role !== 'fan') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Access Denied</h2>
        <p className="mt-2 text-[#666660]">Only fans can view their collection.</p>
        <Link to="/" className="mt-6 inline-block bg-[#1DA0C3] text-white px-6 py-2 rounded-md hover:bg-[#1589A8] transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">My Collection</h1>
          <p className="text-[#666660] mt-1">Your purchased tracks</p>
        </div>
        
        {!loading && !error && tracks.length > 0 && (
          <div className="flex gap-8 bg-white border border-[#E0E0D8] rounded-lg px-6 py-3 shadow-sm">
            <div>
              <p className="text-sm text-[#666660] uppercase tracking-wider font-semibold">Total Tracks</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">{tracks.length}</p>
            </div>
            <div className="w-[1px] bg-[#E0E0D8]"></div>
            <div>
              <p className="text-sm text-[#666660] uppercase tracking-wider font-semibold">Total Spent</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">${totalSpent.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      ) : loading ? (
        <TrackList tracks={[]} loading={true} />
      ) : tracks.length === 0 ? (
        <div className="bg-white border border-[#E0E0D8] rounded-lg shadow-sm p-16 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 bg-[#F4F4F0] rounded-full flex items-center justify-center mb-4 text-[#A8A9AD]">
            <Music size={32} />
          </div>
          <h3 className="text-xl font-medium text-[#1A1A1A] mb-2">Your collection is empty</h3>
          <p className="text-[#666660] max-w-md mb-6">
            Explore the marketplace to find music you love and start building your collection.
          </p>
          <Link 
            to="/marketplace" 
            className="bg-[#1DA0C3] hover:bg-[#1589A8] text-white rounded-md px-6 py-2 font-medium transition-colors"
          >
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <TrackList tracks={tracks} />
      )}
    </div>
  );
}
