// POST /api/withdraw/request   body: { userId, amountPoints, method, destination }
const { supabase } = require('../../lib/supabase');
const {
  MIN_WITHDRAWAL_POINTS,
  MAX_WITHDRAWAL_POINTS,
  MAX_WITHDRAWALS_PER_DAY,
  MIN_REFERRALS_TO_WITHDRAW,
  REFERRAL_BONUS_STAGE_WITHDRAW,
} = require('../../lib/config');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    const { userId, amountPoints, method, destination } = req.body || {};
    if (!userId || !amountPoints) {
      return res.status(400).json({ error: 'userId and amountPoints are required' });
    }

    const { data, error } = await supabase.rpc('request_withdrawal', {
      p_user_id: userId,
      p_amount: Number(amountPoints),
      p_method: method || 'unspecified',
      p_destination: destination || null,
      p_min: MIN_WITHDRAWAL_POINTS,
      p_max: MAX_WITHDRAWAL_POINTS,
      p_max_per_day: MAX_WITHDRAWALS_PER_DAY,
      p_min_referrals: MIN_REFERRALS_TO_WITHDRAW,
      p_bonus_withdraw: REFERRAL_BONUS_STAGE_WITHDRAW,
    });
    if (error) throw error;
    if (data && data.error) return res.status(400).json({ error: data.error });

    return res.status(200).json({ ok: true, balance: data.balance, status: 'pending' });
  } catch (err) {
    console.error('withdraw/request.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
