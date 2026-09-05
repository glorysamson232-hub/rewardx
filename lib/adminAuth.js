// lib/adminAuth.js
// Every /api/admin/* route calls this first. It checks the request header
// x-admin-secret against the ADMIN_SECRET env var you set on Vercel.
// Returns true if authorized (and does nothing else); if not authorized,
// it sends the 401 response itself and returns false so the caller can stop.
function requireAdmin(req, res) {
  const provided = req.headers['x-admin-secret'];
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    res.status(500).json({ error: 'ADMIN_SECRET not configured on the server' });
    return false;
  }
  if (!provided || provided !== expected) {
    res.status(401).json({ error: 'Not authorized' });
    return false;
  }
  return true;
}

module.exports = { requireAdmin };
