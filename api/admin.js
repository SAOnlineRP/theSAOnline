import { createSupabaseClient } from "../lib/supabase.js";

const allowedTables = [
  "catalog_partners",
  "catalog_skills",
  "catalog_soul_traits",
  "catalog_items",
  "catalog_equipments",
  "catalog_badges",
  "catalog_monsters",
  "catalog_quests",
  "catalog_tasks",
  "summon_pools",
  "merchant_items"
];

export default async function handler(req, res) {
    const authHeader =
        req.headers.authorization || "";

    const supabase =
        createSupabaseClient(authHeader);

    const body =
        typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    const { table, action, id } = body;

    console.log(body);

    if (!allowedTables.includes(table)) {
        return res.status(403).json({
        error: "Invalid table"
        });
    }

    if (action === "getAll") {

        let data;
        let error;

        if (table === "catalog_partners") {

        const result = await supabase
            .from("catalog_partners")
            .select(`
            id,
            name,
            atk,
            def,
            max_hp,
            max_mp,
            duplicate_shard_reward,
            link_ava,
            link_photo,
            catalog_partner_skills (
                catalog_skills (
                    id,
                    name
                )
            )
            `);

        data = result.data;
        error = result.error;

        } else {

        const result = await supabase
            .from(table)
            .select("*");

        data = result.data;
        error = result.error;
        }

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

    if(action === "delete") {

        const { data, error } = await supabase
        .from(table)
        .delete()
        .eq("id", id)
        .select();

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                error: "Data not found in this table"
            });
        }

        return res.status(200).json({
            message: "Deleted successfully",
            data
        });
    }

    if(action === "create") {

        const { data, error } = await supabase
        .from(table)
        .insert(body.data)
        .select();

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }
        return res.status(200).json({
            data
        });
    }

    if(action === "update") {
        
        const { data, error } = await supabase
        .from(table)
        .update(body.data)
        .eq("id", id)
        .select();
        
        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }
        return res.status(200).json({
            data
        });
    }
}