import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import MapPage from './pages/Map';
import MapWithList from './pages/MapWithList';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import Announcements from './pages/Announcements';
import MyAnnouncements from './pages/MyAnnouncements';
import Newsletter from './pages/Newsletter';
import CreateAnnouncement from './pages/CreateAnnouncement';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './utils/roles';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}> 
        <Route index element={<Home />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="map" element={<MapWithList />} />
        <Route path="map-old" element={<MapPage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="create-announcement"
          element={
            <ProtectedRoute requiredPermission="create_announcement">
              <CreateAnnouncement />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute requiredPermission="access_admin_panel">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-announcements"
          element={
            <ProtectedRoute requireAuth={true}>
              <MyAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="newsletter" element={<Newsletter />} />
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
