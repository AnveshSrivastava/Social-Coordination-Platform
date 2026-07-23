import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import RequireProfile from './components/auth/RequireProfile';
import LandingPage from './pages/LandingPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import CompleteProfilePage from './pages/CompleteProfilePage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/complete-profile" element={<CompleteProfilePage />} />
            <Route
              path="/map"
              element={
                <RequireProfile requireAuth={false}>
                  <MapPage />
                </RequireProfile>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireProfile requireAuth={true}>
                  <ProfilePage />
                </RequireProfile>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
