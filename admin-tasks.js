// GET  /api/admin/tasks    (admin) -> all tasks, active and inactive
// POST /api/admin/tasks    (admin) body: { title, points, platform, active }
// PUT  /api/admin/tasks    (admin) body: { id, title, points, platform, active }
// DELETE /api/admin/tasks  (admin) body: { id }
const { supabase } = require('../lib/supabase');
const { requireAdmin } = require('../lib/adminAuth');

module.exports = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('tasks').select('*').order('platform');
      if (error) throw error;
      return res.status(200).json({ tasks: data });
    }

    if (req.method === 'POST') {
      const { title, points, platform } = req.body || {};
      if (!title || points == null) return res.status(400).json({ error: 'title and points are required' });
      const { data, error } = await supabase
        .from('tasks')
        .insert({ title, points, platform: platform || 'general', active: true })
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, id: data.id });
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('tasks').update(updates).eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('admin/tasks.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
