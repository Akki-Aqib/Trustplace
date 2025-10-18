async function fetchUsers() {
  const res = await fetch('/api/users');
  const users = await res.json();
  const container = document.getElementById('users-container');
  container.innerHTML = '';

  for (const id in users) {
    const user = users[id];

    // Create user card
    const card = document.createElement('div');
    card.className = 'user-card';
    card.innerHTML = `
      <h3>${id}</h3>
      <p>Location: <span class="location">${user.location}</span></p>
      <p>Device: <span class="device">${user.device}</span></p>
      <p>Failed Logins: <span class="failed_logins">${user.failed_logins}</span></p>
      <p>Session Activity: <span class="session_activity">${user.session_activity}</span></p>
      <p class="trust-score">Trust Score: ${user.trust_score}</p>

      <h4>Update Activity</h4>
      <input type="text" placeholder="Location" id="loc-${id}" />
      <input type="text" placeholder="Device" id="dev-${id}" />
      <input type="number" placeholder="Failed Logins" id="fail-${id}" />
      <input type="number" placeholder="Session Activity" id="sess-${id}" />
      <button onclick="updateUser('${id}')">Update</button>
      <button onclick="calculateScore('${id}')">Recalculate Trust Score</button>
    `;
    container.appendChild(card);
  }
}

// Call API to recalculate trust score
async function calculateScore(userId) {
  const res = await fetch(`/api/users/${userId}/calculate`);
  const data = await res.json();
  alert(`New Trust Score: ${data.trust_score}`);
  fetchUsers(); // Refresh dashboard
}

// Call API to update user metrics
async function updateUser(userId) {
  const location = document.getElementById(`loc-${userId}`).value;
  const device = document.getElementById(`dev-${userId}`).value;
  const failed_logins = document.getElementById(`fail-${userId}`).value;
  const session_activity = document.getElementById(`sess-${userId}`).value;

  const body = {};
  if (location) body.location = location;
  if (device) body.device = device;
  if (failed_logins) body.failed_logins = Number(failed_logins);
  if (session_activity) body.session_activity = Number(session_activity);

  const res = await fetch(`/api/users/${userId}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  alert(data.message);
  fetchUsers(); // Refresh dashboard
}

// Initial fetch
fetchUsers();
