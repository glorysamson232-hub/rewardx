// GET /api/admin/users?userId=123   (admin)
const { supabase } = require('../lib/supabase');
const { requireAdmin } = require('../lib/adminAuth');

module.exports = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const userId = String(req.query.userId || '').trim();
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const { data: user, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error && error.code === 'PGRST116') return res.status(404).json({ error: 'User not found' });
    if (error) throw error;

    return res.status(200).json({ user });
  } catch (err) {
    console.error('admin/users.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
