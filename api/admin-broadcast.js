// POST /api/admin/broadcast   body: { message }   (admin)
// Sends a Telegram message to every user who has ever opened the bot.
// Note: Vercel's free/hobby plan times out serverless functions after 10s,
// so this works well for up to a few hundred users. For a much larger
// user base, this would need to move to a background job instead.
const { supabase } = require('../lib/supabase');
const { requireAdmin } = require('../lib/adminAuth');

module.exports = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message is required' });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return res.status(500).json({ error: 'Bot token not configured' });

    const { data: users, error } = await supabase.from('users').select('id').eq('banned', false);
    if (error) throw error;

    let sent = 0;
    let failed = 0;

    for (const u of users) {
      try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: u.id, text: message }),
        });
        if (r.ok) sent += 1; else failed += 1;
      } catch (e) {
        failed += 1;
      }
      // Stay under Telegram's ~30 messages/second limit.
      await new Promise((resolve) => setTimeout(resolve, 40));
    }

    return res.status(200).json({ ok: true, sent, failed, total: users.length });
  } catch (err) {
    console.error('admin/broadcast.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
