import { createSupabaseClient } from "../lib/supabase.js";

const allowedTables = [
  "players",
  "player_profiles",
  "player_stats",
  "player_partners",
  "player_equipments",
  "player_items",
  "player_badges",
  "player_friendships"
];

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

    // =========================
    // BODY PARSE
    // =========================
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const {
      table,
      action,
      id,
      player_id
    } = body;

    // =========================
    // TABLE VALIDATION
    // =========================
    if (!allowedTables.includes(table)) {
      return res.status(403).json({
        error: "Invalid table"
      });
    }
    // =========================
    // GET LIST PLAYER 
    // =========================
    if (action === "getListPlayer") {

      const { data, error } = await supabase
        .from("players")
        .select("id, username, email");

      if (error) {
        return res.status(500).json({
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data
      });
    }

    // =========================
    // GET DATA PROFILE
    // =========================
    if (action === "getProfilePlayer") {

      let query = supabase
        .from(table)
        .select("*")
        .eq("player_id", player_id)
        .single();

      const {
        data,
        error
      } = await query;

      if (error) {
        return res.status(500).json({
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data
      });
    }

    // =========================
    // GET DATA INVENTORY
    // =========================
    if (action === "getEquipmentPlayer") {
      let query = supabase
        .from("player_equipments")
        .select("*, catalog:catalog_equipments (id, name, link_photo)")
        .eq("player_id", player_id);
      
      const {
        data,
        error
      } = await query;

      if (error) {
        return res.status(500).json({
          error: error.message
        });
      }
      return res.status(200).json({
        success: true,
        data
      });
    }

    // =========================
    // UNKNOWN ACTION
    // =========================
    return res.status(400).json({
      error: "Invalid action"
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }
}