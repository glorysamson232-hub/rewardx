// GET  /api/admin/withdrawals             (admin) -> pending withdrawals
// POST /api/admin/withdrawals body: { id, action: 'approve'|'reject' } (admin)
const { supabase } = require('../lib/supabase');
const { requireAdmin } = require('../lib/adminAuth');

module.exports = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ withdrawals: data });
    }

    if (req.method === 'POST') {
      const { id, action } = req.body || {};
      if (!id || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'id and action (approve/reject) are required' });
      }
      const { data, error } = await supabase.rpc('resolve_withdrawal', { p_withdrawal_id: id, p_action: action });
      if (error) throw error;
      if (data && data.error) return res.status(400).json({ error: data.error });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('admin/withdrawals.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
