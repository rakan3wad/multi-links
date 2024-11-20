'use client';

import { useEffect, useState } from "react";
import { Plus, LogOut, ExternalLink, Edit2, Trash2, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AddLinkCard from "./AddLinkCard";
import LinkCard from "./LinkCard";
import ProfileImage from "./ProfileImage";
import { Database } from "@/lib/supabase/types";
import { useRouter } from "next/navigation";
import { User } from "@supabase/auth-helpers-nextjs";

export type Link = Database["public"]["Tables"]["links"]["Row"];

export default function DashboardLayout() {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.replace("/auth");
          return;
        }

        setUser(session.user);

        // Fetch profile data
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single();

        if (profileData?.username) {
          setUsername(profileData.username);
        }

        const { data, error } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setLinks(data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace("/auth");
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleAddLink = async (newLink: Omit<Link, "id" | "created_at" | "user_id">) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("links")
        .insert([
          {
            ...newLink,
            user_id: session.user.id,
            created_at: now,
            updated_at: now,
            is_active: true
          },
        ])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setLinks((prev) => [data, ...prev]);
        setIsAddingCard(false);
      }
    } catch (error) {
      console.error("Error adding link:", error);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setLinks((prev) => prev.filter((link) => link.id !== id));
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

  const handleEditLink = async (
    id: string,
    updatedLink: Omit<Link, "id" | "created_at" | "user_id">
  ) => {
    try {
      const { data, error } = await supabase
        .from("links")
        .update(updatedLink)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setLinks((prev) =>
          prev.map((link) => (link.id === id ? data : link))
        );
      }
    } catch (error) {
      console.error("Error updating link:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            {user && <ProfileImage user={user} onImageUpdate={() => {}} />}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            @{username || user?.email?.split('@')[0]}
          </h1>
          <p className="text-gray-600 mb-4">My Collection of Links</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsAddingCard(true)}
              disabled={isLoading}
              className={`flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
              }`}
            >
              <Plus className="h-5 w-5" />
              Add Link
            </button>
            <button
              onClick={() => router.push(`/${username || user?.email?.split('@')[0]}`)}
              className="flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              <Eye className="h-5 w-5" />
              View Public Profile
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className={`flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-white ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
              }`}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Links Section */}
        <div className="max-w-3xl mx-auto">
          {isAddingCard && (
            <div className="mb-4">
              <AddLinkCard
                onSubmit={handleAddLink}
                onCancel={() => setIsAddingCard(false)}
              />
            </div>
          )}
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-pulse text-lg text-gray-600">
                  Loading your links...
                </div>
              </div>
            ) : links.length === 0 && !isAddingCard ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No links added yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start by adding your first link
                </p>
                <button
                  onClick={() => setIsAddingCard(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Link
                </button>
              </div>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {link.title}
                        </h3>
                        <p className="text-gray-600">{link.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => handleEditLink(link.id, link)}
                          className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
