import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar({ user, setUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const navLinks = [
    { name: 'Feed', path: '/feed', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15' },
    { name: 'Search', path: '/search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { name: 'Agent', path: '/agent', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { name: 'Alerts', path: '/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' }
  ];

  return (
    <div className="sticky top-4 z-50 px-4 w-full max-w-4xl mx-auto">
      <nav className="bg-gray-900/70 backdrop-blur-md shadow-2xl shadow-indigo-900/10 border border-gray-700 rounded-3xl">
        <div className="p-3 px-6 flex justify-between items-center h-16">
          
          {/* Left side: Logo & Links */}
          <div className="flex items-center gap-8">
            <Link to="/feed" className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:opacity-80 transition">
              Orbit
            </Link>
            
            <div className="hidden md:flex gap-2 items-center pl-8 border-l border-gray-700/50">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link 
                    key={link.name} 
                    to={link.path} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-300 ${isActive ? 'bg-indigo-500/15 text-indigo-400 shadow-inner' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={link.icon} />
                    </svg>
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side: User & Menu */}
          <div className="flex items-center gap-4">
            <Link to={`/profile/${user._id}`} className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-transparent hover:border-gray-700 hover:bg-gray-800/50 group cursor-pointer transition-all">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform shadow-md">
                {user.username[0].toUpperCase()}
              </div>
              <span className="font-bold text-gray-200 hidden sm:block group-hover:text-white transition-colors">{user.username}</span>
            </Link>
            
            {/* Dropdown Menu container */}
            <div className="relative">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 200)}
                title="More options"
                className={`p-2 rounded-full transition-all flex items-center justify-center ${menuOpen ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              {/* Dropdown Box */}
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-5 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-bold transition flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </nav>
    </div>
  );
}
