import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/layout/Footer';
import AudioPlayer from './components/layout/AudioPlayer';
import Navbar from './components/layout/Navbar';
import { useAuth } from './hooks/useAuth';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const TrackDetail = lazy(() => import('./pages/TrackDetail'));
const ArtistProfilePage = lazy(() => import('./pages/ArtistProfile'));
const ArtistDashboard = lazy(() => import('./pages/ArtistDashboard'));
const FanCollection = lazy(() => import('./pages/FanCollection'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

type AppRole = 'artist' | 'fan' | 'admin';

interface ProtectedRouteProps {
  children: JSX.Element;
  roles?: AppRole[];
}

function LoadingSpinner() {
  return (
    <div className="py-16 px-8 text-center text-text-primary">Loading...</div>
  );
}

function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const { checkAuth, isLoading } = useAuth();

  useEffect(() => {
    void checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/track/:id" element={<TrackDetail />} />
            <Route path="/artist/:id" element={<ArtistProfilePage />} />
            <Route
              path="/dashboard"
              element={(
                <ProtectedRoute roles={['artist']}>
                  <ArtistDashboard />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/collection"
              element={(
                <ProtectedRoute roles={['fan']}>
                  <FanCollection />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin"
              element={(
                <ProtectedRoute roles={['admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              )}
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <AudioPlayer />
    </div>
  );
}

export default App;
