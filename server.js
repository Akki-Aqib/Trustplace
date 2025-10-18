const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static('public'));


// In-memory user storage
let users = {
  "user_101": {
    login_time: "2025-10-18T10:00:00Z",
    location: "India",
    device: "Chrome-Windows",
    failed_logins: 0,
    session_activity: 5,
    trust_score: 95
  },
  "user_102": {
    login_time: "2025-10-18T11:00:00Z",
    location: "USA",
    device: "Firefox-Windows",
    failed_logins: 1,
    session_activity: 3,
    trust_score: 90
  }
};

// Risk weights for trust calculation
const riskWeights = {
  geo_risk: 0.3,
  failed_logins: 0.25,
  unusual_time: 0.2,
  device_change: 0.15,
  session_activity: 0.1
};

// Trust score calculation function
function calculateTrustScore(user) {
  let score = 100; // start with max trust

  // 1. Geo risk (simplified: 1 if not India, else 0)
  let geoRisk = user.location !== "India" ? 1 : 0;

  // 2. Failed logins (normalized 0–1, max 5 attempts)
  let failedLoginsRisk = Math.min(user.failed_logins / 5, 1);

  // 3. Unusual login time (hours outside 6-22 = risky)
  let hour = new Date(user.login_time).getUTCHours();
  let unusualTimeRisk = (hour < 6 || hour > 22) ? 1 : 0;

  // 4. Device change (simplified: assume Chrome-Windows is usual)
  let deviceRisk = user.device !== "Chrome-Windows" ? 1 : 0;

  // 5. Session activity (requests > 10 per min = risky)
  let sessionRisk = Math.min(user.session_activity / 10, 1);

  // Weighted sum
  score -= geoRisk * riskWeights.geo_risk * 100;
  score -= failedLoginsRisk * riskWeights.failed_logins * 100;
  score -= unusualTimeRisk * riskWeights.unusual_time * 100;
  score -= deviceRisk * riskWeights.device_change * 100;
  score -= sessionRisk * riskWeights.session_activity * 100;

  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Test route
app.get('/', (req, res) => {
  res.send('✅ TrustPulse Server Running Successfully');
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Get single user by ID
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const user = users[userId];

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// Update user activity
app.post('/api/users/:id/update', (req, res) => {
  const userId = req.params.id;
  const user = users[userId];

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { login_time, location, device, failed_logins, session_activity } = req.body;

  if (login_time) user.login_time = login_time;
  if (location) user.location = location;
  if (device) user.device = device;
  if (failed_logins !== undefined) user.failed_logins = failed_logins;
  if (session_activity !== undefined) user.session_activity = session_activity;

  res.json({ message: "User activity updated successfully", user });
});

// Calculate trust score (POST version)
app.post('/api/users/:id/calculate', (req, res) => {
  const userId = req.params.id;
  const user = users[userId];

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.trust_score = calculateTrustScore(user);

  res.json({ message: "Trust score calculated", trust_score: user.trust_score });
});

// Calculate trust score (GET-friendly version for browser testing)
app.get('/api/users/:id/calculate', (req, res) => {
  const userId = req.params.id;
  const user = users[userId];

  if (!user) return res.status(404).json({ message: "User not found" });

  user.trust_score = calculateTrustScore(user);
  res.json({ message: "Trust score calculated", trust_score: user.trust_score });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
