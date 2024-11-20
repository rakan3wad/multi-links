import { notFound } from "next/navigation";
import PublicProfile from "@/components/profile/PublicProfile";
import { createServerClient } from "@/lib/supabase/server";

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const supabase = createServerClient();

  // First, find the user by username
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (userError || !userData) {
    notFound();
  }

  // Then fetch user's links using their ID
  const { data: links, error: linksError } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", userData.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (linksError || !links) {
    notFound();
  }

  return <PublicProfile username={username} links={links} />;
}
