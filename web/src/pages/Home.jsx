import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // In a real app with follows, we'd query posts from followed users.
      // For Phase 1, we fetch all posts to simulate a feed.
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          image_url,
          caption,
          created_at,
          profiles (id, username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-8 justify-center">
      {/* Main Feed Column */}
      <div className="w-full max-w-[470px] flex flex-col gap-6">
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">No posts to show yet. Follow people or create a post!</div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="bg-white border border-gray-200 rounded-[8px] pb-4">
              {/* Post Header */}
              <div className="flex items-center justify-between p-3">
                <Link to={`/profile/${post.profiles?.id}`} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr p-[2px] from-yellow-400 via-red-500 to-purple-500">
                    <img
                      src={post.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${post.profiles?.username || 'User'}`}
                      alt={post.profiles?.username}
                      className="w-full h-full object-cover rounded-full border border-white"
                    />
                  </div>
                  <span className="font-semibold text-sm">{post.profiles?.username}</span>
                  <span className="text-gray-500 text-sm">• 1h</span>
                </Link>
                <button className="text-gray-900 hover:text-gray-500">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Post Image */}
              <div className="w-full bg-gray-100 aspect-square overflow-hidden flex items-center justify-center">
                <img
                  src={post.image_url}
                  alt="Post content"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Post Actions */}
              <div className="px-4 pt-3 flex items-center justify-between">
                <div className="flex gap-4">
                  <button className="hover:opacity-50 transition-opacity"><Heart size={24} /></button>
                  <button className="hover:opacity-50 transition-opacity"><MessageCircle size={24} /></button>
                  <button className="hover:opacity-50 transition-opacity"><Send size={24} /></button>
                </div>
                <button className="hover:opacity-50 transition-opacity"><Bookmark size={24} /></button>
              </div>

              {/* Likes count (Mock) */}
              <div className="px-4 mt-2 font-semibold text-sm">
                42 likes
              </div>

              {/* Caption */}
              <div className="px-4 mt-1 text-sm">
                <span className="font-semibold mr-2">{post.profiles?.username}</span>
                <span>{post.caption}</span>
              </div>

              {/* View Comments */}
              <div className="px-4 mt-1 text-sm text-gray-500 cursor-pointer">
                View all 5 comments
              </div>

              {/* Add Comment */}
              <div className="px-4 mt-2 flex items-center gap-2">
                 <input type="text" placeholder="Add a comment..." className="text-sm w-full outline-none py-1" />
                 <button className="text-blue-500 font-semibold text-sm hover:text-blue-700">Post</button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Right Sidebar (Suggestions) - Optional for MVP but good for layout */}
      <div className="hidden lg:block w-[319px] pt-8">
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden">
                {/* Current User Avatar */}
              </div>
              <div className="flex flex-col text-sm">
                <span className="font-semibold">currentuser</span>
                <span className="text-gray-500">Full Name</span>
              </div>
           </div>
           <button className="text-blue-500 text-xs font-semibold">Switch</button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-500">Suggested for you</span>
          <button className="text-xs font-semibold">See All</button>
        </div>

        {/* Suggestion Item Mock */}
        <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200"></div>
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-sm">suggesteduser</span>
                <span className="text-gray-500">Follows you</span>
              </div>
           </div>
           <button className="text-blue-500 text-xs font-semibold">Follow</button>
        </div>

      </div>
    </div>
  );
};

export default Home;
