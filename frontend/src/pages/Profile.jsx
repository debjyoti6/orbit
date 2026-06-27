import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

export default function Profile({ user }) {
  const { id } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchUserAndPosts = async () => {
    try {
      const userRes = await axios.get(`${API_URL}/users/${id}`);
      setProfileUser(userRes.data);
      setIsFollowing(userRes.data.followers?.includes(user._id));
      document.title = `${userRes.data.username}'s Profile | Orbit`;

      const postRes = await axios.get(`${API_URL}/posts/profile/${id}`);
      setPosts(postRes.data.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUserAndPosts();
  }, [id]);

  const handleFollow = async () => {
    try {
      await axios.put(`${API_URL}/users/${id}/follow`, { userId: user._id });
      fetchUserAndPosts(); 
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.put(`${API_URL}/posts/${postId}/like`, { userId: user._id });
      fetchUserAndPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${API_URL}/posts/${postId}`);
      fetchUserAndPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpdate = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          await axios.put(`${API_URL}/users/${user._id}`, { [type]: reader.result });
          fetchUserAndPosts();
        } catch (err) {
          console.error(err);
        }
      };
    }
  };

  if (!profileUser) return <div className="text-center mt-20 text-gray-500 font-bold">Loading Profile...</div>;

  const isOwnProfile = user._id === profileUser._id;

  return (
    <div className="flex flex-col gap-10 w-full max-w-3xl mx-auto py-8 px-4">
      
      {/* Profile Header */}
      <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden mb-4">
        {/* Cover Photo */}
        <div className="relative h-32 sm:h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
          {profileUser.coverPicture && (
            <img src={profileUser.coverPicture} alt="Cover" className="w-full h-full object-cover" />
          )}
          {isOwnProfile && (
            <label className="absolute bottom-2 right-2 bg-gray-900/70 p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors shadow-lg border border-gray-600">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpdate(e, 'coverPicture')} />
            </label>
          )}
        </div>
        
        <div className="px-8 pb-8 text-center sm:text-left relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            
            {/* Avatar */}
            <div className="relative w-32 h-32 bg-gray-900 rounded-full p-1.5 flex-shrink-0 shadow-xl group">
              <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                {profileUser.profilePicture ? (
                  <img src={profileUser.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl text-white font-extrabold uppercase">{profileUser.username[0]}</span>
                )}
              </div>
              {isOwnProfile && (
                <label className="absolute bottom-1 right-1 bg-gray-800 p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors shadow-lg border border-gray-600 opacity-0 group-hover:opacity-100">
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpdate(e, 'profilePicture')} />
                </label>
              )}
            </div>
            
            {!isOwnProfile && (
              <button 
                onClick={handleFollow}
                className={`px-8 py-2.5 rounded-full font-bold text-white shadow-lg transition-all hover:scale-105 hover:-translate-y-0.5 ${isFollowing ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600 border border-indigo-500/50'}`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-100 tracking-tight">{profileUser.username}</h2>
          <p className="text-gray-400 mt-1 font-medium">{profileUser.email}</p>
          
          <div className="flex justify-center sm:justify-start gap-6 mt-6">
            <div className="flex flex-col items-center sm:items-start group">
               <span className="font-black text-2xl text-gray-100 group-hover:text-indigo-400 transition-colors">{profileUser.followers?.length || 0}</span>
               <span className="text-gray-500 font-semibold text-sm tracking-wide uppercase">Followers</span>
            </div>
            <div className="flex flex-col items-center sm:items-start group">
               <span className="font-black text-2xl text-gray-100 group-hover:text-indigo-400 transition-colors">{profileUser.following?.length || 0}</span>
               <span className="text-gray-500 font-semibold text-sm tracking-wide uppercase">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* User's Posts */}
      <div className="flex flex-col gap-6">
        <h3 className="font-bold text-2xl text-gray-100 flex items-center gap-3 mb-2 px-2">
          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" /></svg>
          Posts
        </h3>
        
        {posts.map(post => (
          <div key={post._id} className="bg-gray-900/40 backdrop-blur-sm p-5 sm:p-6 rounded-3xl border border-gray-700/50 flex flex-col gap-4 shadow-xl hover:bg-gray-900/60 transition-colors duration-300">
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-300 font-bold text-lg border border-indigo-500/30 group-hover:border-indigo-400 transition-colors shadow-sm">
                  {post.userId?.username?.[0]?.toUpperCase() || profileUser.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-[1.05rem] text-gray-100 group-hover:text-indigo-300 transition-colors">
                    {post.userId?.username || profileUser.username}
                  </div>
                  <div className="text-gray-500 text-xs font-medium tracking-wide">
                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Optional Delete Button */}
              {isOwnProfile && (
                <button 
                  onClick={() => handleDelete(post._id)} 
                  title="Delete Post"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
            
            {post.content && (
              <p className="text-gray-300 text-[1.05rem] whitespace-pre-wrap leading-relaxed px-1">
                {post.content}
              </p>
            )}
            
            {post.image && (
              <div className="mt-1 rounded-2xl overflow-hidden border border-gray-700/50 shadow-lg shadow-black/20 bg-black/40 relative group">
                <img src={post.image} alt="Post" className="w-full max-h-[550px] object-contain group-hover:scale-[1.01] transition-transform duration-500" />
              </div>
            )}
            
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
            <p className="text-lg font-medium">{isOwnProfile ? "You haven't posted anything yet." : "This user hasn't posted anything yet."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
