"use client";

import { useEffect, useState } from "react";
import { Plus, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AddLinkCard from "./AddLinkCard";
import LinkCard from "./LinkCard";
import { Database } from "@/lib/supabase/types";
import { useRouter } from "next/navigation";

export type Link = Database["public"]["Tables"]["links"]["Row"];

export default function DashboardLayout() {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    checkUser();
    fetchLinks();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
        router.push("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) {
        setUser(user);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error checking user:", error);
      router.push("/");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const fetchLinks = async () => {
    try {
      if (!user) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error("Error fetching links:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLink = async (newLink: Omit<Link, "id" | "created_at" | "user_id" | "username">) => {
    try {
      if (!user) {
        console.error("No user found - please log in again");
        router.push("/");
        return;
      }

      console.log("Adding link for user:", user.id);
      const { data, error } = await supabase
        .from("links")
        .insert([
          {
            ...newLink,
            user_id: user.id,
            username: user.email?.split("@")[0] || "user",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error inserting link:", error);
        throw error;
      }
      
      if (data) {
        console.log("Link added successfully:", data);
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
    updatedLink: Omit<Link, "id" | "created_at" | "user_id" | "username">
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your links...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Links</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsAddingCard(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {isAddingCard && (
        <div className="mb-6">
          <AddLinkCard
            onSubmit={handleAddLink}
            onCancel={() => setIsAddingCard(false)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => (
          <LinkCard
            key={link.id}
            link={link}
            onDelete={handleDeleteLink}
            onEdit={handleEditLink}
          />
        ))}
      </div>

      {links.length === 0 && !isAddingCard && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No links added yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start adding your links by clicking the Add Link button above
          </p>
        </div>
      )}
    </div>
  );
}
