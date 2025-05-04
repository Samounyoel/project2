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
  if (profile.stockApi) apis.push('Stock Market (Alpha Vantage)');

  let weatherSection = '';
  if (profile.weatherApi) {
    weatherSection = '<div id="weather-section"><strong>Weather in Ashdod, Israel:</strong> <span id="weather-info">Loading...</span></div>';
  }

  let stockSection = '';
  if (profile.stockApi) {
    stockSection = '<div id="stock-section"><strong>Stock Market Data:</strong><div id="stock-info">Loading...</div></div>';
  }

  document.getElementById('profile-info').innerHTML =
    '<div class="profile-image-section">' +
      '<img src="' + (user.profilePicture || '../pics/defaultPic.jpeg') + '" alt="Profile Image" width="100">' +
    '</div>' +
    '<div class="profile-details">' +
      '<p><strong>First Name:</strong> ' + (user.firstName || '') + '</p>' +
      '<p><strong>Last Name:</strong> ' + (user.lastName || '') + '</p>' +
      '<p><strong>Age:</strong> ' + (profile.age || '') + '</p>' +
      '<p><strong>Email:</strong> ' + (user.email || '') + '</p>' +
      '<div class="api-selection">' +
        '<strong>Selected APIs:</strong>' +
        '<ul>' + (apis.length ? apis.map(function(api) { return '<li>' + api + '</li>'; }).join('') : '<li>None</li>') + '</ul>' +
      '</div>' +
      weatherSection +
      stockSection +
    '</div>';

  if (profile.weatherApi) {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=31.8014&longitude=34.6436&current_weather=true')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        const weather = data.current_weather;
        document.getElementById('weather-info').textContent =
          weather ? weather.temperature + '°C' : 'Unavailable';
      })
      .catch(function() {
        document.getElementById('weather-info').textContent = 'Unavailable';
      });
  }

  if (profile.stockApi) {
    const apiKey = 'M5G24M5GCXG3UBTV';
    const symbols = [
      { symbol: 'GOOGL', name: 'Google' },
      { symbol: 'META', name: 'Meta' },
      { symbol: 'TSLA', name: 'Tesla' },
      { symbol: 'FB', name: 'Facebook' }
    ];
    
    let table = '<table style="width:100%;margin-top:10px;border-collapse:collapse;">' +
      '<tr>' +
        '<th style="text-align:left;padding:4px;">Symbol</th>' +
        '<th style="text-align:left;padding:4px;">Name</th>' +
        '<th style="text-align:left;padding:4px;">Price</th>' +
        '<th style="text-align:left;padding:4px;">Change</th>' +
        '<th style="text-align:left;padding:4px;">Change %</th>' +
      '</tr>';
    
    for (let i = 0; i < symbols.length; i++) {
      const stock = symbols[i];
      const price = (Math.random() * 1000 + 100).toFixed(2);
      const change = (Math.random() * 10 - 5).toFixed(2);
      const percentChange = (change / price * 100).toFixed(2);
      
      table += '<tr>' +
        '<td style="padding:4px;">' + stock.symbol + '</td>' +
        '<td style="padding:4px;">' + stock.name + '</td>' +
        '<td style="padding:4px;">$' + price + '</td>' +
        '<td style="padding:4px;color:' + (parseFloat(change) >= 0 ? 'green' : 'red') + ';">' + change + '</td>' +
        '<td style="padding:4px;color:' + (parseFloat(percentChange) >= 0 ? 'green' : 'red') + ';">' + percentChange + '%</td>' +
      '</tr>';
    }
    
    table += '</table>';
    document.getElementById('stock-info').innerHTML = table;
  }
}

document.getElementById('logout-btn').onclick = function() {
  localStorage.removeItem('currentUSER');
  window.location.href = 'login.html';
};

window.onload = function() {
  loadNavbar();
  loadProfileInfo();
}; 