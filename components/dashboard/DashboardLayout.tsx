'use client';

import { useEffect, useState } from "react";
import { Plus, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AddLinkCard from "./AddLinkCard";
import LinkCard from "./LinkCard";
import { Database } from "@/lib/supabase/types";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export type Link = Database["public"]["Tables"]["links"]["Row"];

export default function DashboardLayout() {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchLinks = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    const initializeDashboard = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!session?.user) {
          router.replace("/auth");
          return;
        }

        if (mounted) {
          await fetchLinks(session.user.id);
        }
      } catch (error) {
        console.error("Error initializing dashboard:", error);
        router.replace("/auth");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeDashboard();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchLinks(session.user.id);
      } else if (event === 'SIGNED_OUT' || !session) {
        setLinks([]);
        router.replace("/auth");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, fetchLinks, supabase.auth]);

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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        router.replace("/auth");
        return;
      }

      if (!session?.user) {
        console.error("No active session found");
        router.replace("/auth");
        return;
      }

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("links")
        .insert([
          {
            title: newLink.title,
            url: newLink.url,
            description: newLink.description,
            user_id: session.user.id,
            created_at: now,
            updated_at: now,
            is_active: true
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error inserting link:", error);
        throw error;
      }
      
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Links</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsAddingCard(true)}
            className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            <Plus className="h-5 w-5" />
            Add Link
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isAddingCard && (
          <AddLinkCard
            onSubmit={handleAddLink}
            onCancel={() => setIsAddingCard(false)}
          />
        )}
        {links.map((link) => (
          <LinkCard
            key={link.id}
            link={link}
            onDelete={handleDeleteLink}
            onEdit={handleEditLink}
          />
        ))}
      </div>
    </div>
  );
}
