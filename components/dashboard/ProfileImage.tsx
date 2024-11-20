'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/auth-helpers-nextjs';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ProfileImageProps {
  user: User;
  onImageUpdate: () => void;
}

export default function ProfileImage({ user, onImageUpdate }: ProfileImageProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data?.avatar_url) {
          setImageUrl(data.avatar_url);
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    fetchProfileImage();
  }, [user.id, supabase]);

  const uploadImage = async (file: File) => {
    try {
      setIsUploading(true);

      // Delete old image if exists
      if (imageUrl) {
        const oldFileName = imageUrl.split('/').pop();
        if (oldFileName) {
          const { error: removeError } = await supabase.storage
            .from('profile-images')
            .remove([oldFileName]);
          
          if (removeError) {
            console.error('Error removing old image:', removeError);
            // Continue with upload even if delete fails
          }
        }
      }

      // Upload new image to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      
      console.log('Attempting to upload file:', fileName);
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // Check if profiles table exists and create it if it doesn't
      const { error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (profileError) {
        console.error('Error checking profiles table:', profileError);
        // Create profiles table if it doesn't exist
        const { error: createTableError } = await supabase
          .rpc('create_profiles_table');
        
        if (createTableError) {
          console.error('Error creating profiles table:', createTableError);
          throw new Error('Failed to create profiles table');
        }
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          email: user.email,
          username: user.email?.split('@')[0] || null,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      setImageUrl(publicUrl);
      onImageUpdate();
    } catch (error) {
      console.error('Error in uploadImage:', error);
      if (error instanceof Error) {
        alert(`Upload failed: ${error.message}`);
      } else {
        alert('Failed to upload image. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    await uploadImage(file);
  };

  return (
    <div className="relative group">
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Profile"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-2xl font-bold">
            {user.email?.[0].toUpperCase()}
          </div>
        )}
        <label
          className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 
            opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer
            ${isUploading ? 'cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <div className="text-white">Uploading...</div>
          ) : (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <Upload className="w-6 h-6 text-white" />
            </>
          )}
        </label>
      </div>
    </div>
  );
}
