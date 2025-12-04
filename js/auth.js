// auth.js

function requireAuth() {
  const token = localStorage.getItem('authToken');
  if (!token || typeof token !== 'string' || token.length < 10) {
    localStorage.removeItem('authToken');
    alert('Session expired or invalid token. Please log in again.');
    window.location.href = 'login.html';
  }
}

function redirectIfLoggedIn() {
  const token = localStorage.getItem('authToken');
  if (token) {
    window.location.href = 'dashboard.html';
  }
}

// A helper function to wrap axios calls and handle 401 Unauthorized
async function authAxios(config = {}) {
  const token = localStorage.getItem('authToken');
  config.headers = config.headers || {};
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      alert('Session expired or invalid token. Please log in again.');
      window.location.href = 'login.html';
      return null; // Stop further processing
    }
    throw error; // Re-throw other errors
  }
}
