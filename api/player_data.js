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
                        desc,
                        source,
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

        } else if(table === "player_equipments"){
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
                        link_photo,
                        desc,
                        source
                    )
                `)
                .eq("player_id", user.id)

            if (error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(200).json({ data });
        } else if(table === "player_items"){
            const { data, error } = await supabase
                .from("player_items")
                .select(`
                    *,
                    catalog:catalog_items (
                        name,
                        desc,
                        source,
                        link_photo
                    )
                `)
                .eq("player_id", user.id)

            if (error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(200).json({ data });
        } else if(table === "player_badges"){
            const { data, error } = await supabase
                .from("player_badges")
                .select(`
                    *,
                    catalog:catalog_badges (
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
    else if (action === "getProfile") {
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
    else if (action === "getEquipped") {
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
                    link_ava,
                    catalog_partner_skills (
                        catalog_skills (
                            id,
                            name
                        )
                    )
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
                    link_ava,
                    catalog_partner_skills (
                        catalog_skills (
                            id,
                            name
                        )
                    )
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
                atk,
                max_hp, 
                def,
                link_photo,
                position,
                type
                )
            `)
            .eq("player_id", user.id);

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
                atk,
                def,
                max_hp,
                max_mp
                )
            `)
            .eq("player_id", user.id);

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

    else if (action === "getColGems") {
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

    else if (action === "editBadges") {
        const { id, status } = body;

        // kosongkan badge lain yang sedang memakai slot ini
        const { error: clearError } = await supabase
            .from("player_badges")
            .update({ status: null })
            .eq("player_id", user.id)
            .eq("status", status);

        if (clearError) {
            return res.status(500).json({
                error: clearError.message
            });
        }

        // pasang badge baru ke slot
        const { data, error } = await supabase
            .from("player_badges")
            .update({ status })
            .eq("id", id)
            .eq("player_id", user.id)
            .select()
            .maybeSingle();

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

    else if (action === "editEquipped") {
        const { id, type } = body;

        const { data, error } = await supabase
            .from("player_equipped")
            .update({
                [type]: id
            })
            .eq("player_id", user.id)
            .select()
            .maybeSingle();

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

    else if (action === "buyMerchant"){
        const { data, total_price } = body;

        const merchantLogs = data.map(item => ({
            ...item,
            player_id: user.id
        }));

        // log transaksi merchant
        const { error: logError } = await supabase
            .from("log_merchants")
            .insert(merchantLogs);

        if (logError) {
            return res.status(500).json({
                error: logError.message
            });
        }

        // equipment yang dibeli
        const equipments = data
            .filter(item => item.goods_type === "equipment")
            .map(item => ({
                player_id: user.id,
                equipment_id: item.goods_id,
                level: 1,
                star: 1
            }));

        if (equipments.length > 0) {
            const { error } = await supabase
                .from("player_equipments")
                .insert(equipments);

            if (error) {
                return res.status(500).json({
                    error: error.message
                });
            }
        }

        // item yang dibeli
        const items = data.filter(item => item.goods_type === "item");

        for (const item of items) {
            const { error } = await supabase.rpc(
                "add_player_item",
                {
                    p_player_id: user.id,
                    p_item_id: item.goods_id,
                    p_quantity: item.quantity
                }
            );

            if (error) {
                return res.status(500).json({
                    error: error.message
                });
            }
        }
        // ubah col nya 
        // ambil col sekarang
        const { data: profile, error: profileError } = await supabase
            .from("player_profiles")
            .select("col")
            .eq("player_id", user.id)
            .single();

        if (profileError) throw profileError;

        const newCol = profile.col - total_price;

        const { error } = await supabase
            .from("player_profiles")
            .update({ col: newCol })
            .eq("player_id", user.id);

        return res.status(200).json({ success: true, message: "Data inserted successfully" });
    } 
    else if (action == "doSummon"){
        const { data, total_price } = body;

        const summonLogs = data.map(item => ({
            ...item,
            player_id: user.id
        }));

        // log transaksi merchant
        const { error: logError } = await supabase
            .from("log_summons")
            .insert(summonLogs);

        if (logError) {
            return res.status(500).json({
                error: logError.message
            });
        }

        // masukin item
        const items = data.filter(item => item.summon_type === "item");

        for (const item of items) {
            const { error } = await supabase.rpc(
                "add_player_item",
                {
                    p_player_id: user.id,
                    p_item_id: item.summon_id,
                    p_quantity: item.quantity
                }
            );

            if (error) {
                return res.status(500).json({
                    error: error.message
                });
            }
        }

        // masukin partner
        const partners = data
            .filter(item => item.summon_type === "partner")
            .map(item => ({
                player_id: user.id,
                partner_id: item.summon_id,
                level: 1,
                star: 1
            }));

        if (partners.length > 0) {
            const { error } = await supabase
                .from("player_partners")
                .insert(partners);

            if (error) {
                return res.status(500).json({
                    error: error.message
                });
            }
        }

        // masukkin shard
        const shards = data.filter(item => item.summon_type === "shard");

        for (const shard of shards) {
            const { error } = await supabase.rpc(
                "add_player_shard",
                {
                    p_player_id: user.id,
                    p_partner_id: shard.summon_id,
                    p_quantity: shard.quantity
                }
            );

            if (error) {
                return res.status(500).json({
                    error: error.message
                });
            }
        }

        const { data: profile, error: profileError } = await supabase
            .from("player_profiles")
            .select("arcana_gems")
            .eq("player_id", user.id)
            .single();

        if (profileError) throw profileError;

        const newGems = profile.arcana_gems - total_price;

        const { error } = await supabase
            .from("player_profiles")
            .update({ arcana_gems: newGems })
            .eq("player_id", user.id);

        return res.status(200).json({ success: true, message: "Data inserted successfully" });
    }

    else if(action == "levelUpPartner"){
        // naikkin level partner
        // butuh id partnernya

        // hapus itemnya
        // butuh id itemnya? atau nama itemnya
    }
    else if(action == "starUpPartner"){
        // naikkin star partner


        // hapus itemnya
    }
  } catch (error) {
    console.error("Error in player_data API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}