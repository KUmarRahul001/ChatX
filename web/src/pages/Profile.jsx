import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Grid, Bookmark, UserSquare2 } from 'lucide-react';

const Profile = () => {
  const { userId } = useParams(); // URL params like /profile/:userId
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', bio: '', avatarUrl: '' });

  // Use the ID from URL if provided, otherwise default to logged-in user's profile
  const profileId = userId || currentUser?.id;
  const isOwnProfile = profileId === currentUser?.id;

  useEffect(() => {
    if (!profileId) return;

    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);
        setEditForm({
          fullName: profileData.full_name || '',
          bio: profileData.bio || '',
          avatarUrl: profileData.avatar_url || '',
        });

        // Fetch user's posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', profileId)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        setPosts(postsData || []);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [profileId]);

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.fullName,
          bio: editForm.bio,
          avatar_url: editForm.avatarUrl,
        })
        .eq('id', profileId);

      if (error) throw error;

      setProfile({ ...profile, full_name: editForm.fullName, bio: editForm.bio, avatar_url: editForm.avatarUrl });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center mt-20 text-red-500 font-semibold">
        {error || 'User not found.'}
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-[935px] mx-auto pt-6 px-4">
      {/* Profile Header */}
      <header className="flex flex-col md:flex-row gap-8 items-start mb-12">
        {/* Avatar Area */}
        <div className="w-full md:w-1/3 flex justify-center md:justify-end shrink-0 md:pr-8 lg:pr-12">
          <div className="w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
            <img
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username || 'User'}&size=150`}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Profile Info Area */}
        <div className="w-full md:w-2/3 flex flex-col items-center md:items-start">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4 w-full">
             <h2 className="text-xl font-normal text-gray-900">{profile.username}</h2>
             {isOwnProfile ? (
               <div className="flex items-center gap-2">
                 <button
                   onClick={() => setIsEditing(!isEditing)}
                   className="bg-gray-100 hover:bg-gray-200 text-sm font-semibold py-1.5 px-4 rounded-lg transition-colors"
                 >
                   {isEditing ? 'Cancel Edit' : 'Edit profile'}
                 </button>
                 <button className="bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg transition-colors">
                   <Settings size={20} />
                 </button>
               </div>
             ) : (
               <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-1.5 px-6 rounded-lg transition-colors">
                 Follow
               </button>
             )}
          </div>

          {/* Stats - Desktop (Mobile usually shows these below bio, but we keep it simple here) */}
          <div className="hidden md:flex items-center gap-10 mb-4 text-sm md:text-base">
            <div><span className="font-bold">{posts.length}</span> posts</div>
            <div><span className="font-bold">1.2M</span> followers</div>
            <div><span className="font-bold">450</span> following</div>
          </div>

          {/* Bio Area */}
          {!isEditing ? (
            <div className="text-center md:text-left text-sm md:text-base">
               <div className="font-semibold text-gray-900 mb-0.5">{profile.full_name}</div>
               <div className="whitespace-pre-line text-gray-900">{profile.bio}</div>
            </div>
          ) : (
            <div className="w-full max-w-sm flex flex-col gap-3 mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              />
              <textarea
                placeholder="Bio"
                className="w-full h-20 resize-none rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              />
              <input
                type="url"
                placeholder="Avatar URL (Optional)"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                value={editForm.avatarUrl}
                onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
              />
              <button
                onClick={handleUpdateProfile}
                className="bg-blue-500 text-white text-sm font-semibold py-2 rounded mt-2 hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Stats (Only visible on small screens) */}
      <div className="flex md:hidden justify-around items-center border-t border-gray-200 py-3 text-sm">
        <div className="flex flex-col items-center"><span className="font-bold">{posts.length}</span> <span className="text-gray-500">posts</span></div>
        <div className="flex flex-col items-center"><span className="font-bold">1.2M</span> <span className="text-gray-500">followers</span></div>
        <div className="flex flex-col items-center"><span className="font-bold">450</span> <span className="text-gray-500">following</span></div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-12 border-t border-gray-200">
         <button className="flex items-center gap-2 h-12 border-t-2 border-gray-900 text-xs font-semibold tracking-widest text-gray-900 uppercase">
           <Grid size={16} /> POSTS
         </button>
         {isOwnProfile && (
           <button className="flex items-center gap-2 h-12 border-t-2 border-transparent text-gray-500 text-xs font-semibold tracking-widest hover:text-gray-900 uppercase">
             <Bookmark size={16} /> SAVED
           </button>
         )}
         <button className="flex items-center gap-2 h-12 border-t-2 border-transparent text-gray-500 text-xs font-semibold tracking-widest hover:text-gray-900 uppercase">
           <UserSquare2 size={16} /> TAGGED
         </button>
      </div>

      {/* Grid of Posts */}
      <div className="grid grid-cols-3 gap-1 md:gap-4 mt-4">
        {posts.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="w-16 h-16 border-2 border-gray-900 rounded-full flex items-center justify-center mb-4">
              <Grid size={32} className="text-gray-900" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Posts Yet</h2>
            <p className="text-sm">When you share photos, they will appear on your profile.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="relative group aspect-square bg-gray-100 overflow-hidden cursor-pointer">
              <img src={post.image_url} alt="Post" className="w-full h-full object-cover group-hover:opacity-70 transition-opacity" />
              <div className="absolute inset-0 hidden group-hover:flex items-center justify-center gap-6 bg-black/30 text-white font-bold transition-opacity">
                {/* Overlay stats (mock) */}
                <div className="flex items-center gap-2"><Heart size={20} className="fill-white" /> 42</div>
                <div className="flex items-center gap-2"><MessageCircle size={20} className="fill-white" /> 5</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
