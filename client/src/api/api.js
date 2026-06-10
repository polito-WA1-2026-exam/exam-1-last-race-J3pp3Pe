// Game API endpoints

const API_BASE = 'http://localhost:3001/api';

export async function getNetwork() {
  try {
    const response = await fetch(`${API_BASE}/network`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    throw new Error('Failed to fetch network', { cause: error });
  }
}

export async function getMe() {
  try {
    const response = await fetch(`${API_BASE}/me`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    throw new Error('Failed to fetch user info', { cause: error });
  }
}

export async function startNewGame() {
  try {
    const response = await fetch(`${API_BASE}/game/new`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    throw new Error('Failed to start new game', { cause: error });
  }
}

export async function submitRoute(gameId, segments) {
  try {
    const response = await fetch(`${API_BASE}/game/play`, {
      method: 'POST',
      body: JSON.stringify({ gameId, segments }),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    throw new Error('Failed to submit route', { cause: error });
  }
}

export async function getRankings() {
  try {
    const response = await fetch(`${API_BASE}/rankings`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (error) {
    throw new Error('Failed to fetch rankings', { cause: error });
  }
}
