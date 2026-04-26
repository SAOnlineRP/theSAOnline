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

        return res.status(200).json({
            data: {
            equipped,
            },
        });
    }

  return res.status(405).json({ error: "Method not allowed" });
}