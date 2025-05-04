function loadNavbar() {
  var user = JSON.parse(localStorage.getItem('currentUSER') || '{}');
  document.getElementById('nav-user-name').textContent = (user.firstName || '') + ' ' + (user.lastName || '');
  document.getElementById('nav-profile-img').src = user.profilePicture || '../pics/defaultPic.jpeg';
}

function loadProfileInfo() {
  var user = JSON.parse(localStorage.getItem('currentUSER') || '{}');
  var profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  var apis = [];
  if (profile.weatherApi) apis.push('Weather (Open-Meteo)');
  if (profile.stockApi) apis.push('Stock Market (Alpha Vantage)');

  var weatherSection = '';
  if (profile.weatherApi) {
    weatherSection = '<div id="weather-section"><strong>Weather in Ashdod, Israel:</strong> <span id="weather-info">Loading...</span></div>';
  }

  var stockSection = '';
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
        var weather = data.current_weather;
        document.getElementById('weather-info').textContent =
          weather ? weather.temperature + '°C' : 'Unavailable';
      })
      .catch(function() {
        document.getElementById('weather-info').textContent = 'Unavailable';
      });
  }

  if (profile.stockApi) {
    var apiKey = 'M5G24M5GCXG3UBTV';
    var symbols = [
      { symbol: 'GOOGL', name: 'Google' },
      { symbol: 'META', name: 'Meta' },
      { symbol: 'TSLA', name: 'Tesla' },
      { symbol: 'FB', name: 'Facebook' }
    ];
    Promise.all(symbols.map(function(stock) {
      return fetch('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + stock.symbol + '&apikey=' + apiKey)
        .then(function(res) { return res.json(); })
        .then(function(data) {
          var quote = data['Global Quote'];
          return {
            symbol: stock.symbol,
            name: stock.name,
            price: quote ? quote['05. price'] : null,
            change: quote ? quote['09. change'] : null,
            percent: quote ? quote['10. change percent'] : null
          };
        });
    })).then(function(stocks) {
      var validStocks = stocks.filter(function(s) { return s.price !== null; });
      if (validStocks.length) {
        var table = '<table style="width:100%;margin-top:10px;border-collapse:collapse;">' +
          '<tr>' +
            '<th style="text-align:left;padding:4px;">Symbol</th>' +
            '<th style="text-align:left;padding:4px;">Name</th>' +
            '<th style="text-align:left;padding:4px;">Price</th>' +
            '<th style="text-align:left;padding:4px;">Change</th>' +
            '<th style="text-align:left;padding:4px;">Change %</th>' +
          '</tr>' +
          validStocks.map(function(stock) {
            return '<tr>' +
              '<td style="padding:4px;">' + stock.symbol + '</td>' +
              '<td style="padding:4px;">' + stock.name + '</td>' +
              '<td style="padding:4px;">$' + stock.price + '</td>' +
              '<td style="padding:4px;color:' + (parseFloat(stock.change) >= 0 ? 'green' : 'red') + ';">' + stock.change + '</td>' +
              '<td style="padding:4px;color:' + (stock.percent && parseFloat(stock.percent) >= 0 ? 'green' : 'red') + ';">' + (stock.percent || '') + '</td>' +
            '</tr>';
          }).join('') +
        '</table>';
        document.getElementById('stock-info').innerHTML = table;
      } else {
        document.getElementById('stock-info').textContent = 'No data available.';
      }
    }).catch(function() {
      document.getElementById('stock-info').textContent = 'Unavailable';
    });
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