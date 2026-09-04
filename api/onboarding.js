// GET  /api/onboarding              -> public, returns the current message
// POST /api/onboarding body: { message }   (admin)
const { supabase } = require('../lib/supabase');
const { requireAdmin } = require('../lib/adminAuth');

const DEFAULT_MESSAGE = 'Welcome! Please join our channels to continue.';

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { data } = await supabase.from('app_settings').select('value').eq('key', 'onboarding_message').single();
      return res.status(200).json({ message: (data && data.value) || DEFAULT_MESSAGE });
    }

    if (!requireAdmin(req, res)) return;

    if (req.method === 'POST') {
      const { message } = req.body || {};
      if (!message) return res.status(400).json({ error: 'message is required' });
      const { error } = await supabase.from('app_settings').upsert({ key: 'onboarding_message', value: message });
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('onboarding.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
