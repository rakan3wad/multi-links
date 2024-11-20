'use client';

import { useEffect, useState } from "react";
import { Plus, LogOut } from "lucide-react";
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {user && <ProfileImage user={user} onImageUpdate={() => {}} />}
            <h1 className="text-3xl font-bold">Your Links</h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsAddingCard(true)}
              disabled={isLoading}
              className={`flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
            >
              <Plus className="h-5 w-5" />
              Add Link
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className={`flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-white ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isAddingCard && (
          <AddLinkCard
            onSubmit={handleAddLink}
            onCancel={() => setIsAddingCard(false)}
          />
        )}
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center min-h-[200px]">
            <div className="animate-pulse text-lg text-gray-600">Loading your links...</div>
          </div>
        ) : links.length === 0 && !isAddingCard ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600 mb-4">You haven't added any links yet.</p>
            <button
              onClick={() => setIsAddingCard(true)}
              className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              <Plus className="h-5 w-5" />
              Add Your First Link
            </button>
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
  );
}
