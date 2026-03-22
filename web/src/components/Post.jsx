import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Post = ({ post, onLikeToggle, onSaveToggle }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isSaved, setIsSaved] = useState(post.is_saved);

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleLike = async () => {
    // Optimistic UI update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      if (newIsLiked) {
        await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
      } else {
        await supabase.from('likes').delete().match({ post_id: post.id, user_id: user.id });
      }
    } catch (err) {
      // Revert if error
      setIsLiked(!newIsLiked);
      setLikesCount((prev) => (!newIsLiked ? prev + 1 : prev - 1));
      console.error('Error toggling like:', err);
    }
  };

  const handleSave = async () => {
    // Optimistic UI update
    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);

    try {
      if (newIsSaved) {
        await supabase.from('saved_posts').insert({ post_id: post.id, user_id: user.id });
      } else {
        await supabase.from('saved_posts').delete().match({ post_id: post.id, user_id: user.id });
      }
    } catch (err) {
      // Revert if error
      setIsSaved(!newIsSaved);
      console.error('Error toggling save:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: commentText.trim()
        })
        .select(`
          id,
          content,
          created_at,
          profiles (username)
        `)
        .single();

      if (error) throw error;

      setComments((prev) => [...prev, data]);
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <article className="bg-white border border-gray-200 rounded-[8px] pb-4">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3">
        <Link to={`/profile/${post.profiles?.id}`} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr p-[2px] from-yellow-400 via-red-500 to-purple-500">
            <img
              src={post.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${post.profiles?.username || 'User'}`}
              alt={post.profiles?.username}
              className="w-full h-full object-cover rounded-full border border-white bg-white"
            />
          </div>
          <span className="font-semibold text-sm hover:text-gray-500 transition-colors">{post.profiles?.username}</span>
        </Link>
        <button className="text-gray-900 hover:text-gray-500 transition-colors">
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
          <button onClick={handleLike} className="hover:opacity-50 transition-opacity">
            <Heart size={24} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
          </button>
          <button className="hover:opacity-50 transition-opacity">
            <MessageCircle size={24} />
          </button>
          <button className="hover:opacity-50 transition-opacity">
            <Send size={24} />
          </button>
        </div>
        <button onClick={handleSave} className="hover:opacity-50 transition-opacity">
          <Bookmark size={24} className={isSaved ? 'fill-black' : ''} />
        </button>
      </div>

      {/* Likes count */}
      <div className="px-4 mt-2 font-semibold text-sm">
        {likesCount} {likesCount === 1 ? 'like' : 'likes'}
      </div>

      {/* Caption */}
      <div className="px-4 mt-1 text-sm">
        <Link to={`/profile/${post.profiles?.id}`} className="font-semibold mr-2 hover:text-gray-500">{post.profiles?.username}</Link>
        <span>{post.caption}</span>
      </div>

      {/* Comments List */}
      <div className="px-4 mt-1 flex flex-col gap-1">
        {comments.map((comment) => (
          <div key={comment.id} className="text-sm">
             <Link to={`/profile/${comment.profiles?.id}`} className="font-semibold mr-2 hover:text-gray-500">{comment.profiles?.username}</Link>
             <span>{comment.content}</span>
          </div>
        ))}
      </div>

      {/* Add Comment */}
      <div className="px-4 mt-3">
         <form onSubmit={handleAddComment} className="flex items-center gap-2 border-t pt-2">
            <input
              type="text"
              placeholder="Add a comment..."
              className="text-sm w-full outline-none py-1 bg-transparent"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={submittingComment}
            />
            <button
              type="submit"
              className={`text-blue-500 font-semibold text-sm hover:text-blue-700 transition-colors ${(!commentText.trim() || submittingComment) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!commentText.trim() || submittingComment}
            >
              Post
            </button>
         </form>
      </div>
    </article>
  );
};

export default Post;
