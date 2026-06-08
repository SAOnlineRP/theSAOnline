import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {

  const playerId = req.body.record.player_id;

  const { data: player } = await supabase
    .from('players')
    .select('username')
    .eq('id', playerId)
    .single();

  const playerName = player?.username ?? 'Unknown';

  await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        message_thread_id: process.env.LOGIN_TOPIC_ID,
        text: `🟢 Player Login\nusername: ${playerName}`
      })
    }
  );

  return res.status(200).json({
    success: true
  });
}