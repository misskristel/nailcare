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

/**
 * Configure a code/OTP input field to use numeric keypad on mobile devices
 * This function should be called for all verification code inputs
 * @param {string|jQuery} selector - CSS selector or jQuery object for the input field
 */
function configureCodeInput(selector) {
  const $input = typeof selector === 'string' ? $(selector) : selector;
  
  if ($input.length) {
    // Set attributes for numeric keypad
    $input.attr({
      'type': 'tel',
      'inputmode': 'numeric',
      'pattern': '[0-9]*'
    });
    
    // Ensure only numbers can be entered
    $input.on('input', function() {
      $(this).val($(this).val().replace(/[^0-9]/g, ''));
    });
  }
}

// Auto-configure all common code input selectors when DOM is ready
$(document).ready(function() {
  // Configure all OTP/code inputs that might exist
  // Use a small delay to ensure all inputs are rendered
  setTimeout(function() {
    configureCodeInput('#otpInput');
    configureCodeInput('#verificationCode');
    configureCodeInput('#verifyCode');
    configureCodeInput('#codeInput');
    configureCodeInput('input[placeholder*="OTP"]');
    configureCodeInput('input[placeholder*="otp"]');
    configureCodeInput('input[placeholder*="code"]');
    configureCodeInput('input[placeholder*="Code"]');
    configureCodeInput('input[placeholder*="verification"]');
    configureCodeInput('input[placeholder*="Verification"]');
  }, 100);
});
