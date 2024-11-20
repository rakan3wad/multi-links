"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Link } from "../dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface PublicProfileProps {
  username: string;
  links: Link[];
}

export default function PublicProfile({ username, links }: PublicProfileProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('username', username)
          .single();

        if (error) throw error;
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    fetchProfileImage();
  }, [username, supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 relative rounded-full overflow-hidden mx-auto mb-4">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={username}
                fill
                priority
                sizes="96px"
                className="object-cover"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            ) : (
              <div className="w-full h-full bg-indigo-600 flex items-center justify-center">
                <span className="text-2xl text-white font-bold">
                  {username.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">@{username}</h1>
          <p className="text-gray-600">My Collection of Links</p>
        </div>

        {/* Links Grid */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {link.title}
                      </h3>
                      <p className="text-gray-600">{link.description}</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-indigo-600 flex-shrink-0 ml-4" />
                  </div>
                </div>
              </a>
            ))}
          </div>

          {links.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No links added yet
              </h3>
              <p className="text-gray-500">
                This user hasn't added any links to their profile
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
