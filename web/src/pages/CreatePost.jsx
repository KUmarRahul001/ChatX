import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ImagePlus, UploadCloud } from 'lucide-react';

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      // 1. Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      const imageUrl = data.publicUrl;

      // 3. Insert record into 'posts' table
      const { error: dbError } = await supabase.from('posts').insert([
        {
          user_id: user.id,
          image_url: imageUrl,
          caption: caption,
        },
      ]);

      if (dbError) throw dbError;

      // Success! Redirect to home to see the post
      navigate('/');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row border border-gray-200 h-[600px]">
        {/* Header - Mobile Only (Visible when no file selected or file selected on small screens) */}
        <div className="w-full h-12 flex items-center justify-between border-b px-4 md:hidden font-semibold">
           <button onClick={() => navigate(-1)} className="text-gray-900">Cancel</button>
           <span className="text-gray-900">Create new post</span>
           {file ? (
             <button onClick={handleUpload} disabled={loading} className="text-blue-500 font-bold hover:text-blue-700">
               Share
             </button>
           ) : (
             <span className="opacity-0">Share</span> // Placeholder
           )}
        </div>

        {/* Left Side: Image Upload/Preview Area */}
        <div className={`w-full md:w-3/5 bg-gray-50 flex flex-col items-center justify-center border-r border-gray-200 transition-all ${!file && 'md:w-full'}`}>
           {/* Desktop Header for empty state */}
           {!file && (
             <div className="hidden md:flex absolute top-0 left-0 right-0 h-12 items-center justify-center border-b bg-white z-10 font-semibold rounded-t-xl">
               Create new post
             </div>
           )}

          {!file ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <ImagePlus size={64} className="text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-6">Drag photos and videos here</h3>
              <label className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer transition-colors">
                Select from computer
                <input
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          ) : (
            <div className="w-full h-full relative group bg-black flex items-center justify-center">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              <button
                onClick={() => { setFile(null); setPreviewUrl(null); }}
                className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Caption Input (Only visible when file is selected) */}
        {file && (
          <div className="w-full md:w-2/5 flex flex-col bg-white">
            {/* Desktop Header for active state */}
            <div className="hidden md:flex h-12 items-center justify-between border-b px-4 font-semibold shrink-0">
               <span className="text-gray-900 font-bold">New post</span>
               <button onClick={handleUpload} disabled={loading} className="text-blue-500 font-bold hover:text-blue-700 disabled:opacity-50">
                 {loading ? 'Sharing...' : 'Share'}
               </button>
            </div>

            <div className="p-4 flex-grow flex flex-col">
              {/* User Info Mock */}
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                 <span className="font-semibold text-sm">currentuser</span>
              </div>

              <textarea
                className="w-full h-40 resize-none border-none outline-none focus:ring-0 placeholder-gray-400 text-sm"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={2200}
              />
              <div className="text-right text-xs text-gray-400 mt-2">
                {caption.length}/2200
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
