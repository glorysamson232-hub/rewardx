// POST /api/telegram/check-membership   body: { userId, channelIds: ["uuid", ...] }
const { supabase } = require('../lib/supabase');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    const { userId, channelIds } = req.body || {};
    if (!userId || !Array.isArray(channelIds)) {
      return res.status(400).json({ error: 'userId and channelIds[] are required' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return res.status(500).json({ error: 'Bot token not configured' });

    const { data: channels, error } = await supabase.from('channels').select('*').in('id', channelIds);
    if (error) throw error;

    const membership = {};
    for (const channelId of channelIds) {
      const ch = channels.find((c) => c.id === channelId);
      if (!ch || !ch.active) {
        membership[channelId] = false;
        continue;
      }
      try {
        const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${encodeURIComponent(ch.username)}&user_id=${encodeURIComponent(userId)}`;
        const r = await fetch(url);
        const data = await r.json();
        const status = data && data.result && data.result.status;
        membership[channelId] = ['creator', 'administrator', 'member'].includes(status);
      } catch (e) {
        console.error('check-membership: error for', channelId, e);
        membership[channelId] = false;
      }
    }

    return res.status(200).json({ membership });
  } catch (err) {
    console.error('check-membership.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
