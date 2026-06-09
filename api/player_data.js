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
    // GET data player milik user login
    // =========================
    if (action === "getDataPlayer") {
        if(table === "player_partners"){
            const { data, error } = await supabase
                .from("player_partners")
                .select(`
                    *,
                    partner:catalog_partners (
                        name,
                        link_ava,
                        link_photo,
                        skills:catalog_partner_skills (
                            catalog_skills (
                                id,
                                name
                            )
                        )
                    )
                `)
                .eq("player_id", user.id)

            if (error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(200).json({ data });

        } if(table === "player_equipments"){
            const { data, error } = await supabase
                .from("player_equipments")
                .select(`
                    *,
                    catalog:catalog_equipments (
                        name,
                        position,
                        type,
                        atk, 
                        max_hp,
                        def,
                        link_photo
                    )
                `)
                .eq("player_id", user.id)

            if (error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(200).json({ data });
        } if(table === "player_items"){
            const { data, error } = await supabase
                .from("player_items")
                .select(`
                    *,
                    catalog:catalog_items (
                        name,
                        desc,
                        link_photo
                    )
                `)
                .eq("player_id", user.id)

            if (error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(200).json({ data });
        } else {
            const { data, error } = await supabase
            .from(table)
            .select("*")
            .eq("player_id", user.id)

            if (error) {
            return res.status(500).json({ error: error.message });
            }
            return res.status(200).json({ data });
        }
    }

    // =========================
    // GET profile milik user login
    // =========================
    if (action === "getProfile") {
        // PROFILE
        const { data: profile, error: profileError } =
            await supabase
            .from("player_profiles")
            .select(`
                *,
                soul_trait:catalog_soul_traits (
                    name
                )
            `)
            .eq("player_id", user.id)
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
            .eq("player_id", user.id)
            .single();

        if (statsError) {
            return res.status(500).json({
            error: statsError.message
            });
        }

        // BADGES
        const { data: badges, error: badgesError } =
            await supabase
            .from("player_badges")
            .select(`*,
                catalog:catalog_badges (
                id,
                name,
                link_photo
                )`)
            .eq("player_id", user.id);

        if (badgesError) {
            return res.status(500).json({
            error: badgesError.message
            });
        }

        const equippedBadges = Object.fromEntries(
            badges
                .filter(badge => badge.status)
                .map(badge => [badge.status, badge])
        );

        // EQUIPPED
        const { data: equipped, error: equippedError } = await supabase
            .from("player_equipped")
            .select(`
            *,
            right_arm:player_equipments!player_equipped_right_arm_fkey (
                id,
                level,
                star,
                catalog:catalog_equipments (
                id,
                name,
                link_photo
                )
            ),
            left_arm:player_equipments!player_equipped_left_arm_fkey (
                id,
                level,
                star,
                catalog:catalog_equipments (
                id,
                name,
                link_photo
                )
            ),
            lower:player_equipments!player_equipped_lower_fkey (
                id,
                level,
                star,
                catalog:catalog_equipments (
                id,
                name,
                link_photo
                )
            ),
            upper:player_equipments!player_equipped_upper_fkey (
                id,
                level,
                star,
                catalog:catalog_equipments (
                id,
                name,
                link_photo
                )
            ),
            first_partner:player_partners!player_equipped_first_partner_fkey (
                id,
                level,
                star,
                catalog:catalog_partners (
                id,
                name,
                link_photo,
                link_ava
                )
            ),
            second_partner:player_partners!player_equipped_second_partner_fkey (
                id,
                level,
                star,
                catalog:catalog_partners (
                id,
                name,
                link_photo,
                link_ava
                )
            )
            `)
            .eq("player_id", user.id)
            .maybeSingle();

        if (equippedError) {
            return res.status(500).json({ error: equippedError.message });
        }

        // return full data
        return res.status(200).json({
            success: true,
            data: {
                profile,
                stats,
                badges,
                equippedBadges,
                equipped
            }
        });
    }

    // =========================
    // GET equipped items for the logged-in user
    // =========================
    if (action === "getEquipped") {
        // EQUIPPED
        const { data: equipped, error: equippedError } = await supabase
            .from("player_equipped")
            .select(`
            *,
            right_arm:player_equipments!player_equipped_right_arm_fkey (
                id,
                level,
                star,
                catalog:catalog_equipments (
                id,
                name,
                link_photo
                )
            ),
            left_arm:player_equipments!player_equipped_left_arm_fkey (
                id,
                level,
                star,
                catalog:catalog_equipments (
                id,
                name,
                link_photo
                )
            ),
            lower:player_equipments!player_equipped_lower_fkey (
                id,
                level,
                star,
                catalog:catalog_equipments (
                id,
                name,
                link_photo
                )
            ),
            upper:player_equipments!player_equipped_upper_fkey (
                id,
                level,
                star,
                catalog:catalog_equipments (
                id,
                name,
                link_photo
                )
            ),
            first_partner:player_partners!player_equipped_first_partner_fkey (
                id,
                level,
                star,
                catalog:catalog_partners (
                id,
                name,
                link_photo
                )
            ),
            second_partner:player_partners!player_equipped_second_partner_fkey (
                id,
                level,
                star,
                catalog:catalog_partners (
                id,
                name,
                link_photo
                )
            )
            `)
            .eq("player_id", user.id)
            .maybeSingle();

        if (equippedError) {
            return res.status(500).json({ error: equippedError.message });
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

        // return full data
        return res.status(200).json({
            success: true,
            data: {
                equipped,
                equipments,
                partners
            }
        });
    }

    if (action === "getColGems") {
        const { data, error } = await supabase
          .from("player_profiles")
          .select("col, arcana_gems")
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