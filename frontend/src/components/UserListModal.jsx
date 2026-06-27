import { Link } from 'react-router-dom';

export default function UserListModal({ isOpen, onClose, title, users }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/50 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-800">
          <h2 className="text-xl font-bold text-gray-100">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex flex-col gap-3">
          {users && users.length > 0 ? (
            users.map(u => (
              <Link 
                key={u._id} 
                to={`/profile/${u._id}`}
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-800 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-300 font-bold text-lg border border-indigo-500/30 group-hover:border-indigo-400 overflow-hidden">
                  {u.profilePicture ? (
                    <img src={u.profilePicture} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    u.username?.[0]?.toUpperCase() || '?'
                  )}
                </div>
                <div className="font-bold text-gray-100 group-hover:text-indigo-300 transition-colors">
                  {u.username}
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No users to show.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
