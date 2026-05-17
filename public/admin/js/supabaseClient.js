import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  "https://hodpkhycowhjlzyrnhwk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZHBraHljb3doamx6eXJuaHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNDg5MjYsImV4cCI6MjA5MTYyNDkyNn0.xWlESJeznlEdeGjpHqj74IdYh4acSecSoZtH2vmh3ts"
);