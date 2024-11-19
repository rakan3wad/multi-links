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

  // Fetch user's links
  const { data: links, error } = await supabase
    .from("links")
    .select("*")
    .eq("username", username)
    .order("created_at", { ascending: false });

  if (error || !links || links.length === 0) {
    notFound();
  }

  return <PublicProfile username={username} links={links} />;
}
