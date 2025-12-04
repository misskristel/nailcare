$(document).ready(function() {
  const $registerForm = $("#registerForm");

  if ($registerForm.length) {
    $registerForm.on("submit", async function(e) {
      e.preventDefault();

      const $submitButton = $registerForm.find('button[type="submit"]');
      const originalText = $submitButton.text();
      
      $submitButton.prop('disabled', true);
      $submitButton.text("Registering...");

      const formData = new FormData(this);
      
      // Convert FormData to JSON for the API
      const data = {
        firstname: formData.get('firstname'),
        lastname: formData.get('lastname'),
        email: formData.get('email'),
        username: formData.get('username'),
        password: formData.get('password'),
      };

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await axios.post("https://nailcare.ccs4thyear.com/api/register", data, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeoutId);

        alert(response.data.message || "Registration successful! Please check your email to verify your account.");
        $registerForm[0].reset();
        window.location.href = "login.html";
      } catch (err) {
        console.error("Registration error:", err);
        const errorMsg = err.response?.data?.message || err.response?.data?.error || "Registration failed. Please try again.";
        alert(errorMsg);
      } finally {
        $submitButton.prop('disabled', false);
        $submitButton.text(originalText);
      }
    });
  }

  // Logout Handler
  const $logoutBtn = $("#logoutBtn");

  if ($logoutBtn.length) {
    $logoutBtn.on("click", async function() {
      await logout();
    });
  }
});

async function logout() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    alert("No token found, please log in again.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await axios.post("https://nailcare.ccs4thyear.com/api/logout", { token: token });
    console.log("Logout response:", response.data);

    if (response.status === 200) {
      localStorage.removeItem("authToken");
      alert("Logged out successfully!");
      window.location.href = "login.html";
    } else {
      console.error("Logout failed:", response.data.error);
      localStorage.removeItem("authToken");
      alert(response.data.error || "Logout completed, please log in again.");
      window.location.href = "login.html";
    }

  } catch (err) {
    console.error("Network error during logout:", err);
    localStorage.removeItem("authToken");
    if (err.response && err.response.data && err.response.data.error) {
      alert(err.response.data.error);
    } else {
      alert("Network error, but you've been logged out locally.");
    }
    window.location.href = "login.html";
  }
}

// Load Nail Services Function
async function loadNailServices() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    const response = await axios.get('https://nailcare.ccs4thyear.com/api/nail-services', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const nailServices = response.data;
    const $tableBody = $('#nailServicesTable tbody');
    
    if (!$tableBody.length) return;

    $tableBody.empty();
    
    if (nailServices.length === 0) {
      $tableBody.html('<tr><td colspan="6" style="text-align: center;">No nail services found. Add your first service!</td></tr>');
      return;
    }
    
    nailServices.forEach(service => {
      const imagePath = service.image_path || 'uploads/default.png';
      const imageUrl = `https://nailcare.ccs4thyear.com/${imagePath}`;
      
      const row = $(`
        <tr>
          <td>${service.id}</td>
          <td>${service.service_name || 'N/A'}</td>
          <td>₱${parseFloat(service.price).toFixed(2)}</td>
          <td>
            <img 
              src="${imageUrl}" 
              alt="${service.service_name}" 
              class="nail-image"
              onerror="this.onerror=null; this.src='https://nailcare.ccs4thyear.com/uploads/default.png';"
            >
          </td>
          <td>${service.created_at ? new Date(service.created_at).toLocaleString() : 'N/A'}</td>
          <td>
            <button class="action-btn edit-btn" onclick="editNailService(${service.id})">Edit</button>
            <button class="action-btn delete-btn" data-id="${service.id}">Delete</button>
          </td>
        </tr>
      `);
      $tableBody.append(row);
    });
    
  } catch (err) {
    console.error('Error loading nail services:', err);
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('authToken');
      alert('Session expired. Please login again.');
      window.location.href = 'login.html';
      return;
    }
    const $tableBody = $('#nailServicesTable tbody');
    if ($tableBody.length) {
      const errorMessage = err.response && err.response.data && err.response.data.error 
        ? err.response.data.error 
        : err.message;
      $tableBody.html(`<tr><td colspan="6" style="text-align: center; color: red;">Error loading nail services: ${errorMessage}</td></tr>`);
    }
  }
}

// Search Functionality
$(document).ready(function() {
  const $searchInput = $('#searchInput');
  if ($searchInput.length) {
    $searchInput.on('input', function() {
      const searchTerm = $(this).val().toLowerCase();
      const $rows = $('#nailServicesTable tbody tr');
      
      $rows.each(function() {
        const $row = $(this);
        if ($row.find('td').length < 3) return;
        
        const name = $row.find('td').eq(1).text().toLowerCase() || '';
        const price = $row.find('td').eq(2).text().toLowerCase() || '';
        
        $row.toggle(name.includes(searchTerm) || price.includes(searchTerm));
      });
    });
  }
});

// Edit nail service function
function editNailService(id) {
  window.location.href = `edit_nail_service.html?id=${id}`;
}