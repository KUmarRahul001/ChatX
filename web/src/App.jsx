import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';

// Placeholder Pages for remaining nav items
const Search = () => <div className="p-8 text-2xl font-bold">Search (Coming soon)</div>;
const Explore = () => <div className="p-8 text-2xl font-bold">Explore (Coming soon)</div>;
const Reels = () => <div className="p-8 text-2xl font-bold">Reels (Coming soon)</div>;
const Messages = () => <div className="p-8 text-2xl font-bold">Messages (Coming soon)</div>;
const Notifications = () => <div className="p-8 text-2xl font-bold">Notifications (Coming soon)</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes inside Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/reels" element={<Reels />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
