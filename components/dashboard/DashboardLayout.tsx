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
import { Button } from "@/components/ui/button";

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
        } else {
          // If username is not set, update it with email prefix
          const defaultUsername = session.user.email?.split('@')[0];
          if (defaultUsername) {
            const { data: updatedProfile, error: updateError } = await supabase
              .from("profiles")
              .update({ 
                username: defaultUsername,
                updated_at: new Date().toISOString()
              })
              .eq("id", session.user.id)
              .select("username")
              .single();

            if (!updateError && updatedProfile) {
              setUsername(updatedProfile.username);
            }
          }
        }

        // Fetch active links
        const { data: activeLinks, error: linksError } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (linksError) throw linksError;
        setLinks(activeLinks || []);
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

      const { data, error } = await supabase
        .from("links")
        .insert([
          {
            ...newLink,
            user_id: session.user.id,
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
        .update({ is_active: false })
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <ProfileImage user={user} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {username || 'User'}
              </h1>
              <p className="text-gray-600">Manage your links</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                if (username) {
                  router.push(`/${username}`);
                }
              }}
              disabled={!username}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <Button
            onClick={() => setIsAddingCard(true)}
            className="w-full max-w-2xl flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Link
          </Button>
        </div>

        {isAddingCard && (
          <div className="mb-8">
            <AddLinkCard
              onSave={handleAddLink}
              onCancel={() => setIsAddingCard(false)}
            />
          </div>
        )}

        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading your links...</p>
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No links yet</h3>
              <p className="text-gray-600">Add your first link to get started!</p>
            </div>
          ) : (
            links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onDelete={handleDeleteLink}
                onEdit={handleEditLink}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
