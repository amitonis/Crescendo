import { useState, useEffect } from 'react';
import { 
  ListMusic, Users, BarChart3, CheckCircle, 
  XCircle, Ban, UserCheck, Music, DollarSign, TrendingUp, Play
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { ExpandableTabs } from '../components/ui/expandable-tabs';
import { useAuth } from '../hooks/useAuth';
import { usePlayerStore } from '../store/usePlayerStore';
import api from '../services/api';
import { Track, User, ApiResponse } from '../types';
import { cn } from '../lib/utils';

export default function AdminPanel() {
  const { user } = useAuth();
  const { playTrack } = usePlayerStore();
  const [activeTab, setActiveTab] = useState<string>('queue');
  
  // States for Queue
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);
  
  // States for Users
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // States for Stats
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);

  const TABS = [
    { id: 'queue', label: 'Moderation Queue', icon: <ListMusic size={18} /> },
    { id: 'users', label: 'Users', icon: <Users size={18} /> },
    { id: 'stats', label: 'Statistics', icon: <BarChart3 size={18} /> },
  ];

  const fetchQueue = async () => {
    try {
      setQueueLoading(true);
      const { data } = await api.get<ApiResponse<Track[]>>('/admin/queue');
      if (data.success && data.data) {
        setQueue(data.data);
      }
    } catch (err: any) {
      console.error("Queue fetch error", err);
      if (activeTab === 'queue') setError('Failed to load moderation queue');
    } finally {
      setQueueLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const { data } = await api.get<ApiResponse<User[]>>('/admin/users');
      if (data.success && data.data) {
        setUsers(data.data);
      }
    } catch (err: any) {
      console.error("Users fetch error", err);
      if (activeTab === 'users') setError('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const { data } = await api.get<ApiResponse<any>>('/admin/stats');
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (err: any) {
      console.error("Stats fetch error", err);
      if (activeTab === 'stats') setError('Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    setError(null);
    if (!user || user.role !== 'admin') return;

    if (activeTab === 'queue') fetchQueue();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'stats') fetchStats();
  }, [activeTab, user]);

  const handleApprove = async (trackId: string) => {
    try {
      await api.put(`/admin/approve/${trackId}`);
      fetchQueue();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve track');
    }
  };

  const handleReject = async (trackId: string) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return; // user cancelled
    
    try {
      // API expects reason but might still work without it depending on implementation
      await api.put(`/admin/reject/${trackId}`, { reason });
      fetchQueue();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject track');
    }
  };

  const handleToggleBan = async (userId: string, isBanned: boolean) => {
    try {
      if (isBanned) {
        await api.put(`/admin/unban/${userId}`);
      } else {
        await api.put(`/admin/ban/${userId}`);
      }
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isBanned ? 'unban' : 'ban'} user`);
    }
  };

  const getArtistName = (artistId: string | User): string => {
    if (typeof artistId === 'string') return 'Unknown Artist';
    return artistId.username || 'Unknown Artist';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playPreview = (track: Track) => {
    playTrack(track);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Access Denied</h2>
        <p className="mt-2 text-[#666660]">You need administrator privileges to view this page.</p>
      </div>
    );
  }

  const PIE_COLORS = {
    artists: '#1DA0C3',
    fans: '#A8A9AD',
    admins: '#E5A020'
  };

  const filteredUsers = roleFilter === 'all' 
    ? users 
    : users.filter(u => u.role === roleFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Admin Panel</h1>
          <p className="text-[#666660] mt-1">Manage tracks, users, and platform settings</p>
        </div>
        
        <div className="bg-white p-1 rounded-xl shadow-sm border border-[#E0E0D8] inline-block">
          <ExpandableTabs 
            tabs={TABS as any} 
            activeTab={activeTab}
            className="border-none" 
            onTabChange={(tabId: string) => setActiveTab(tabId)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {/* MODERATION QUEUE TAB */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Pending Approvals</h2>
          
          {queueLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-[#E0E0D8] rounded-lg p-4 flex gap-4 animate-pulse">
                  <div className="w-[80px] h-[80px] bg-[#F4F4F0] rounded"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-[#F4F4F0] rounded w-1/4"></div>
                    <div className="h-3 bg-[#F4F4F0] rounded w-1/5"></div>
                    <div className="flex gap-2">
                       <div className="h-5 bg-[#F4F4F0] rounded-full w-16"></div>
                       <div className="h-5 bg-[#F4F4F0] rounded-full w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : queue.length === 0 ? (
            <div className="bg-white border border-[#E0E0D8] rounded-lg shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-[#2D9B4F]">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-medium text-[#1A1A1A] mb-2">No tracks pending approval</h3>
              <p className="text-[#666660]">You're all caught up! There are no tracks in the moderation queue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {queue.map(track => (
                <div key={track._id} className="bg-white border border-[#E0E0D8] rounded-lg p-4 flex gap-4 transition-all hover:shadow-md">
                  <div className="relative group w-[80px] h-[80px] shrink-0">
                    <img 
                      src={track.coverArt || '/placeholder-cover.jpg'} 
                      alt={track.title} 
                      className="w-full h-full object-cover rounded shadow-sm"
                    />
                    <button 
                      onClick={() => playPreview(track)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded"
                    >
                      <Play className="text-white fill-white" size={24} />
                    </button>
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-medium text-[#1A1A1A] truncate">{track.title}</h4>
                      <p className="text-sm text-[#666660] truncate">{getArtistName(track.artistId)}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-[#1DA0C3]/10 text-[#1DA0C3] uppercase tracking-wider font-semibold">
                          {track.genre}
                        </span>
                        {track.mood && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-[#F4F4F0] text-[#666660] uppercase tracking-wider font-semibold">
                            {track.mood}
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-xs rounded-full bg-[#F4F4F0] text-[#666660]">
                          {formatDuration(track.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 shrink-0 justify-center">
                    <button 
                      onClick={() => handleApprove(track._id)}
                      className="bg-[#2D9B4F] hover:bg-[#218040] text-white rounded px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium transition-colors"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => handleReject(track._id)}
                      className="bg-[#D64045] hover:bg-[#B53337] text-white rounded px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium transition-colors"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">User Management</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="role-filter" className="text-sm text-[#666660] font-medium">Filter:</label>
              <select 
                id="role-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white border border-[#E0E0D8] rounded-md px-3 py-1.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1DA0C3]"
              >
                <option value="all">All Roles</option>
                <option value="artist">Artists</option>
                <option value="fan">Fans</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-[#E0E0D8] rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F4F0] border-b border-[#E0E0D8]">
                    <th className="px-6 py-3 text-xs font-semibold text-[#666660] uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-xs font-semibold text-[#666660] uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-xs font-semibold text-[#666660] uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-xs font-semibold text-[#666660] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-[#666660] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E0D8]">
                  {usersLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-[#F4F4F0] rounded w-3/4 mb-2"/><div className="h-3 bg-[#F4F4F0] rounded w-1/2"/></td>
                        <td className="px-6 py-4"><div className="h-5 bg-[#F4F4F0] rounded-full w-16"/></td>
                        <td className="px-6 py-4"><div className="h-4 bg-[#F4F4F0] rounded w-20"/></td>
                        <td className="px-6 py-4"><div className="h-4 bg-[#F4F4F0] rounded-full w-16"/></td>
                        <td className="px-6 py-4 text-right"><div className="h-6 bg-[#F4F4F0] rounded w-16 ml-auto"/></td>
                      </tr>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-[#666660]">
                        No users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 shrink-0">
                              <img className="h-10 w-10 rounded-full object-cover border border-[#E0E0D8]" src={u.avatar || '/default-avatar.png'} alt="" />
                            </div>
                            <div className="ml-4 min-w-0">
                              <div className="text-sm font-medium text-[#1A1A1A] truncate">{u.username}</div>
                              <div className="text-sm text-[#666660] truncate">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            "px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase tracking-wider",
                            u.role === 'artist' ? "bg-[#1DA0C3]/10 text-[#1DA0C3]" : 
                            u.role === 'admin' ? "bg-[#E5A020]/10 text-[#E5A020]" : 
                            "bg-[#A8A9AD]/10 text-[#666660]"
                          )}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666660]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center gap-1.5 text-sm">
                            <span className={cn("w-2 h-2 rounded-full", u.isBanned ? "bg-[#D64045]" : "bg-[#2D9B4F]")}></span>
                            {u.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleBan(u._id, u.isBanned)}
                              className={cn(
                                "rounded px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ml-auto",
                                u.isBanned 
                                  ? "bg-[#2D9B4F]/10 text-[#2D9B4F] hover:bg-[#2D9B4F]/20" 
                                  : "text-[#D64045] hover:bg-[#D64045]/10"
                              )}
                            >
                              {u.isBanned ? (
                                <><UserCheck size={14} /> Unban</>
                              ) : (
                                <><Ban size={14} /> Ban</>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Platform Overview</h2>
          
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white border border-[#E0E0D8] rounded-lg p-6 h-32 animate-pulse flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="h-4 bg-[#F4F4F0] rounded w-1/2"></div>
                    <div className="h-10 w-10 bg-[#F4F4F0] rounded-full"></div>
                  </div>
                  <div className="h-8 bg-[#F4F4F0] rounded w-1/3 mt-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E0E0D8] rounded-lg p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[#666660]">Total Users</h3>
                    <div className="w-10 h-10 rounded-full bg-[#1DA0C3]/10 flex items-center justify-center text-[#1DA0C3]">
                      <Users size={20} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-[#1A1A1A]">{stats?.totalUsers || 0}</p>
                </div>
                
                <div className="bg-white border border-[#E0E0D8] rounded-lg p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[#666660]">Total Tracks</h3>
                    <div className="w-10 h-10 rounded-full bg-[#E5A020]/10 flex items-center justify-center text-[#E5A020]">
                      <Music size={20} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-[#1A1A1A]">{stats?.totalTracks || 0}</p>
                </div>
                
                <div className="bg-white border border-[#E0E0D8] rounded-lg p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[#666660]">Transactions</h3>
                    <div className="w-10 h-10 rounded-full bg-[#A8A9AD]/10 flex items-center justify-center text-[#666660]">
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-[#1A1A1A]">{stats?.totalTransactions || 0}</p>
                </div>
                
                <div className="bg-white border border-[#E0E0D8] rounded-lg p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[#666660]">Platform Revenue</h3>
                    <div className="w-10 h-10 rounded-full bg-[#2D9B4F]/10 flex items-center justify-center text-[#2D9B4F]">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-[#1A1A1A]">${stats?.platformRevenue ? stats.platformRevenue.toFixed(2) : '0.00'}</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* User Demographics */}
                <div className="bg-white border border-[#E0E0D8] rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">User Demographics</h3>
                  <div className="h-64">
                    {stats?.userDemographics ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Artists', value: stats.userDemographics.artists || 0 },
                              { name: 'Fans', value: stats.userDemographics.fans || 0 },
                              { name: 'Admins', value: stats.userDemographics.admins || 0 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill={PIE_COLORS.artists} />
                            <Cell fill={PIE_COLORS.fans} />
                            <Cell fill={PIE_COLORS.admins} />
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [`${value} Users`, undefined]}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #E0E0D8', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-[#666660]">No demographic data available</div>
                    )}
                  </div>
                </div>

                {/* System Metrics Overview */}
                <div className="bg-white border border-[#E0E0D8] rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">Platform Metrics</h3>
                  <div className="h-64">
                    {stats ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Tracks', count: stats.totalTracks || 0 },
                            { name: 'Transactions', count: stats.totalTransactions || 0 },
                            { name: 'Users', count: stats.totalUsers || 0 }
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0D8" />
                          <XAxis dataKey="name" tick={{fill: '#666660'}} tickLine={false} axisLine={{stroke: '#E0E0D8'}} />
                          <YAxis tick={{fill: '#666660'}} tickLine={false} axisLine={false} />
                          <Tooltip 
                            cursor={{fill: '#F4F4F0'}}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #E0E0D8', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                          />
                          <Bar dataKey="count" fill="#1DA0C3" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-[#666660]">No metrics data available</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
