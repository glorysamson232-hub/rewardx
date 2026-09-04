// GET /api/tasks/list?userId=123
const { supabase } = require('../../lib/supabase');

module.exports = async (req, res) => {
  try {
    const userId = String(req.query.userId || '').trim();
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const { data: tasks, error: tasksErr } = await supabase.from('tasks').select('*').eq('active', true);
    if (tasksErr) throw tasksErr;

    const { data: user } = await supabase.from('users').select('tasks_completed').eq('id', userId).single();
    const completed = (user && user.tasks_completed) || [];

    return res.status(200).json({
      tasks,
      completed,
      allCompleted: tasks.length > 0 && tasks.every((t) => completed.includes(t.id)),
    });
  } catch (err) {
    console.error('tasks/list.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
