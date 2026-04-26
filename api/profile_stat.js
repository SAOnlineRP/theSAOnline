import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || "";

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET profile milik user login
    if (req.method === "GET") {
        const { data: stats, error: statsError } = await supabase
            .from("player_stats")
            .select("*")
            .eq("player_id", user.id)
            .maybeSingle();

        if (statsError) {
            return res.status(500).json({ error: statsError.message });
        }

        return res.status(200).json({
            data: {
            stats,
            },
        });
    }

  return res.status(405).json({ error: "Method not allowed" });
}