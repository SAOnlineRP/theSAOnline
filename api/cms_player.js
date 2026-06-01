import { createSupabaseClient } from "../lib/supabase.js";

const allowedTables = [
  "players",
  "player_profiles",
  "player_stats",
  "player_partners",
  "player_equipments",
  "player_items",
  "player_badges",
  "player_friendships",
  "player_gifts"
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

    if (
      table &&
      !allowedTables.includes(table)
    ) {
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
    // GET FULL PLAYER DATA
    // =========================
    if (action === "getFullPlayerData") {

      // PROFILE
      const { data: profile, error: profileError } =
        await supabase
          .from("player_profiles")
          .select("*")
          .eq("player_id", player_id)
          .single();

      if (profileError) {
        return res.status(500).json({
          error: profileError.message
        });
      }

      // STATS
      const { data: stats, error: statsError } =
        await supabase
          .from("player_stats")
          .select("*")
          .eq("player_id", player_id)
          .single();

      if (statsError) {
        return res.status(500).json({
          error: statsError.message
        });
      }

      // EQUIPMENTS
      const { data: equipments, error: equipmentsError } =
        await supabase
          .from("player_equipments")
          .select(`
            *,
            catalog:catalog_equipments (
              id,
              name,
              link_photo
            )
          `)
          .eq("player_id", player_id);

      if (equipmentsError) {
        return res.status(500).json({
          error: equipmentsError.message
        });
      }

      // ITEMS
      const { data: items, error: itemsError } =
        await supabase
          .from("player_items")
          .select(`
            *,
            catalog:catalog_items (
              id,
              name,
              desc,
              link_photo
            )
          `)
          .eq("player_id", player_id);

      if (itemsError) {
        return res.status(500).json({
          error: itemsError.message
        });
      }

      // PARTNERS
      const { data: partners, error: partnersError } =
        await supabase
          .from("player_partners")
          .select(`
            *,
            catalog:catalog_partners (
              id,
              name,
              link_photo,
              stats
            )
          `)
          .eq("player_id", player_id);

      if (partnersError) {
        return res.status(500).json({
          error: partnersError.message
        });
      }

      // BADGES
      const { data: badges, error: badgesError } =
        await supabase
          .from("player_badges")
          .select("*")
          .eq("player_id", player_id);

      if (badgesError) {
        return res.status(500).json({
          error: badgesError.message
        });
      }

    
      // return full data
      return res.status(200).json({
        success: true,
        data: {
          profile,
          stats,
          equipments,
          items,
          partners,
          badges
        }
      });
    }

    // =========================
    // UPDATE FULL PLAYER DATA
    // =========================
    if (action === "updateFullPlayer") {

      const {
        player_id,
        profile,
        stats,
        equipments,
        items,
        partners
      } = body;

      // PROFILE
      const { error: profileError } =
        await supabase
          .from("player_profiles")
          .update(profile)
          .eq("player_id", player_id);

      if (profileError) {
        return res.status(500).json({
          error: profileError.message
        });
      }

      // STATS
      const { error: statsError } =
        await supabase
          .from("player_stats")
          .update(stats)
          .eq("player_id", player_id);

      if (statsError) {
        return res.status(500).json({
          error: statsError.message
        });
      }

      for (const eq of equipments) {

        const { error } = await supabase
          .from("player_equipments")
          .update({
            level: eq.level,
            star: eq.star
          })
          .eq("id", eq.id);

        if (error) {
          return res.status(500).json({
            error: error.message
          });
        }
      }

      for (const item of items) {

        const { error } = await supabase
          .from("player_items")
          .update({
            quantity: item.quantity
          })
          .eq("id", item.id);

        if (error) {
          return res.status(500).json({
            error: error.message
          });
        }
      }

      for (const partner of partners) {

        const { error } = await supabase
          .from("player_partners")
          .update({
            level: partner.level,
            star: partner.star
          })
          .eq("id", partner.id);

        if (error) {
          return res.status(500).json({
            error: error.message
          });
        }
      }

      return res.status(200).json({
        success: true
      });
    }

    // =========================
    // INSERT NEW DATAS 
    // =========================
    if (action === "insertNewData") {
      try{
        const {
          table,
          data
        } = body;

        console.log("TABLE:", table);
        console.log("DATA:", data);
        const { error } = await supabase
          .from(table)
          .insert(data);
        
        if (error) {
          console.error("INSERT ERROR:", error);
          return res.status(500).json({

            error: error.message
          });
        }
        return res.status(200).json({
          success: true,
          message: "Data inserted successfully"
        });
      } catch (err) {
        console.error("INSERT ERROR:", err);

        return res.json(
          { error: err.message },
          { status: 500 }
        );
      }
      
    }

    // =========================
    // DELETE DATAS
    // =========================
    if (action === "deleteData") {
      const { table, ids } = body;

      let query = supabase
        .from(table)
        .delete()
        .in("id", ids);

      if (table === "player_equipments") {
        query = query.select(`
          *,
          catalog:catalog_equipments (
            id,
            name,
            link_photo
          )
        `);
      } else if (table === "player_items") {
        query = query.select(`
          *,
          catalog:catalog_items (
            id,
            name,
            desc,
            link_photo
          )
        `);
      } else if (table === "player_partners") {
        query = query.select(`
          *,
          catalog:catalog_partners (
            id,
            name,
            link_photo,
            stats
          )
        `);
      } else {
        query = query.select("*");
      }

      const { data, error } = await query;

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

    // =====
    // UPDATE SELECTED 
    // =====
    if (action === "updateSelectedData") {
      const { table, column, ids, amount } = body;
      let query = supabase
        .from(table)
        .update({
          [column]: amount
        })
        .in("player_id", ids);
      
      const { error } = await query;

      if (error) {
        return res.status(500).json({
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        message: "Data updated successfully"
      });
    }



    // =====
    // INSERT BATCH GIFTS
    // =====
    if (action === "insertToSelected") {
      const { table, data } = body;
      let query = supabase
        .from("player_gifts")
        .insert(data);
      
      const { error } = await query;

      if (error) {
        return res.status(500).json({
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        message: "Data updated successfully"
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