import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function makePseudoEmail(username) {
  return `${username.toLowerCase()}@game.local`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username dan password wajib diisi" });
    }

    const pseudoEmail = makePseudoEmail(username);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: pseudoEmail,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.status(200).json({
      message: "Login berhasil",
      session: data.session,
      user: data.user,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}