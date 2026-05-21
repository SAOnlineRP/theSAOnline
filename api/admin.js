import { createSupabaseClient } from "../lib/supabase.js";

const allowedTables = [
  "catalog_partners",
  "catalog_skills",
  "catalog_soul_traits",
  "catalog_items"
];

export default async function handler(req, res) {
    const authHeader = req.headers.authorization || "";

    const supabase = createSupabaseClient(authHeader);

    const { table, action, data, id } = req.body;

    if (!allowedTables.includes(table)) {
        return res.status(403).json({
        error: "Invalid table"
        });
    }

      if (action === "getAll") {
        const result = await supabase
        .from(table)
        .select("*");

        return res.json(result);
    }

    if (action === "delete") {
        const result = await supabase
        .from(table)
        .delete()
        .eq("id", id);

        return res.json(result);
    }
}