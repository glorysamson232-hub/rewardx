// POST /api/tasks/complete   body: { userId, taskId }
const { supabase } = require('../lib/supabase');
const { REFERRAL_BONUS_STAGE_TASKS } = require('../lib/config');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    const { userId, taskId } = req.body || {};
    if (!userId || !taskId) return res.status(400).json({ error: 'userId and taskId are required' });

    const { data: task, error: taskErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('active', true)
      .single();
    if (taskErr || !task) return res.status(404).json({ error: 'Task not found or inactive' });

    const { data: userRow } = await supabase.from('users').select('banned').eq('id', userId).single();
    if (userRow && userRow.banned) return res.status(403).json({ error: 'Account suspended' });

    const { data, error } = await supabase.rpc('complete_task', {
      p_user_id: userId,
      p_task_id: taskId,
      p_task_points: task.points,
      p_bonus_tasks: REFERRAL_BONUS_STAGE_TASKS,
    });
    if (error) throw error;

    return res.status(200).json({ ok: true, ...data });
  } catch (err) {
    console.error('tasks/complete.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
