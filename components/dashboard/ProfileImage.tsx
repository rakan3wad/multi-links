"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/auth-helpers-nextjs';
import { Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface ProfileImageProps {
  user: User | null;
  onImageUpdate?: () => void;
}

export default function ProfileImage({ user, onImageUpdate }: ProfileImageProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!user) return;
      
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
  }, [user, supabase]);

  const uploadImage = async (file: File) => {
    if (!user?.id) {
      toast.error('Please sign in to upload an image');
      return;
    }

    // Validate file type
    const fileType = file.type.toLowerCase();
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(fileType)) {
      toast.error('Please upload a JPEG or PNG image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setIsImageLoading(true);

      // Generate a unique file name
      const fileExt = fileType.split('/')[1];
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // First, try to upload the file
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('profile-images')
        .upload(`avatars/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message || 'Failed to upload image to storage');
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(`avatars/${fileName}`);

      if (!publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Delete old avatar if it exists
      if (imageUrl) {
        try {
          const oldPath = imageUrl.split('profile-images/')[1]?.split('?')[0];
          if (oldPath) {
            await supabase.storage
              .from('profile-images')
              .remove([oldPath]);
          }
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
          // Continue even if delete fails
        }
      }

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(updateError.message || 'Failed to update profile with new image');
      }

      setImageUrl(publicUrl);
      toast.success('Profile image updated successfully');
      if (onImageUpdate) {
        onImageUpdate();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to upload image. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setIsImageLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  return (
    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 group">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Profile"
          width={96}
          height={96}
          className="object-cover w-full h-full"
          onLoadStart={() => setIsImageLoading(true)}
          onLoadingComplete={() => setIsImageLoading(false)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-semibold">
          {user?.email?.charAt(0).toUpperCase() || '?'}
        </div>
      )}
      
      <label
        htmlFor="profile-image"
        className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        {isUploading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Upload className="w-6 h-6" />
        )}
        <input
          type="file"
          id="profile-image"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          disabled={isUploading}
        />
      </label>
    </div>
  );
}
