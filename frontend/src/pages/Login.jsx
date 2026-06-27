import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Login({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Login | Orbit';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/users/login' : '/users/register';
      const payload = isLogin ? { email: form.email, password: form.password } : form;
      
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div className="flex justify-center items-center h-full mt-24 px-4">
      <div className="bg-gray-900/60 backdrop-blur-xl p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-900/20 w-full max-w-lg border-t-[10px] border-indigo-500 border border-gray-700/50 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

        <h2 className="text-4xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 relative z-10 tracking-tight">
          {isLogin ? 'Welcome Back' : 'Join Orbit'}
        </h2>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl mb-8 text-sm text-center font-bold relative z-10">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              required
              className="bg-black/40 border border-gray-700/50 p-4 rounded-2xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-lg text-gray-100 placeholder-gray-500 shadow-inner"
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            required
            className="bg-black/40 border border-gray-700/50 p-4 rounded-2xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-lg text-gray-100 placeholder-gray-500 shadow-inner"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="bg-black/40 border border-gray-700/50 p-4 rounded-2xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-lg text-gray-100 placeholder-gray-500 shadow-inner"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          
          <button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-full hover:opacity-90 font-bold mt-4 shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-lg">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-700/50 text-center text-gray-400 font-medium relative z-10">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-indigo-400 cursor-pointer font-bold hover:text-indigo-300 transition-colors">
            {isLogin ? 'Register here' : 'Login here'}
          </span>
        </div>
      </div>
    </div>
  );
}
