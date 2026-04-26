import { supabase } from "./supabaseClient.js";

export async function requireLogin() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    window.location.replace("/index.html");
    return null;
  }

  return session;
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "/index.html";
}