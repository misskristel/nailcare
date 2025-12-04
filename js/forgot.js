const API_URL = 'https://nailcare.ccs4thyear.com';

// DOM elements
const $stepEmail = $('#step-email');
const $stepOtp = $('#step-otp');
const $stepReset = $('#step-reset');

const $forgotEmailInput = $('#forgotEmail');
const $otpInput = $('#otpInput');
const $newPasswordInput = $('#newPassword');
const $confirmPasswordInput = $('#confirmPassword');

const $sendOtpBtn = $('#sendOtpBtn');
const $verifyOtpBtn = $('#verifyOtpBtn');
const $resetPasswordBtn = $('#resetPasswordBtn');

const $emailMsg = $('#emailMsg');
const $otpMsg = $('#otpMsg');
const $resetMsg = $('#resetMsg');

// Global variables to store data
let userEmail = '';
let verifiedOtp = '';

// Step 1: Send OTP
$sendOtpBtn.on('click', async function() {
    const email = $forgotEmailInput.val().trim();
    
    if (!email) {
        showMessage($emailMsg, 'Please enter your email address.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage($emailMsg, 'Please enter a valid email address.', 'error');
        return;
    }

    try {
        $sendOtpBtn.prop('disabled', true);
        $sendOtpBtn.text('Sending...');
        
        const response = await axios.post(`${API_URL}/api/forgot-password/send-otp`, { email });

        if (response.status === 200) {
            // Store email BEFORE showing success message
            userEmail = email;
            console.log('Email stored:', userEmail);
            showMessage($emailMsg, response.data.message, 'success');
            
            // Move to step 2 after 1 second
            setTimeout(() => {
                if (window.showStep) {
                    window.showStep('step-otp');
                } else {
                    $stepEmail.hide();
                    $stepOtp.show();
                }
            }, 1000);
        } else {
            showMessage($emailMsg, response.data.error, 'error');
        }
    } catch (error) {
        console.error('Send OTP Error:', error);
        if (error.response && error.response.data && error.response.data.error) {
            showMessage($emailMsg, error.response.data.error, 'error');
        } else {
            showMessage($emailMsg, 'Network error. Please try again.', 'error');
        }
    } finally {
        $sendOtpBtn.prop('disabled', false);
        $sendOtpBtn.text('Send OTP');
    }
});

// Step 2: Verify OTP
$verifyOtpBtn.on('click', async function() {
    const otp = $otpInput.val().trim();
    
    if (!otp) {
        showMessage($otpMsg, 'Please enter the OTP.', 'error');
        return;
    }

    if (otp.length !== 6) {
        showMessage($otpMsg, 'OTP must be 6 digits.', 'error');
        return;
    }

    try {
        $verifyOtpBtn.prop('disabled', true);
        $verifyOtpBtn.text('Verifying...');
        
        const response = await axios.post(`${API_URL}/api/forgot-password/verify-otp`, { 
            email: userEmail, 
            otp: otp 
        });

        if (response.status === 200) {
            // Store the OTP BEFORE showing success message
            verifiedOtp = otp;
            console.log('OTP verified and stored:', verifiedOtp);
            console.log('Email is:', userEmail);
            showMessage($otpMsg, response.data.message, 'success');
            
            // Move to step 3 after 1 second
            setTimeout(() => {
                if (window.showStep) {
                    window.showStep('step-reset');
                } else {
                    $stepOtp.hide();
                    $stepReset.show();
                }
            }, 1000);
        } else {
            showMessage($otpMsg, response.data.error, 'error');
        }
    } catch (error) {
        console.error('Verify OTP Error:', error);
        if (error.response && error.response.data && error.response.data.error) {
            showMessage($otpMsg, error.response.data.error, 'error');
        } else {
            showMessage($otpMsg, 'Network error. Please try again.', 'error');
        }
    } finally {
        $verifyOtpBtn.prop('disabled', false);
        $verifyOtpBtn.text('Verify OTP');
    }
});

// Step 3: Reset Password
$resetPasswordBtn.on('click', async function() {
    const newPassword = $newPasswordInput.val();
    const confirmPassword = $confirmPasswordInput.val();
    
    // Add debug logging
    console.log('Reset attempt with:');
    console.log('- Email:', userEmail);
    console.log('- OTP:', verifiedOtp);
    console.log('- New password length:', newPassword.length);
    
    if (!newPassword || !confirmPassword) {
        showMessage($resetMsg, 'Please fill in all fields.', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showMessage($resetMsg, 'Password must be at least 6 characters.', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showMessage($resetMsg, 'Passwords do not match.', 'error');
        return;
    }

    // Verify we have email and OTP
    if (!userEmail || !verifiedOtp) {
        showMessage($resetMsg, 'Session expired. Please start over.', 'error');
        setTimeout(() => {
            window.location.href = 'forgot.html';
        }, 2000);
        return;
    }

    try {
        $resetPasswordBtn.prop('disabled', true);
        $resetPasswordBtn.text('Resetting...');
        
        const response = await axios.post(`${API_URL}/api/forgot-password/reset`, { 
            email: userEmail, 
            otp: verifiedOtp,
            new_password: newPassword
        });

        if (response.status === 200) {
            showMessage($resetMsg, response.data.message, 'success');
            
            // Clear stored data
            userEmail = '';
            verifiedOtp = '';
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            console.error('Reset failed:', response.data);
            showMessage($resetMsg, response.data.error, 'error');
        }
    } catch (error) {
        console.error('Reset Password Error:', error);
        if (error.response && error.response.data && error.response.data.error) {
            showMessage($resetMsg, error.response.data.error, 'error');
        } else {
            showMessage($resetMsg, 'Network error. Please try again.', 'error');
        }
    } finally {
        $resetPasswordBtn.prop('disabled', false);
        $resetPasswordBtn.text('Reset Password');
    }
});

// Utility functions
function showMessage($element, message, type) {
    $element.text(message);
    $element.removeClass('success-message error-message').addClass(type === 'success' ? 'success-message' : 'error-message');
    $element.show();
    
    // Hide message after 5 seconds
    setTimeout(() => {
        $element.hide();
    }, 5000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Allow only numbers in OTP input
$otpInput.on('input', function() {
    $(this).val($(this).val().replace(/[^0-9]/g, ''));
});

// Auto-focus next input after email
$forgotEmailInput.on('keypress', function(e) {
    if (e.key === 'Enter') {
        $sendOtpBtn.click();
    }
});

// Auto-focus next input after OTP
$otpInput.on('keypress', function(e) {
    if (e.key === 'Enter') {
        $verifyOtpBtn.click();
    }
});

// Auto-submit on Enter in password fields
$confirmPasswordInput.on('keypress', function(e) {
    if (e.key === 'Enter') {
        $resetPasswordBtn.click();
    }
});