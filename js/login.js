// login.js - Handle Login Form

$(document).ready(function() {
  const $loginForm = $("#loginForm");

  if ($loginForm.length) {
    $loginForm.on("submit", async function(e) {
      e.preventDefault();

      const formData = new FormData(this);
      const data = {
        username: formData.get("username"),
        password: formData.get("password")
      };

      try {
        const response = await axios.post("https://nailcare.ccs4thyear.com/api/login", data);

        // ✅ Store token and basic user info (including role)
        localStorage.setItem("authToken", response.data.token);
        if (response.data.user) {
          localStorage.setItem("userRole", response.data.user.role || "user");
          localStorage.setItem("userName", response.data.user.name || "");
          localStorage.setItem("userEmail", response.data.user.email || "");
        }

        alert("Login successful!");
        
        // Redirect based on role
        const role = response.data.user?.role || 'client';
        if (role === 'admin') {
          window.location.href = "dashboard.html";
        } else if (role === 'technician') {
          window.location.href = "dashboard.html";
        } else {
          window.location.href = "dashboard.html";
        }
      } catch (err) {
        console.error("Login error:", err);
        if (err.response && err.response.data && err.response.data.message) {
          alert(err.response.data.message);
        } else if (err.response && err.response.data && err.response.data.error) {
          alert(err.response.data.error);
        } else {
          alert("Network error. Please try again later.");
        }
      }
    });
  }
});