// Authentication API endpoints

const AUTH_BASE = 'http://localhost:3001/auth';

export async function login(username, password) {
  try {
    const response = await fetch(`${AUTH_BASE}/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Login failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }

    // Some backends can return 200 with an empty/non-JSON body on successful auth.
    return {};
  } catch (error) {
    throw new Error(error?.message || 'Network error during login', { cause: error });
  }
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
