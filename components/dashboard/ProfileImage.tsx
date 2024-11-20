'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/auth-helpers-nextjs';
import { Upload } from 'lucide-react';
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
    console.log('Starting upload process...', { fileSize: file.size });
    try {
      setIsUploading(true);

      // Delete old image if exists
      if (imageUrl) {
        const oldFileName = imageUrl.split('/').pop()?.split('?')[0];
        if (oldFileName) {
          console.log('Deleting old image:', oldFileName);
          await supabase.storage
            .from('profile-images')
            .remove([oldFileName]);
        }
      }

      // Upload new image to storage
      const fileExt = file.type === 'image/png' ? 'png' : 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      console.log('Uploading new image:', { fileName, fileType: file.type });

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL with cache buster
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;
      console.log('Updating user profile with new avatar URL:', urlWithCacheBuster);

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          username: user.email?.split('@')[0] || null,
          avatar_url: urlWithCacheBuster,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      console.log('Profile updated successfully');
      setImageUrl(urlWithCacheBuster);
      onImageUpdate();
    } catch (error) {
      console.error('Detailed upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Please upload a JPEG or PNG image file');
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
            priority
            sizes="96px"
            className="object-cover"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
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
                accept="image/jpeg,image/png"
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
