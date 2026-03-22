import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import Post from '../components/Post';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      // Fetch posts with related profiles, likes count, user's like/save status, and comments
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          image_url,
          caption,
          created_at,
          profiles (id, username, avatar_url),
          likes (user_id),
          saved_posts (user_id),
          comments (
            id,
            content,
            created_at,
            profiles (username, id)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform data to easily check if current user liked/saved it
      const transformedPosts = data.map((post) => ({
        ...post,
        likes_count: post.likes.length,
        is_liked: post.likes.some((like) => like.user_id === user.id),
        is_saved: post.saved_posts.some((save) => save.user_id === user.id),
      }));

      setPosts(transformedPosts || []);
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
            <Post key={post.id} post={post} />
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
