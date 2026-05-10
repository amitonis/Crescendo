import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BarChart3, DollarSign, Music, Trash2, Upload } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ExpandableTabs } from '../components/ui/expandable-tabs';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Track, Transaction, User } from '../types';

const genres = ['lo-fi', 'hip-hop', 'electronic', 'jazz', 'rock', 'pop', 'classical', 'ambient', 'other'] as const;
const moods = ['chill', 'energetic', 'sad', 'happy', 'dark', 'romantic', 'other'] as const;

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or fewer'),
  genre: z.enum(genres, { required_error: 'Genre is required' }),
  mood: z.enum(moods, { required_error: 'Mood is required' }),
  description: z.string().max(1000, 'Description must be 1000 characters or fewer').optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Price must be at least 0'),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

interface EarningsStats {
  totalEarnings: number;
  totalSales: number;
  totalPlatformFees: number;
}

interface SignedUploadPayload {
  signature: string;
  timestamp: number;
  api_key?: string;
  apiKey?: string;
  folder: string;
  cloud_name?: string;
  cloudName?: string;
}

const tabs = [
  { id: 'tracks', label: 'My Tracks', icon: <Music size={18} /> },
  { id: 'upload', label: 'Upload', icon: <Upload size={18} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  { id: 'earnings', label: 'Earnings', icon: <DollarSign size={18} /> },
];

function extractPayload<T>(raw: unknown): T {
  const source = raw as { data?: unknown };
  return ((source?.data as T | undefined) ?? (raw as T));
}

function isUser(value: string | User): value is User {
  return typeof value !== 'string';
}

function getTrackStatus(_track: Track): { label: 'Published'; classes: string } {
  return { label: 'Published', classes: 'bg-[#EAF8EE] text-[#2D9B4F] border border-[#2D9B4F]/30' };
}

export default function ArtistDashboard() {
  const { user, isArtist } = useAuth();

  const [activeTab, setActiveTab] = useState('tracks');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<EarningsStats>({ totalEarnings: 0, totalSales: 0, totalPlatformFees: 0 });

  const [tracksLoading, setTracksLoading] = useState(false);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [tracksError, setTracksError] = useState<string | null>(null);
  const [earningsError, setEarningsError] = useState<string | null>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [uploadStep, setUploadStep] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      genre: 'lo-fi',
      mood: 'chill',
      description: '',
      tags: '',
      price: 0,
    },
  });

  const artistId = user?._id;

  const fetchTracks = async () => {
    if (!artistId) {
      return;
    }

    setTracksLoading(true);
    setTracksError(null);

    try {
      const response = await api.get(`/tracks/artist/${artistId}`);
      const payload = extractPayload<{ tracks?: Track[] }>(response.data);
      setTracks(payload.tracks ?? []);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ?? 'Failed to fetch your tracks.'
        : 'Failed to fetch your tracks.';
      setTracksError(message);
    } finally {
      setTracksLoading(false);
    }
  };

  const fetchEarnings = async () => {
    setEarningsLoading(true);
    setEarningsError(null);

    try {
      const response = await api.get('/transactions/my-earnings');
      const payload = extractPayload<{
        transactions?: Transaction[];
        stats?: EarningsStats;
      }>(response.data);

      setTransactions(payload.transactions ?? []);
      setStats(
        payload.stats ?? {
          totalEarnings: 0,
          totalSales: 0,
          totalPlatformFees: 0,
        }
      );
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ?? 'Failed to fetch earnings data.'
        : 'Failed to fetch earnings data.';
      setEarningsError(message);
    } finally {
      setEarningsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTracks();
  }, [artistId]);

  useEffect(() => {
    if (activeTab === 'analytics' || activeTab === 'earnings') {
      void fetchEarnings();
    }
  }, [activeTab]);

  const handleDeleteTrack = async (trackId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this track?');
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/tracks/${trackId}`);
      setTracks((prev) => prev.filter((track) => track._id !== trackId));
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ?? 'Failed to delete track.'
        : 'Failed to delete track.';
      setTracksError(message);
    }
  };

  const playsPerTrackData = useMemo(() => {
    return tracks.map((track) => ({
      name: track.title,
      plays: track.plays,
    }));
  }, [tracks]);

  const revenuePerTrackData = useMemo(() => {
    const byTrack = new Map<string, { name: string; revenue: number }>();

    for (const transaction of transactions) {
      const trackName = typeof transaction.trackId === 'string' ? 'Unknown track' : transaction.trackId.title;
      const current = byTrack.get(trackName);
      if (current) {
        current.revenue += transaction.artistEarnings;
      } else {
        byTrack.set(trackName, { name: trackName, revenue: transaction.artistEarnings });
      }
    }

    return Array.from(byTrack.values());
  }, [transactions]);

  const onSubmit = async (values: UploadFormValues) => {
    setUploadError(null);
    setUploadSuccess(null);

    // Check if either file or URL is provided for audio
    if (!audioFile && !audioUrl) {
      setUploadError('Audio file or URL is required.');
      return;
    }

    // Check if either file or URL is provided for cover
    if (!coverFile && !coverUrl) {
      setUploadError('Cover art file or URL is required.');
      return;
    }

    const parsedTags = (values.tags ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (parsedTags.length > 10) {
      setUploadError('You can add up to 10 tags only.');
      return;
    }

    try {
      let audioUrlHigh = audioUrl;
      let audioUrlPreview = audioUrl;
      let coverArt = coverUrl;

      // Get cloudName once for both uploads
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

      // Upload audio file to Cloudinary if file is provided
      if (audioFile) {
        setUploadStep('Uploading audio...');
        const audioSignedResponse = await api.post('/tracks/signed-url', { resourceType: 'video' });
        const audioSignedPayload = extractPayload<SignedUploadPayload>(audioSignedResponse.data);

        const audioApiKey = audioSignedPayload.apiKey ?? audioSignedPayload.api_key;
        const resolvedCloudName = cloudName || audioSignedPayload.cloudName || audioSignedPayload.cloud_name;

        if (!audioApiKey || !resolvedCloudName) {
          throw new Error('Missing Cloudinary upload configuration.');
        }

        const audioForm = new FormData();
        audioForm.append('file', audioFile);
        audioForm.append('api_key', audioApiKey);
        audioForm.append('timestamp', String(audioSignedPayload.timestamp));
        audioForm.append('signature', audioSignedPayload.signature);
        audioForm.append('folder', audioSignedPayload.folder);

        const audioUploadResponse = await axios.post<{ secure_url: string; duration?: number }>(
          `https://api.cloudinary.com/v1_1/${resolvedCloudName}/video/upload`,
          audioForm
        );

        audioUrlHigh = audioUploadResponse.data.secure_url;
        audioUrlPreview = audioUploadResponse.data.secure_url;
      }

      // Upload cover file to Cloudinary if file is provided
      if (coverFile) {
        setUploadStep('Uploading cover art...');
        const coverSignedResponse = await api.post('/tracks/signed-url', { resourceType: 'image' });
        const coverSignedPayload = extractPayload<SignedUploadPayload>(coverSignedResponse.data);
        const coverApiKey = coverSignedPayload.apiKey ?? coverSignedPayload.api_key;
        const resolvedCloudName = cloudName || coverSignedPayload.cloudName || coverSignedPayload.cloud_name;

        if (!coverApiKey || !resolvedCloudName) {
          throw new Error('Missing Cloudinary cover upload configuration.');
        }

        const coverForm = new FormData();
        coverForm.append('file', coverFile);
        coverForm.append('api_key', coverApiKey);
        coverForm.append('timestamp', String(coverSignedPayload.timestamp));
        coverForm.append('signature', coverSignedPayload.signature);
        coverForm.append('folder', coverSignedPayload.folder);

        const coverUploadResponse = await axios.post<{ secure_url: string }>(
          `https://api.cloudinary.com/v1_1/${resolvedCloudName}/image/upload`,
          coverForm
        );

        coverArt = coverUploadResponse.data.secure_url;
      }

      setUploadStep('Saving track...');
      await api.post('/tracks', {
        title: values.title,
        genre: values.genre,
        mood: values.mood,
        description: values.description || '',
        tags: parsedTags,
        price: values.price,
        audioUrlHigh,
        audioUrlPreview,
        coverArt,
      });

      setUploadSuccess('Track uploaded successfully.');
      setUploadStep(null);
      setAudioFile(null);
      setCoverFile(null);
      setAudioUrl('');
      setCoverUrl('');
      reset();
      await fetchTracks();
      await fetchEarnings();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ?? error.message
        : error instanceof Error
          ? error.message
          : 'Upload failed. Please try again.';

      setUploadStep(null);
      setUploadError(message);
    }
  };

  const currentWalletBalance = user?.walletBalance ?? 0;

  if (!user || !isArtist) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-[#E0E0D8] rounded-lg p-6 text-[#1A1A1A]">
          Artist account access is required.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F4F0] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Artist Dashboard</h1>
          <p className="mt-2 text-[#666660]">Manage your tracks, uploads, and earnings.</p>
        </div>

        <div className="mb-6">
          <ExpandableTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {activeTab === 'tracks' && (
          <div className="bg-white border border-[#E0E0D8] rounded-lg p-6 overflow-x-auto">
            {tracksLoading && <p className="text-[#666660]">Loading tracks...</p>}
            {tracksError && <p className="text-[#D64045] mb-4">{tracksError}</p>}

            {!tracksLoading && tracks.length === 0 && (
              <div className="py-12 text-center text-[#666660]">No tracks uploaded yet</div>
            )}

            {!tracksLoading && tracks.length > 0 && (
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="text-left text-sm text-[#666660] border-b border-[#E0E0D8]">
                    <th className="py-3 pr-3">Track</th>
                    <th className="py-3 pr-3">Genre</th>
                    <th className="py-3 pr-3">Price</th>
                    <th className="py-3 pr-3">Status</th>
                    <th className="py-3 pr-3">Plays</th>
                    <th className="py-3 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map((track) => {
                    const status = getTrackStatus(track);

                    return (
                      <tr key={track._id} className="border-b border-[#E0E0D8]/80">
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-3">
                            <img src={track.coverArt} alt={track.title} className="h-12 w-12 rounded object-cover border border-[#E0E0D8]" />
                            <span className="font-medium text-[#1A1A1A]">{track.title}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-[#666660]">{track.genre}</td>
                        <td className="py-3 pr-3 text-[#1A1A1A]">${track.price.toFixed(2)}</td>
                        <td className="py-3 pr-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.classes}`}>{status.label}</span>
                        </td>
                        <td className="py-3 pr-3 text-[#1A1A1A]">{track.plays}</td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setUploadError('Edit flow can be added to an update endpoint later.')}
                              className="px-3 py-1.5 rounded-md border border-[#E0E0D8] text-[#1A1A1A] hover:bg-[#F4F4F0]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void handleDeleteTrack(track._id);
                              }}
                              className="px-3 py-1.5 rounded-md text-white bg-[#D64045] hover:bg-[#B8353A] inline-flex items-center gap-1"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="bg-white border border-[#E0E0D8] rounded-lg p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Title</label>
                <input
                  type="text"
                  {...register('title')}
                  className="w-full rounded-lg border border-[#E0E0D8] px-3 py-2 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1DA0C3]/40"
                />
                {errors.title && <p className="text-[#D64045] text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Genre</label>
                  <select
                    {...register('genre')}
                    className="w-full rounded-lg border border-[#E0E0D8] px-3 py-2 text-[#1A1A1A] bg-white"
                  >
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                  {errors.genre && <p className="text-[#D64045] text-sm mt-1">{errors.genre.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Mood</label>
                  <select
                    {...register('mood')}
                    className="w-full rounded-lg border border-[#E0E0D8] px-3 py-2 text-[#1A1A1A] bg-white"
                  >
                    {moods.map((mood) => (
                      <option key={mood} value={mood}>
                        {mood}
                      </option>
                    ))}
                  </select>
                  {errors.mood && <p className="text-[#D64045] text-sm mt-1">{errors.mood.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Description</label>
                <textarea
                  rows={4}
                  {...register('description')}
                  className="w-full rounded-lg border border-[#E0E0D8] px-3 py-2 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1DA0C3]/40"
                />
                {errors.description && <p className="text-[#D64045] text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Tags (comma-separated, max 10)</label>
                  <input
                    type="text"
                    {...register('tags')}
                    placeholder="lofi, chill, study"
                    className="w-full rounded-lg border border-[#E0E0D8] px-3 py-2 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1DA0C3]/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    {...register('price')}
                    className="w-full rounded-lg border border-[#E0E0D8] px-3 py-2 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1DA0C3]/40"
                  />
                  {errors.price && <p className="text-[#D64045] text-sm mt-1">{errors.price.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const file = event.dataTransfer.files?.[0] ?? null;
                    if (file) {
                      setAudioFile(file);
                    }
                  }}
                  className="rounded-lg border border-dashed border-[#E0E0D8] p-4 bg-[#F4F4F0]"
                >
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Audio file (.wav, .flac, .mp3) or URL</label>
                  <input
                    type="file"
                    accept=".wav,.flac,.mp3,audio/mpeg,audio/wav,audio/flac"
                    onChange={(event) => setAudioFile(event.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-[#666660] mb-3"
                  />
                  <p className="text-xs text-[#666660] mb-3">OR</p>
                  <input
                    type="text"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="Paste audio URL here (e.g., https://example.com/audio.mp3)"
                    className="w-full rounded-lg border border-[#E0E0D8] px-3 py-2 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1DA0C3]/40 text-sm"
                  />
                  <p className="text-xs text-[#666660] mt-2">
                    {audioFile ? `File: ${audioFile.name}` : audioUrl ? '✓ URL provided' : 'Choose file or paste URL'}
                  </p>
                </div>

                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const file = event.dataTransfer.files?.[0] ?? null;
                    if (file) {
                      setCoverFile(file);
                    }
                  }}
                  className="rounded-lg border border-dashed border-[#E0E0D8] p-4 bg-[#F4F4F0]"
                >
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Cover art (.jpg, .jpeg, .png, .webp) or URL</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-[#666660] mb-3"
                  />
                  <p className="text-xs text-[#666660] mb-3">OR</p>
                  <input
                    type="text"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="Paste image URL here (e.g., https://example.com/cover.jpg)"
                    className="w-full rounded-lg border border-[#E0E0D8] px-3 py-2 text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1DA0C3]/40 text-sm"
                  />
                  <p className="text-xs text-[#666660] mt-2">
                    {coverFile ? `File: ${coverFile.name}` : coverUrl ? '✓ URL provided' : 'Choose file or paste URL'}
                  </p>
                </div>
              </div>

              {uploadStep && <p className="text-[#1DA0C3] font-medium">{uploadStep}</p>}
              {uploadError && <p className="text-[#D64045]">{uploadError}</p>}
              {uploadSuccess && <p className="text-[#2D9B4F]">{uploadSuccess}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white bg-[#1DA0C3] hover:bg-[#1589A8] disabled:opacity-60"
              >
                <Upload size={16} />
                {isSubmitting ? 'Uploading...' : 'Upload Track'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {earningsLoading && <p className="text-[#666660]">Loading analytics...</p>}
            {earningsError && <p className="text-[#D64045]">{earningsError}</p>}

            <div className="bg-white p-6 rounded-lg border border-[#E0E0D8]">
              <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Plays Per Track</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={playsPerTrackData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0D8" />
                  <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={70} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="plays" fill="#1DA0C3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#E0E0D8]">
              <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Revenue Per Track</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenuePerTrackData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0D8" />
                  <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={70} />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="revenue" fill="#2D9B4F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="space-y-6">
            {earningsLoading && <p className="text-[#666660]">Loading earnings...</p>}
            {earningsError && <p className="text-[#D64045]">{earningsError}</p>}

            <div className="bg-white border border-[#E0E0D8] rounded-lg p-6">
              <p className="text-[#666660] text-sm">Wallet Balance</p>
              <p className="text-4xl font-bold text-[#1DA0C3] mt-2">${currentWalletBalance.toFixed(2)}</p>
            </div>

            <div className="bg-white border border-[#E0E0D8] rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-[#666660]">Total Earned</p>
                <p className="text-xl font-semibold text-[#1A1A1A]">${stats.totalEarnings.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-[#666660]">Total Sales</p>
                <p className="text-xl font-semibold text-[#1A1A1A]">{stats.totalSales}</p>
              </div>
              <div>
                <p className="text-sm text-[#666660]">Platform Fees</p>
                <p className="text-xl font-semibold text-[#1A1A1A]">${stats.totalPlatformFees.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white border border-[#E0E0D8] rounded-lg p-6 overflow-x-auto">
              <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Transaction History</h2>
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="text-left text-sm text-[#666660] border-b border-[#E0E0D8]">
                    <th className="py-3 pr-3">Date</th>
                    <th className="py-3 pr-3">Track</th>
                    <th className="py-3 pr-3">Buyer</th>
                    <th className="py-3 pr-3">Amount</th>
                    <th className="py-3 pr-3">Platform Fee</th>
                    <th className="py-3 pr-3">Your Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => {
                    const trackName = typeof transaction.trackId === 'string' ? 'Unknown track' : transaction.trackId.title;
                    const buyerName = isUser(transaction.buyerId)
                      ? transaction.buyerId.username || transaction.buyerId.email
                      : transaction.buyerId;

                    return (
                      <tr key={transaction._id} className="border-b border-[#E0E0D8]/80">
                        <td className="py-3 pr-3 text-[#666660]">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 pr-3 text-[#1A1A1A]">{trackName}</td>
                        <td className="py-3 pr-3 text-[#1A1A1A]">{buyerName}</td>
                        <td className="py-3 pr-3 text-[#1A1A1A]">${transaction.amount.toFixed(2)}</td>
                        <td className="py-3 pr-3 text-[#666660]">${transaction.platformFee.toFixed(2)}</td>
                        <td className="py-3 pr-3 text-[#2D9B4F] font-semibold">${transaction.artistEarnings.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
