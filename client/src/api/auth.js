// Authentication API endpoints

const AUTH_BASE = 'http://localhost:3001/auth';

export async function login(username, password) {
  const response = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Wrong username or password');
  }

  return response.json();
}

export async function logout() {
  try {
    const response = await fetch(`${AUTH_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Logout failed with status ${response.status}`);
    }

    return true;
  } catch (error) {
    throw new Error('Network error during logout', { cause: error });
  }
}

export async function getAuthStatus() {
  try {
    const response = await fetch(`${AUTH_BASE}/status`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error('Failed to fetch auth status', { cause: error });
  }
}
