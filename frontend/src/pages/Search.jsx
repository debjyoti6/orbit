import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    document.title = 'Search | Orbit';
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/users/search/${query}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    
    // Add a small delay so it doesn't search on every single keystroke instantly
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto py-8 px-4">
      
      {/* Search Input */}
      <div className="bg-gray-900/40 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-700/50">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-3">
          <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          Find People
        </h2>
        <input 
          type="text" 
          placeholder="Search for a username..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-black/40 border border-gray-700/50 p-4 rounded-2xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-lg text-gray-100 placeholder-gray-500 shadow-inner"
        />
      </div>

      {/* Results */}
      <div className="flex flex-col gap-4">
        {results.map(user => (
          <div key={user._id} className="bg-gray-900/40 backdrop-blur-sm p-5 rounded-3xl shadow-lg border border-gray-700/50 flex justify-between items-center transition-all hover:bg-gray-900/60 hover:scale-[1.01] duration-300">
            
            <div className="flex items-center gap-4 group">
              <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-indigo-300 font-bold text-2xl border border-indigo-500/30 group-hover:border-indigo-400 transition-colors shadow-sm">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-100 text-xl group-hover:text-indigo-300 transition-colors">{user.username}</h3>
                <p className="text-gray-500 text-sm mt-0.5 font-medium tracking-wide">{user.followers?.length || 0} followers</p>
              </div>
            </div>

            <Link 
              to={`/profile/${user._id}`} 
              className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-6 py-2.5 rounded-full font-bold hover:bg-indigo-500/20 transition-all hover:scale-105"
            >
              View Profile
            </Link>
          </div>
        ))}
        
        {query && results.length === 0 && (
          <div className="text-center p-12 bg-gray-900/40 backdrop-blur-sm rounded-3xl shadow-sm text-gray-400 border border-gray-700/50">
             <div className="text-4xl mb-4 opacity-50">🔍</div>
            <p className="text-lg font-medium">No users found matching "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
