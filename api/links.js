// GET  /api/links                          -> public, returns active links
// POST /api/links   (admin, x-admin-secret) body: { key, label, url }
// PUT  /api/links    (admin) body: { id, key, label, url, active }
// DELETE /api/links  (admin) body: { id }
const { supabase } = require('../lib/supabase');
const { requireAdmin } = require('../lib/adminAuth');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('links').select('id,key,label,url').eq('active', true);
      if (error) throw error;
      return res.status(200).json({ links: data });
    }

    if (!requireAdmin(req, res)) return;

    if (req.method === 'POST') {
      const { key, label, url } = req.body || {};
      if (!label || !url) return res.status(400).json({ error: 'label and url are required' });
      const { data, error } = await supabase
        .from('links')
        .insert({ key: key || null, label, url, active: true })
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, id: data.id });
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('links').update(updates).eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('links').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('links.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
