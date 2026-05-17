import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  // ambil token dari header
  const authHeader = req.headers.authorization || "";

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase
    .from("catalog_partners")
    .select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ data });
}