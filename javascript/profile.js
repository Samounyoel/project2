// Load user data from localStorage
function loadProfile() {
    var user = JSON.parse(localStorage.getItem('currentUSER') || '{}');
    if (user.firstName) document.getElementById('first-name').value = user.firstName;
    if (user.lastName) document.getElementById('last-name').value = user.lastName;
    if (user.email) document.getElementById('email').value = user.email;
    if (user.profilePicture) document.getElementById('profile-img').src = user.profilePicture;
    // Age and API preferences (if previously set)
    var profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (profile.age) document.getElementById('age').value = profile.age;
    document.getElementById('weather-api').checked = !!profile.weatherApi;
    document.getElementById('stock-api').checked = !!profile.stockApi;
  }
  
  // Image upload and preview
  var imgInput = document.getElementById('img-upload');
  var imgBtn = document.getElementById('update-img-btn');
  var imgPreview = document.getElementById('profile-img');
  
  imgBtn.onclick = function() {
    imgInput.click();
  };
  imgInput.onchange = function() {
    var file = this.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function(e) {
        imgPreview.src = e.target.result;
        // Save to currentUSER in localStorage
        var user = JSON.parse(localStorage.getItem('currentUSER') || '{}');
        user.profilePicture = e.target.result;
        localStorage.setItem('currentUSER', JSON.stringify(user));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Save profile info
  document.getElementById('profile-form').onsubmit = function(e) {
    e.preventDefault();
    var age = document.getElementById('age').value;
    var weatherApi = document.getElementById('weather-api').checked;
    var stockApi = document.getElementById('stock-api').checked;
    // Save to userProfile in localStorage
    var user = JSON.parse(localStorage.getItem('currentUSER') || '{}');
    user.firstName = document.getElementById('first-name').value;
    user.lastName = document.getElementById('last-name').value;
    localStorage.setItem('currentUSER', JSON.stringify(user));
    var profile = {
      age: age,
      weatherApi: weatherApi,
      stockApi: stockApi,
      email: user.email
    };
    localStorage.setItem('userProfile', JSON.stringify(profile));
    alert('Profile saved!');
    window.location.href = "home.html"; // Redirect to home after save
  };
  
  // Load profile on page load
  window.onload = loadProfile;