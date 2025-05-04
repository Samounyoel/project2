// Load user data from localStorage
function loadProfile() {
    const user = JSON.parse(localStorage.getItem('currentUSER') || '{}');
    if (user.firstName) document.getElementById('first-name').value = user.firstName;
    if (user.lastName) document.getElementById('last-name').value = user.lastName;
    if (user.email) document.getElementById('email').value = user.email;
    if (user.profilePicture) document.getElementById('profile-img').src = user.profilePicture;
    // Age and API preferences (if previously set)
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (profile.age) document.getElementById('age').value = profile.age;
    document.getElementById('weather-api').checked = !!profile.weatherApi;
    document.getElementById('stock-api').checked = !!profile.stockApi;
  }
  
  // Image upload and preview
  const imgInput = document.getElementById('img-upload');
  const imgBtn = document.getElementById('update-img-btn');
  const imgPreview = document.getElementById('profile-img');
  
  imgBtn.addEventListener('click', () => imgInput.click());
  imgInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        imgPreview.src = e.target.result;
        // Save to currentUSER in localStorage
        let user = JSON.parse(localStorage.getItem('currentUSER') || '{}');
        user.profilePicture = e.target.result;
        localStorage.setItem('currentUSER', JSON.stringify(user));
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Save profile info
  document.getElementById('profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const age = document.getElementById('age').value;
    const weatherApi = document.getElementById('weather-api').checked;
    const stockApi = document.getElementById('stock-api').checked;
    // Save to userProfile in localStorage
    const user = JSON.parse(localStorage.getItem('currentUSER') || '{}');
    const profile = {
      age,
      weatherApi,
      stockApi,
      email: user.email
    };
    localStorage.setItem('userProfile', JSON.stringify(profile));
    // Also update name fields in currentUSER
    user.firstName = document.getElementById('first-name').value;
    user.lastName = document.getElementById('last-name').value;
    localStorage.setItem('currentUSER', JSON.stringify(user));
    alert('Profile saved!');
    window.location.href = 'home.html'; // Redirect to home after save
  });
  
  // Load profile on page load
  window.addEventListener('DOMContentLoaded', loadProfile);