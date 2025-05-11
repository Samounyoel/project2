// Load user data from localStorage
function loadProfile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
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
  if(profile.linkedinLink)
  {
    document.getElementById('profile-linkedinLink').value = profile.linkedinLink;
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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.profilePicture = e.target.result;
      localStorage.setItem('user', JSON.stringify(user));
    };
    reader.readAsDataURL(file);
  }
};

// Save profile info
document.getElementById('profile-form').onsubmit = function(e) {
  e.preventDefault();
  const age = document.getElementById('age').value;
  const linkedinLink = document.getElementById('linkedinLink').value;
  const weatherApi = document.getElementById('weather-api').checked;
  const stockApi = document.getElementById('stock-api').checked;
  // Save to userProfile in localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  user.firstName = document.getElementById('first-name').value;
  user.lastName = document.getElementById('last-name').value;
  user.about = document.getElementById('about').value;
  user.linkedinLink = document.getElementById('linkedinLink').value;
  localStorage.setItem('user', JSON.stringify(user));
  const profile = {
    age: age,
    weatherApi: weatherApi,
    stockApi: stockApi,
    email: user.email,
    linkedinLink : linkedinLink,
    about: user.about
  };
  localStorage.setItem('userProfile', JSON.stringify(profile));
  const selectedAPIs = [];
  if (weatherApi) selectedAPIs.push('weather');
  if (stockApi) selectedAPIs.push('stock');
  localStorage.setItem('selectedAPIs', JSON.stringify(selectedAPIs));

  // Update the USERS array in localStorage
  let users = JSON.parse(localStorage.getItem('USERS') || '[]');
  const userIndex = users.findIndex(u => u.userId === user.userId);
  if (userIndex !== -1) {
    users[userIndex].firstName = user.firstName;
    users[userIndex].lastName = user.lastName;
    users[userIndex].profilePicture = user.profilePicture;
    users[userIndex].about = user.about;
    users[userIndex].linkedinLink = user.linkedinLink;

    localStorage.setItem('USERS', JSON.stringify(users));
  } else {
    // This case should ideally not happen if user was registered properly
    // but as a fallback, if the user is not in USERS, add them.
    // This might occur if USERS array was cleared or an old 'user' item exists without a corresponding USERS entry.
    users.push(user);
    localStorage.setItem('USERS', JSON.stringify(users));
  }

  if (localStorage.getItem('isNewUser') === 'true') {
    localStorage.removeItem('isNewUser');
    document.getElementById('age').value = '';
    document.getElementById('about').value = '';
    document.getElementById('linkedinLink').value = '';
  }

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
  document.getElementById('linkedinLink').value = existingProfile.linkedinLink || '';

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
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = loggedInUser.email || 'User';
  $('#nav-user-name').text(loggedInUser.firstName ? loggedInUser.firstName : userEmail); // Display first name if available
  if(loggedInUser.profilePicture) {
    $('#nav-user-pic').attr('src', loggedInUser.profilePicture); // Assuming you have an img tag with id nav-user-pic
  }
  
  // Logout functionality
  $('#logout-btn').on('click', function() {
        localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('selectedAPIs');
    // Do not remove 'isNewUser' here, it's handled on profile save
    window.location.href = 'login.html';
  });
};