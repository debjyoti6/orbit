import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

export default function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts`);
      setPosts(res.data.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    document.title = 'Feed | Orbit';
    fetchPosts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return; // Can post text or image or both
    
    try {
      setError('');
      await axios.post(`${API_URL}/posts`, { userId: user._id, content, image });
      setContent('');
      setImage('');
      fetchPosts();
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Something went wrong. Please try again.');
      }
      console.error(err);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.put(`${API_URL}/posts/${postId}/like`, { userId: user._id });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${API_URL}/posts/${postId}`);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-3xl mx-auto py-8 px-4">
      {/* Create Post Section */}
      <div className="bg-gray-900/40 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-xl border border-gray-700/50">
        
        <form onSubmit={handlePost} className="flex flex-col gap-3">
          
          <div className="flex gap-3 items-start">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex-shrink-0 flex items-center justify-center text-indigo-300 font-bold border border-indigo-500/30 mt-1 shadow-sm">
              {user.username[0].toUpperCase()}
            </div>
            
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setError(''); }}
              placeholder={`What's on your mind, ${user.username}?`}
              className="w-full bg-transparent border-none p-2 focus:outline-none focus:ring-0 resize-none min-h-[60px] text-gray-100 placeholder-gray-500 text-lg"
            ></textarea>
          </div>
          
          {image && (
            <div className="relative mt-1 ml-13 rounded-2xl overflow-hidden border border-gray-700/50 shadow-md">
              <img src={image} alt="Preview" className="w-full max-h-64 object-cover" />
              <button 
                type="button" 
                onClick={() => setImage('')} 
                className="absolute top-2 right-2 bg-gray-900/80 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transition"
              >
                ✕
              </button>
            </div>
          )}

          {error && (
            <div className="text-red-400 bg-red-400/10 p-3 rounded-xl text-sm font-medium border border-red-400/20 mt-1 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mt-2 border-t border-gray-700/50 pt-3">
            <label className="cursor-pointer text-indigo-400 font-semibold hover:text-indigo-300 bg-transparent hover:bg-gray-700/50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Photo
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            
            <button 
              type="submit" 
              disabled={!content.trim() && !image}
              className="disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-500 text-white px-6 py-2 rounded-full hover:bg-indigo-400 font-bold transition-all disabled:hover:bg-indigo-500 shadow-md hover:shadow-lg"
            >
              Post
            </button>
          </div>
        </form>
      </div>

      {/* Feed Section */}
      <div className="flex flex-col gap-6">
        {posts.map(post => (
          <div key={post._id} className="bg-gray-900/40 backdrop-blur-sm p-5 sm:p-6 rounded-3xl border border-gray-700/50 flex flex-col gap-4 shadow-xl hover:bg-gray-900/60 transition-colors duration-300">
            
            {/* Post Header */}
            <div className="flex justify-between items-center">
              <Link to={`/profile/${post.userId?._id}`} className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-300 font-bold text-lg border border-indigo-500/30 group-hover:border-indigo-400 transition-colors shadow-sm">
                  {post.userId?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="font-bold text-[1.05rem] text-gray-100 group-hover:text-indigo-300 transition-colors">
                    {post.userId?.username || 'Unknown User'}
                  </div>
                  <div className="text-gray-500 text-xs font-medium tracking-wide">
                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </Link>
              
              {/* Optional Delete Button */}
              {post.userId?._id === user._id && (
                <button 
                  onClick={() => handleDelete(post._id)} 
                  title="Delete Post"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
            
            {/* Post Content */}
            {post.content && (
              <p className="text-gray-300 text-[1.05rem] whitespace-pre-wrap leading-relaxed px-1">
                {post.content}
              </p>
            )}
            
            {/* Post Image */}
            {post.image && (
              <div className="mt-1 rounded-2xl overflow-hidden border border-gray-700/50 shadow-lg shadow-black/20 bg-black/40 relative group">
                <img src={post.image} alt="Post" className="w-full max-h-[550px] object-contain group-hover:scale-[1.01] transition-transform duration-500" />
              </div>
            )}
            
            {/* Post Actions */}
            <div className="flex justify-between items-center mt-2 px-1">
              <button 
                onClick={() => handleLike(post._id)}
                className={`group flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 border ${post.likes?.includes(user._id) ? 'bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]' : 'bg-transparent text-gray-400 border-gray-700/50 hover:bg-gray-800 hover:text-gray-200'}`}
              >
                <svg className={`w-5 h-5 transition-transform group-hover:scale-110 ${post.likes?.includes(user._id) ? 'fill-pink-400' : 'fill-transparent'}`} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {post.likes?.includes(user._id) ? 'Liked' : 'Like'} 
                {post.likes?.length > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-md text-xs ${post.likes?.includes(user._id) ? 'bg-pink-500/20' : 'bg-gray-700/50'}`}>
                    {post.likes?.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="text-center p-12 bg-gray-900/40 backdrop-blur-sm rounded-3xl shadow-sm text-gray-400 border border-gray-700/50">
            <div className="text-5xl mb-4 opacity-50">📭</div>
            <p className="text-lg font-medium">No posts yet. Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}
