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
    const { data, error } = await supabase
      .from("player_profiles")
      .select("*")
      .eq("player_id", user.id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ data });
  }

  // POST bikin profile milik user login
  if (req.method === "POST") {
    const { nickname, avatar } = req.body;

    const { data, error } = await supabase
      .from("player_profiles")
      .insert([
        {
          player_id: user.id,
          nickname,
          avatar,

          // default server-side
          level: 1,
          exp: 0,
          gold: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ data });
  }

  return res.status(405).json({ error: "Method not allowed" });
}