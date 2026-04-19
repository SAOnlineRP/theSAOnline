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

    if (username.length < 3) {
      return res.status(400).json({ error: "Username minimal 3 karakter" });
    }

    const pseudoEmail = makePseudoEmail(username);

    const { data, error } = await supabase.auth.signUp({
      email: pseudoEmail,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const user = data.user;

    if (!user) {
      return res.status(500).json({ error: "User gagal dibuat" });
    }

    const { error: profileError } = await supabase
      .from("players")
      .insert({
        id: user.id,
        username: username.toLowerCase(),
      });

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    return res.status(200).json({
      message: "Register berhasil",
      userId: user.id,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}