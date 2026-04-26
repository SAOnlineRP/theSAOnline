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
        const { data: badges, error: badgeError } = await supabase
            .from("player_badges")
            .select(`
            *, catalog:catalog_badges(*)
            `)
            .eq("player_id", user.id);

        if (badgeError) {
            return res.status(500).json({ error: badgeError.message });
        }

        return res.status(200).json({
            data: {
            badges,
            },
        });
    }

  return res.status(405).json({ error: "Method not allowed" });
}