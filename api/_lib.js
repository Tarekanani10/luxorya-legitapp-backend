const axios = require('axios');

// Comma-separated list of storefront origins allowed to call this backend.
// Set ALLOWED_ORIGIN in your Vercel project's environment variables,
// e.g. "https://luxorya.com,https://www.luxorya.com"
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || '*')
  .split(',')
  .map((s) => s.trim());

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Handles CORS preflight. Returns true if the request was a preflight
// and has already been responded to (caller should stop processing).
function handlePreflight(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

const legitApp = axios.create({
  baseURL: process.env.LEGIT_APP_API_URL, // sandbox or production base URL
  headers: {
    Authorization: `Bearer ${process.env.LEGIT_APP_DEVELOPER_SECRET_KEY}`,
  },
});

function sendError(res, error) {
  const status = error.response?.status || 500;
  const message =
    error.response?.data?.message || error.message || 'Unexpected error';
  const details = error.response?.data || null;
  res.status(status).json({ message, details });
}

module.exports = { applyCors, handlePreflight, legitApp, sendError };
