// GET  /api/channels                         -> public, returns active channels
// POST /api/channels   (admin, x-admin-secret) body: { label, username, type }
// PUT  /api/channels    (admin) body: { id, label, username, type, active }
// DELETE /api/channels  (admin) body: { id }
const { supabase } = require('../lib/supabase');
const { requireAdmin } = require('../lib/adminAuth');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('channels')
        .select('id,label,username,type')
        .eq('active', true);
      if (error) throw error;
      return res.status(200).json({ channels: data });
    }

    if (!requireAdmin(req, res)) return;

    if (req.method === 'POST') {
      const { label, username, type } = req.body || {};
      if (!label || !username) return res.status(400).json({ error: 'label and username are required' });
      const { data, error } = await supabase
        .from('channels')
        .insert({
          label,
          username: username.startsWith('@') ? username : `@${username}`,
          type: type || 'channel',
          active: true,
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, id: data.id });
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      if (updates.username && !updates.username.startsWith('@')) updates.username = `@${updates.username}`;
      const { error } = await supabase.from('channels').update(updates).eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('channels').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('channels.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
