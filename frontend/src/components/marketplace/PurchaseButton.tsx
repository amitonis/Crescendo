import React, { useState } from 'react';
import { Track } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import api from '../../services/api';

interface PurchaseButtonProps {
  track: Track;
  onPurchaseComplete?: () => void;
  className?: string;
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({ track, onPurchaseComplete, className }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if user owns track (safely)
  const isOwned = user?.purchasedTracks?.includes(track._id);
  
  // Check if user is the artist
  const trackArtistId = typeof track.artistId === 'object' && track.artistId !== null ? (track.artistId as any)._id : track.artistId;
  const isArtist = user?._id === trackArtistId;

  const handlePurchase = async () => {
    if (!user) {
      setError('Please login to purchase');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/transactions/purchase', { trackId: track._id });
      setSuccess(true);
      onPurchaseComplete?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  if (isOwned || success) {
    return (
      <div className={cn('bg-[#2D9B4F]/10 text-[#2D9B4F] rounded px-4 py-2 font-medium inline-block text-center', className)}>
        Owned ✓
      </div>
    );
  }

  if (isArtist) {
    return (
      <div className={cn('bg-[#F4F4F0] text-[#666660] rounded px-4 py-2 border border-[#E0E0D8] font-medium inline-block text-center', className)}>
        Your Track
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <button
        onClick={handlePurchase}
        disabled={loading}
        className="bg-[#1DA0C3] hover:bg-[#1589A8] text-white rounded px-6 py-2.5 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Processing...
          </span>
        ) : track.price === 0 ? (
          'Free Download'
        ) : (
          `Buy for $${track.price.toFixed(2)}`
        )}
      </button>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
};
