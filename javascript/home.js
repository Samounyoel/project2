function loadNavbar() {
  const user = JSON.parse(localStorage.getItem('currentUSER') || '{}');
  document.getElementById('nav-user-name').textContent = (user.firstName || '') + ' ' + (user.lastName || '');
  document.getElementById('nav-profile-img').src = user.profilePicture || '../pics/defaultPic.jpeg';
}

function loadProfileInfo() {
  const user = JSON.parse(localStorage.getItem('currentUSER') || '{}');
  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const apis = [];
  if (profile.weatherApi) apis.push('Weather (Open-Meteo)');
  if (profile.stockApi) apis.push('Stock Market (Financial Modeling Prep)');

  let weatherSection = '';
  if (profile.weatherApi) {
    weatherSection = `<div id="weather-section"><strong>Weather in Ashdod, Israel:</strong> <span id="weather-info">Loading...</span></div>`;
  }

  document.getElementById('profile-info').innerHTML = `
    <div class="profile-image-section">
      <img src="${user.profilePicture || '../pics/defaultPic.jpeg'}" alt="Profile Image" width="100">
    </div>
    <div class="profile-details">
      <p><strong>First Name:</strong> ${user.firstName || ''}</p>
      <p><strong>Last Name:</strong> ${user.lastName || ''}</p>
      <p><strong>Age:</strong> ${profile.age || ''}</p>
      <p><strong>Email:</strong> ${user.email || ''}</p>
      <div class="api-selection">
        <strong>Selected APIs:</strong>
        <ul>
          ${apis.length ? apis.map(api => `<li>${api}</li>`).join('') : '<li>None</li>'}
        </ul>
      </div>
      ${weatherSection}
    </div>
  `;

  if (profile.weatherApi) {
    // Ashdod, Israel coordinates: lat=31.8014, lon=34.6436
    fetch('https://api.open-meteo.com/v1/forecast?latitude=31.8014&longitude=34.6436&current_weather=true')
      .then(res => res.json())
      .then(data => {
        const weather = data.current_weather;
        document.getElementById('weather-info').textContent =
          weather ? `${weather.temperature}°C, ${weather.weathercode === 0 ? 'Clear' : 'See Open-Meteo docs for code ' + weather.weathercode}` : 'Unavailable';
      })
      .catch(() => {
        document.getElementById('weather-info').textContent = 'Unavailable';
      });
  }
}

document.getElementById('logout-btn').addEventListener('click', function() {
  localStorage.removeItem('currentUSER');
  window.location.href = 'login.html';
});

window.addEventListener('DOMContentLoaded', () => {
  loadNavbar();
  loadProfileInfo();
}); 