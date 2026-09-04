// GET /api/telegram/start?userId=123&startParam=ref456
const { supabase } = require('../../lib/supabase');
const { REFERRAL_BONUS_STAGE_START } = require('../../lib/config');

module.exports = async (req, res) => {
  try {
    const userId = String(req.query.userId || '').trim();
    const startParam = String(req.query.startParam || '').trim();
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    await supabase.from('users').upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });

    const hasReferralParam = startParam.startsWith('ref');
    const referrerId = hasReferralParam ? startParam.replace('ref', '') : null;

    if (!hasReferralParam || !referrerId || referrerId === userId) {
      return res.status(200).json({ ok: true, referralProcessed: false });
    }

    const { data, error } = await supabase.rpc('process_referral_start', {
      p_user_id: userId,
      p_referrer_id: referrerId,
      p_bonus: REFERRAL_BONUS_STAGE_START,
    });
    if (error) throw error;

    return res.status(200).json({ ok: true, referralProcessed: data === true, referrerId });
  } catch (err) {
    console.error('telegram/start.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
