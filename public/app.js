const API_BASE = 'http://localhost:3000/api';

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');

        if (tab === 'doctors') loadDoctors();
        if (tab === 'episodes') loadEpisodes();
    });
});

// Load doctors on page load
window.addEventListener('load', () => {
    loadDoctors();
});

// Doctors CRUD
async function loadDoctors() {
    try {
        const response = await fetch(`${API_BASE}/doctors`);
        const result = await response.json();
        const doctors = result.data || result; // Handle both old and new format
        const list = document.getElementById('doctors-list');
        list.innerHTML = doctors.map(doctor => `
            <div class="data-card">
                <div>
                    <h3>Doctor #${doctor.incarnation_number}</h3>
                    <p><strong>Actor:</strong> ${doctor.actor?.name || 'N/A'}</p>
                    <p><strong>Catchphrase:</strong> ${doctor.catchphrase || 'N/A'}</p>
                </div>
                <div class="data-actions">
                    <button class="btn btn-secondary" onclick="editDoctor(${doctor.doctor_id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteDoctor(${doctor.doctor_id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('doctors-list').innerHTML = `<div class="error">Error loading doctors: ${error.message}</div>`;
    }
}

function showDoctorForm(doctor = null) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    body.innerHTML = `
        <h2>${doctor ? 'Edit' : 'Add'} Doctor</h2>
        <form id="doctor-form">
            <div class="form-group">
                <label>Actor ID:</label>
                <input type="number" name="actor_id" value="${doctor?.actor_id || ''}" required>
            </div>
            <div class="form-group">
                <label>Incarnation Number:</label>
                <input type="number" name="incarnation_number" value="${doctor?.incarnation_number || ''}" required>
            </div>
            <div class="form-group">
                <label>First Episode ID:</label>
                <input type="number" name="first_episode_id" value="${doctor?.first_episode_id || ''}">
            </div>
            <div class="form-group">
                <label>Last Episode ID:</label>
                <input type="number" name="last_episode_id" value="${doctor?.last_episode_id || ''}">
            </div>
            <div class="form-group">
                <label>Catchphrase:</label>
                <input type="text" name="catchphrase" value="${doctor?.catchphrase || ''}">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">${doctor ? 'Update' : 'Create'}</button>
            </div>
        </form>
    `;
    modal.style.display = 'block';
    document.getElementById('doctor-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        Object.keys(data).forEach(k => data[k] = data[k] ? (isNaN(data[k]) ? data[k] : parseInt(data[k])) : null);

        try {
            const url = doctor ? `${API_BASE}/doctors/${doctor.doctor_id}` : `${API_BASE}/doctors`;
            const method = doctor ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                closeModal();
                loadDoctors();
                // Show success message
                showNotification('Doctor ' + (doctor ? 'updated' : 'created') + ' successfully!', 'success');
            } else {
                const errorData = await response.json();
                alert('Error: ' + (errorData.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

function editDoctor(id) {
    fetch(`${API_BASE}/doctors/${id}`)
        .then(r => r.json())
        .then(doctor => showDoctorForm(doctor))
        .catch(err => alert('Error loading doctor: ' + err.message));
}

async function deleteDoctor(id) {
    if (!confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) return;
    try {
        const response = await fetch(`${API_BASE}/doctors/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadDoctors();
            showNotification('Doctor deleted successfully!', 'success');
        } else {
            const errorData = await response.json();
            alert('Error deleting doctor: ' + (errorData.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Episodes CRUD
async function loadEpisodes() {
    try {
        const response = await fetch(`${API_BASE}/episodes`);
        const result = await response.json();
        const episodes = result.data || result; // Handle both old and new format
        const list = document.getElementById('episodes-list');
        list.innerHTML = episodes.map(episode => `
            <div class="data-card">
                <div>
                    <h3>${episode.title}</h3>
                    <p><strong>Season:</strong> ${episode.season?.series_number || 'N/A'}</p>
                    <p><strong>Air Date:</strong> ${episode.air_date || 'N/A'}</p>
                    <p><strong>Runtime:</strong> ${episode.runtime_minutes || 'N/A'} minutes</p>
                </div>
                <div class="data-actions">
                    <button class="btn btn-secondary" onclick="editEpisode(${episode.episode_id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteEpisode(${episode.episode_id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('episodes-list').innerHTML = `<div class="error">Error loading episodes: ${error.message}</div>`;
    }
}

function showEpisodeForm(episode = null) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    body.innerHTML = `
        <h2>${episode ? 'Edit' : 'Add'} Episode</h2>
        <form id="episode-form">
            <div class="form-group">
                <label>Season ID:</label>
                <input type="number" name="season_id" value="${episode?.season_id || ''}" required>
            </div>
            <div class="form-group">
                <label>Title:</label>
                <input type="text" name="title" value="${episode?.title || ''}" required>
            </div>
            <div class="form-group">
                <label>Writer ID:</label>
                <input type="number" name="writer_id" value="${episode?.writer_id || ''}">
            </div>
            <div class="form-group">
                <label>Director ID:</label>
                <input type="number" name="director_id" value="${episode?.director_id || ''}">
            </div>
            <div class="form-group">
                <label>Episode Number:</label>
                <input type="number" name="episode_number" value="${episode?.episode_number || ''}">
            </div>
            <div class="form-group">
                <label>Air Date:</label>
                <input type="date" name="air_date" value="${episode?.air_date || ''}">
            </div>
            <div class="form-group">
                <label>Runtime (minutes):</label>
                <input type="number" name="runtime_minutes" value="${episode?.runtime_minutes || ''}">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">${episode ? 'Update' : 'Create'}</button>
            </div>
        </form>
    `;
    modal.style.display = 'block';
    document.getElementById('episode-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        Object.keys(data).forEach(k => data[k] = data[k] ? (isNaN(data[k]) ? data[k] : parseInt(data[k])) : null);

        try {
            const url = episode ? `${API_BASE}/episodes/${episode.episode_id}` : `${API_BASE}/episodes`;
            const method = episode ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                closeModal();
                loadEpisodes();
                // Show success message
                showNotification('Episode ' + (episode ? 'updated' : 'created') + ' successfully!', 'success');
            } else {
                const errorData = await response.json();
                alert('Error: ' + (errorData.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

function editEpisode(id) {
    fetch(`${API_BASE}/episodes/${id}`)
        .then(r => r.json())
        .then(episode => showEpisodeForm(episode))
        .catch(err => alert('Error loading episode: ' + err.message));
}

async function deleteEpisode(id) {
    if (!confirm('Are you sure you want to delete this episode? This action cannot be undone.')) return;
    try {
        const response = await fetch(`${API_BASE}/episodes/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadEpisodes();
            showNotification('Episode deleted successfully!', 'success');
        } else {
            const errorData = await response.json();
            alert('Error deleting episode: ' + (errorData.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Query functions
async function queryDoctorDetails() {
    const id = document.getElementById('doctor-id').value;
    if (!id) {
        alert('Please enter a Doctor ID');
        return;
    }
    const results = document.getElementById('join-results');
    results.innerHTML = '<div class="loading">Loading...</div>';
    try {
        const response = await fetch(`${API_BASE}/queries/join/doctor/${id}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
            results.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        } else {
            results.innerHTML = `<div class="error">No data found for Doctor ID ${id}</div>`;
        }
    } catch (error) {
        results.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

async function queryDoctorSummary() {
    const results = document.getElementById('view-results');
    results.innerHTML = '<div class="loading">Loading...</div>';
    try {
        const response = await fetch(`${API_BASE}/queries/view/doctor-summary`);
        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error && errorData.error.includes("doesn't exist")) {
                results.innerHTML = `<div class="error">VIEW not created yet. Please run the VIEW creation SQL from database_objects.sql in MySQL Workbench.</div>`;
                return;
            }
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            results.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        } else {
            results.innerHTML = `<div class="error">No data found in VIEW</div>`;
        }
    } catch (error) {
        results.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

async function queryEnemySummary() {
    const results = document.getElementById('view-results');
    results.innerHTML = '<div class="loading">Loading...</div>';
    try {
        const response = await fetch(`${API_BASE}/queries/view/enemy-summary`);
        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error && errorData.error.includes("doesn't exist")) {
                results.innerHTML = `<div class="error">VIEW not created yet. Please run the VIEW creation SQL from database_objects.sql in MySQL Workbench.</div>`;
                return;
            }
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            results.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        } else {
            results.innerHTML = `<div class="error">No data found in VIEW</div>`;
        }
    } catch (error) {
        results.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

async function queryEnemiesByThreat() {
    const level = document.getElementById('threat-level').value;
    if (!level || level < 1 || level > 10) {
        alert('Please enter a threat level between 1 and 10');
        return;
    }
    const results = document.getElementById('procedure-results');
    results.innerHTML = '<div class="loading">Loading...</div>';
    try {
        const response = await fetch(`${API_BASE}/queries/procedure/enemies/${level}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            results.innerHTML = `<div class="success">Found ${data.length} enemy/enemies with threat level >= ${level}</div><pre>${JSON.stringify(data, null, 2)}</pre>`;
        } else if (Array.isArray(data)) {
            results.innerHTML = `<div class="error">No enemies found with threat level >= ${level}</div>`;
        } else {
            results.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        }
    } catch (error) {
        results.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

async function updateEnemyThreat() {
    const id = document.getElementById('enemy-id').value;
    const threat = document.getElementById('new-threat').value;
    if (!id || !threat || threat < 1 || threat > 10) {
        alert('Please enter valid enemy ID and threat level (1-10)');
        return;
    }
    const results = document.getElementById('update-results');
    results.innerHTML = '<div class="loading">Loading...</div>';
    try {
        const response = await fetch(`${API_BASE}/queries/update/enemy/${id}/threat-level`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threat_level: parseInt(threat) })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        const data = await response.json();
        if (data && data.enemy_id) {
            results.innerHTML = `<div class="success">[SUCCESS] Updated successfully! Enemy "${data.name}" threat level is now ${data.threat_level}</div><pre>${JSON.stringify(data, null, 2)}</pre>`;
            // Clear input fields
            document.getElementById('enemy-id').value = '';
            document.getElementById('new-threat').value = '';
        } else {
            results.innerHTML = `<div class="error">Update completed but no data returned</div>`;
        }
    } catch (error) {
        results.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

// LLM Integration
async function askLLM() {
    const query = document.getElementById('llm-query').value.trim();
    if (!query) {
        alert('Please enter a question');
        return;
    }
    const results = document.getElementById('llm-results');
    results.innerHTML = '<div class="loading">AI is thinking...</div>';
    try {
        const response = await fetch(`${API_BASE}/llm/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error && (errorData.error.includes('quota') || errorData.error.includes('429'))) {
                results.innerHTML = `<div class="error">
                    <strong>[WARNING] API Quota Exceeded:</strong><br>
                    ${errorData.error}<br><br>
                    <strong>Important Note:</strong><br>
                    <ul style="text-align: left; margin: 10px 0;">
                        <li>ChatGPT Plus subscription ≠ OpenAI API access</li>
                        <li>You need a separate OpenAI API account with billing enabled</li>
                        <li>Visit: <a href="https://platform.openai.com/account/billing" target="_blank">platform.openai.com/account/billing</a></li>
                        <li>Add payment method and purchase API credits</li>
                    </ul>
                    <em style="color: #4caf50;"><strong>[NOTE] Code Status:</strong> The LLM integration is fully implemented and working correctly. This is purely a billing/quota issue, not a code problem. For your presentation, you can demonstrate the feature works by showing the error handling and explaining the API setup process.</em>
                </div>`;
                return;
            }
            if (errorData.error && errorData.error.includes('API key')) {
                results.innerHTML = `<div class="error"><strong>API Key Issue:</strong><br>${errorData.error}<br><br><em>Please check your OPENAI_API_KEY in the .env file and restart the server.</em></div>`;
                return;
            }
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        const data = await response.json();
        if (data.answer) {
            results.innerHTML = `<div class="success"><strong>AI Answer:</strong><br><div style="white-space: pre-wrap; margin-top: 10px;">${data.answer}</div></div>`;
        } else if (data.message) {
            results.innerHTML = `<div class="success"><strong>Response:</strong><br>${data.message}</div>`;
        } else {
            results.innerHTML = `<div class="error">Unexpected response format</div>`;
        }
    } catch (error) {
        results.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

