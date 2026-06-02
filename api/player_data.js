import { createSupabaseClient } from "../lib/supabase.js";

export default async function handler(req, res) {
    // =========================
  // METHOD VALIDATION
  // =========================
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    // =========================
    // AUTH
    // =========================
    const authHeader =
      req.headers.authorization || "";

    const supabase =
      createSupabaseClient(authHeader);

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    
    if (userError || !user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const {
      table,
      action
    } = body;
    
    // =========================
    // GET profile milik user login
    // =========================
    if (action === "getDataPlayer") {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .eq("player_id", user.id)
          .single();

        if (error) {
          return res.status(500).json({ error: error.message });
        }
        return res.status(200).json({ data });
    }
  } catch (error) {
    console.error("Error in player_data API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}