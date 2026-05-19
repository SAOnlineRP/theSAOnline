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
    const { data, error } = await supabase
      .from("catalog_soul_traits")
      .select("*");

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    return res.status(200).json({ data });
  }

  // =========================
  // POST
  // =========================
  if (req.method === "POST") {
    const { name, stats, growth, skill_name, skill_mp_cost, effects } = req.body;

    const { data, error } = await supabase
      .from("catalog_soul_traits")
      .insert([
        {
          name,
          stats,
          growth,
          skill_name,
          skill_mp_cost,
          effects
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    return res.status(200).json({ data });
  }

  // =========================
  // DELETE
  // =========================
  if (req.method === "DELETE") {

    const { id } = req.body;

    const { error } = await supabase
      .from("catalog_soul_traits")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Deleted successfully",
    });
  }

  // =========================
  // PUT / UPDATE
  // =========================
  if (req.method === "PUT") {

    const {
      id,
      name,
      stats,
      growth,
      skill_name,
      skill_mp_cost,
      effects
    } = req.body;

    const { data, error } = await supabase
      .from("catalog_soul_traits")
      .update({
        name,
        stats,
        growth,
        skill_name,
        skill_mp_cost,
        effects
      })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      data
    });
  }

  // =========================
  // METHOD NOT ALLOWED
  // =========================
  return res.status(405).json({
    error: "Method not allowed",
  });
}