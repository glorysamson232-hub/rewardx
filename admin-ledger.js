// GET /api/admin/ledger?userId=123   (admin)
const { supabase } = require('../lib/supabase');
const { requireAdmin } = require('../lib/adminAuth');

module.exports = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const userId = String(req.query.userId || '').trim();
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;

    return res.status(200).json({ transactions: data });
  } catch (err) {
    console.error('admin/ledger.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
