import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { JobsList } from "./jobs-list";

export default async function MyJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { filter } = await searchParams;

  if (!user) redirect("/login");

  // Fetch jobs with bid counts
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(`
      *,
      bids (id)
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return <div className="p-10 text-red-500">Ошибка: {error.message}</div>;

  return <JobsList initialJobs={jobs || []} initialFilter={filter as any} />;
}