export default async function handler(req, res) {

    const data = req.body.record;

    await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: process.env.CHAT_ID,
                text: `Player: ${data.player_name}`
            })
        }
    );

    res.status(200).json({ success: true });
}