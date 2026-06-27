import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import Agent from './pages/Agent';
import Navbar from './components/Navbar';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
        {user && <Navbar user={user} setUser={setUser} />}
        
        <main className="flex-1 w-full max-w-4xl mx-auto p-4">
          <Routes>
            <Route path="/" element={!user ? <Login setUser={setUser} /> : <Navigate to="/feed" />} />
            <Route path="/feed" element={user ? <Feed user={user} /> : <Navigate to="/" />} />
            <Route path="/search" element={user ? <Search /> : <Navigate to="/" />} />
            <Route path="/profile/:id" element={user ? <Profile user={user} /> : <Navigate to="/" />} />
            <Route path="/notifications" element={user ? <Notifications user={user} /> : <Navigate to="/" />} />
            <Route path="/agent" element={user ? <Agent user={user} /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
