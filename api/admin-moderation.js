// GET  /api/admin/moderation?userId=123      (admin) -> { banned }
// POST /api/admin/moderation body: { userId, banned: true|false }  (admin)
const { supabase } = require('../lib/supabase');
const { requireAdmin } = require('../lib/adminAuth');

module.exports = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    if (req.method === 'GET') {
      const userId = String(req.query.userId || '').trim();
      if (!userId) return res.status(400).json({ error: 'userId is required' });
      const { data, error } = await supabase.from('users').select('id,banned').eq('id', userId).single();
      if (error && error.code === 'PGRST116') return res.status(404).json({ error: 'User not found' });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { userId, banned } = req.body || {};
      if (!userId || typeof banned !== 'boolean') {
        return res.status(400).json({ error: 'userId and banned (true/false) are required' });
      }
      const { error } = await supabase.from('users').update({ banned }).eq('id', userId);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('admin/moderation.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
