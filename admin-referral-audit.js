// GET /api/admin/referral-audit?userId=123   (admin)
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

    const { data: referredUsers, error: refErr } = await supabase
      .from('users')
      .select('id,referral_stage,balance,created_at')
      .eq('referred_by', userId);
    if (refErr) throw refErr;

    return res.status(200).json({
      userId,
      referredBy: user.referred_by,
      referralCount: user.referral_count,
      referredUsers,
    });
  } catch (err) {
    console.error('admin/referral-audit.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
