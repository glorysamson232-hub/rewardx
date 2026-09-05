// GET  /api/wallet?userId=123               -> { walletAddress }
// POST /api/wallet   body: { userId, walletAddress }
//   First time setting it: free.
//   Changing an existing one: costs 2000 points (matches the original "modify fee" rule).
const { supabase } = require('../lib/supabase');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const userId = String(req.query.userId || '').trim();
      if (!userId) return res.status(400).json({ error: 'userId is required' });
      const { data, error } = await supabase.from('users').select('wallet_address').eq('id', userId).single();
      if (error && error.code === 'PGRST116') return res.status(200).json({ walletAddress: null });
      if (error) throw error;
      return res.status(200).json({ walletAddress: data.wallet_address });
    }

    if (req.method === 'POST') {
      const { userId, walletAddress } = req.body || {};
      if (!userId || !walletAddress) return res.status(400).json({ error: 'userId and walletAddress are required' });

      const { data: user, error } = await supabase
        .from('users')
        .select('wallet_address,balance')
        .eq('id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;

      const alreadySet = user && user.wallet_address;

      if (!alreadySet) {
        await supabase.from('users').upsert({ id: userId, wallet_address: walletAddress });
        return res.status(200).json({ ok: true, feeCharged: 0 });
      }

      const FEE = 2000;
      if (user.balance < FEE) {
        return res.status(400).json({ error: `Changing your wallet costs ${FEE} points — you don't have enough balance` });
      }

      await supabase
        .from('users')
        .update({ wallet_address: walletAddress, balance: user.balance - FEE })
        .eq('id', userId);

      return res.status(200).json({ ok: true, feeCharged: FEE });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('wallet.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
