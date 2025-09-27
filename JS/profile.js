function toggleProfileDropdown() {
  const dropdown = document.getElementById("profileDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('../PHP/get_user.php', { credentials: 'same-origin' })
    .then(response => response.json())
    .then(data => {
      const dropdown = document.getElementById('profileDropdown');

     if (data.error) {
        
        window.location.href = "../PAGES/login.html";
      }
      
      else {
        dropdown.innerHTML = `
          <p><strong>Logged in as:</strong> ${data.user_type}</p>
          <p><strong>Username:</strong> ${data.username}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <a href="../PAGES/login.html">Logout</a>
        `;
      }
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
      window.location.href = "../PAGES/login.html";
    });
});
