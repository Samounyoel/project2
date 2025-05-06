// Load user data from localStorage
function loadProfile() {
  const user = JSON.parse(localStorage.getItem('currentUSER') || '{}');
  if (user.firstName)
  {
    document.getElementById('first-name').value = user.firstName;
  }
  if (user.lastName) {
    document.getElementById('last-name').value = user.lastName;
  }
  if (user.email) {
    document.getElementById('email').value = user.email;
  }
  if (user.profilePicture) 
  {
    document.getElementById('profile-img').src = user.profilePicture;
  }
  if (user.about)
  {
    document.getElementById('about').value = user.about;
  }
  
  // Age and API preferences (if previously set)
  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  if (profile.age)
  {
    document.getElementById('age').value = profile.age;
  }  
  document.getElementById('weather-api').checked = !!profile.weatherApi;
  document.getElementById('stock-api').checked = !!profile.stockApi;
}

// Image upload and preview
const imgInput = document.getElementById('img-upload');
const imgBtn = document.getElementById('update-img-btn');
const imgPreview = document.getElementById('profile-img');

imgBtn.onclick = function() {
  imgInput.click();
};
imgInput.onchange = function() {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imgPreview.src = e.target.result;
      // Save to currentUSER in localStorage
      const user = JSON.parse(localStorage.getItem('currentUSER') || '{}');
      user.profilePicture = e.target.result;
      localStorage.setItem('currentUSER', JSON.stringify(user));
    };
    reader.readAsDataURL(file);
  }
};

// Save profile info
document.getElementById('profile-form').onsubmit = function(e) {
  e.preventDefault();
  const age = document.getElementById('age').value;
  const weatherApi = document.getElementById('weather-api').checked;
  const stockApi = document.getElementById('stock-api').checked;
  // Save to userProfile in localStorage
  const user = JSON.parse(localStorage.getItem('currentUSER') || '{}');
  user.firstName = document.getElementById('first-name').value;
  user.lastName = document.getElementById('last-name').value;
  user.about = document.getElementById('about').value;
  localStorage.setItem('currentUSER', JSON.stringify(user));
  const profile = {
    age: age,
    weatherApi: weatherApi,
    stockApi: stockApi,
    email: user.email,
    about: user.about
  };
  localStorage.setItem('userProfile', JSON.stringify(profile));
  const selectedAPIs = [];
  if (weatherApi) selectedAPIs.push('weather');
  if (stockApi) selectedAPIs.push('stock');
  localStorage.setItem('selectedAPIs', JSON.stringify(selectedAPIs));
  alert('Profile saved!');
  window.location.href = "home.html"; // Redirect to home after save
};

// Load existing profile data on page load
const existingProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
if (existingProfile) {
  document.getElementById('first-name').value = existingProfile.firstName || '';
  document.getElementById('last-name').value = existingProfile.lastName || '';
  document.getElementById('age').value = existingProfile.age || '';
  document.getElementById('email').value = existingProfile.email || '';
  document.getElementById('about').value = existingProfile.about || '';
}

// Load existing API selections
const selectedAPIs = JSON.parse(localStorage.getItem('selectedAPIs') || '[]');
selectedAPIs.forEach(api => {
  document.getElementById(`${api}-api`).checked = true;
});

// Load profile on page load
window.onload = function() {
  loadProfile();
  
  // Set navigation bar details
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const userEmail = userProfile.email || 'User';
  $('#nav-user-name').text(userEmail);
  
  // Logout functionality
  $('#logout-btn').on('click', function() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
  });
};