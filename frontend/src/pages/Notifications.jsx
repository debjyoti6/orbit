import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

export default function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    document.title = 'Notifications | Orbit';
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_URL}/notifications/${user._id}`);
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, [user._id]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/notifications/read-all/${user._id}`);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center bg-gray-900/40 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-gray-700/50">
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
          <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          Notifications
        </h2>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-full hover:bg-indigo-500/20 transition-all"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {notifications.map(n => (
          <div 
            key={n._id} 
            onClick={() => !n.read && markAsRead(n._id)}
            className={`flex items-start gap-4 p-5 rounded-3xl shadow-sm border transition-all duration-300 ${n.read ? 'bg-gray-900/20 border-gray-800' : 'bg-gray-900/60 border-indigo-500/30 cursor-pointer hover:bg-gray-900/80'}`}
          >
            
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-indigo-300 font-bold border border-indigo-500/30 flex-shrink-0 overflow-hidden">
              {n.sender?.profilePicture ? (
                <img src={n.sender.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                n.sender?.username?.[0]?.toUpperCase()
              )}
            </div>

            <div className="flex-1">
              <p className="text-gray-200 text-[1.05rem]">
                <Link to={`/profile/${n.sender?._id}`} className="font-bold hover:text-indigo-400 transition-colors">
                  {n.sender?.username}
                </Link>
                {' '}
                {n.type === 'like' ? (
                  <span>liked your post</span>
                ) : (
                  <span>started following you</span>
                )}
              </p>
              
              <p className="text-gray-500 text-xs font-medium tracking-wide mt-1">
                {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>

              {n.type === 'like' && n.post && (
                <div className="mt-3 bg-black/30 p-3 rounded-xl border border-gray-700/30 flex gap-3 items-center">
                  {n.post.image && (
                    <img src={n.post.image} alt="Post" className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  {n.post.content && (
                    <p className="text-gray-400 text-sm truncate max-w-[200px] sm:max-w-[400px]">{n.post.content}</p>
                  )}
                </div>
              )}
            </div>
            
            {!n.read && (
              <div className="w-3 h-3 rounded-full bg-indigo-500 mt-2 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center p-12 bg-gray-900/40 backdrop-blur-sm rounded-3xl shadow-sm text-gray-400 border border-gray-700/50">
             <div className="text-5xl mb-4 opacity-50">🔕</div>
            <p className="text-lg font-medium">No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
