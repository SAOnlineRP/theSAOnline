import { createSupabaseClient } from "../lib/supabase.js";

export default async function handler(req, res) {
  const authHeader =
    req.headers.authorization || "";

  const supabase =
    createSupabaseClient(authHeader);

  // =========================
  // GET
  // =========================
  if (req.method === "GET") {

    const { id } = req.query;

    let query = supabase
      .from("player_profiles")
      .select("*");

    // kalau ada id
    if (id) {
      query = query.eq("player_id", id).single();
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    return res.status(200).json({ data });
  }
}