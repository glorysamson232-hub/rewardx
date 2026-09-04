// GET /api/user/balance?userId=123
const { supabase } = require('../lib/supabase');

module.exports = async (req, res) => {
  try {
    const userId = String(req.query.userId || '').trim();
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    let { data: user, error } = await supabase.from('users').select('*').eq('id', userId).single();

    if (error && error.code === 'PGRST116') {
      // No row yet — first time we've seen this user.
      const { data: created, error: insertErr } = await supabase
        .from('users')
        .insert({ id: userId })
        .select()
        .single();
      if (insertErr) throw insertErr;
      user = created;
    } else if (error) {
      throw error;
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error('balance.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
