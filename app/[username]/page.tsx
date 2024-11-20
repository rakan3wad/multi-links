import { notFound } from "next/navigation";
import PublicProfile from "@/components/profile/PublicProfile";
import { createServerClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const supabase = createServerClient();

  let profile: Profile | null = null;

  // First, try to find user by username
  const { data: usernameProfile, error: usernameError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (usernameProfile) {
    profile = usernameProfile;
  } else {
    // If not found, try to find by email prefix
    const { data: emailProfile, error: emailError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", `${username}@gmail.com`)
      .single();

    if (emailProfile) {
      profile = emailProfile;
    }
  }

  // If no profile found, show 404
  if (!profile) {
    console.error('Profile not found:', username);
    notFound();
  }

  // Fetch user's links
  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <PublicProfile 
      username={profile.username} 
      displayName={profile.display_name}
      avatarUrl={profile.avatar_url}
      links={links || []} 
    />
  );
}
