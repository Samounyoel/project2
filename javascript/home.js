
AOS.init();
$(window).on('scroll', function() {
  const scrollTop = $(window).scrollTop();
  const windowHeight = $(window).height();
  const documentHeight = $(document).height();

  if (scrollTop + windowHeight >= documentHeight - 10) {
    $('.footer').removeClass('hidden').addClass('visible');
  } else {
    $('.footer').removeClass('visible').addClass('hidden');
  }
});



$(document).ready(function() {
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const elements = document.querySelectorAll('.scroll-reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  });
  elements.forEach(el => observer.observe(el));

  // Update navbar with user info
  $('#nav-profile-img').attr('src', user.profilePicture || '../pics/defaultPic.png');
  $('#nav-user-name').text(`${user.firstName || ''} ${user.lastName || ''}`);

  // Update profile section
  $('#profile-pic').attr('src', user.profilePicture || '../pics/defaultPic.png');
  $('#profile-name').text(`${user.firstName || ''} ${user.lastName || ''}`);
  $('#profile-email').text(user.email || '');
  $("#profile-about").text(user.about || '');
  $("#profile-linkedinLink").text(user.linkedinLink || 'Linkedin');
  // Get user profile data
  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const apis = JSON.parse(localStorage.getItem('selectedAPIs') || '[]');

  // Comprehensive profile rendering
  function renderProfileInfo() {
    try {
      const profileInfoHtml = `
        <div class="profile-image-section fade-in">
          <img src="${user.profilePicture || '../pics/defaultPic.png'}" alt="Profile Image" width="100">
        </div>
        <div class="profile-details">
          <p><strong>First Name:</strong> ${user.firstName || 'N/A'}</p>
          <p><strong>Last Name:</strong> ${user.lastName || 'N/A'}</p>
          <p><strong>Age:</strong> ${profile.age || 'N/A'}</p>
          <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
          <div class="api-selection">
            <strong>Selected APIs:</strong>
            <ul>
              ${apis.length ? apis.map(api => `<li>${api}</li>`).join('') : '<li>None</li>'}
            </ul>
          </div>
        </div>
      `;
      animateProfileSection();
      // Use jQuery to set HTML safely
      $('#profile-info').html(profileInfoHtml);
    } catch (error) {
      console.error('Error rendering profile info:', error);
      $('#profile-info').html('<p>Unable to load profile information</p>');
    }
  }

  // Call the rendering function
  renderProfileInfo();

  // Additional profile age display
  if (profile.age) {
    $('#profile-age').text(`${profile.age} years old`);
  }

  // Logout functionality
  $('#logout-btn').click(function() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  });

  // Get selected APIs
  const selectedAPIs = JSON.parse(localStorage.getItem('selectedAPIs') || '[]');

  // Conditionally show/hide sections
  function updateSectionVisibility() {
    $('.weather-container').toggle(selectedAPIs.includes('weather'));
    $('.stock-container').toggle(selectedAPIs.includes('stock'));
  }

  // Call section visibility on page load
  updateSectionVisibility();

  // Weather API configuration - Using Open-Meteo as primary API
  function fetchWeather() {
    // Only fetch if weather API is selected
    if (!selectedAPIs.includes('weather')) {
      console.log('Weather API not selected');
      return;
    }

    console.log('Fetching weather data...');
    $.ajax({
      url: 'https://api.open-meteo.com/v1/forecast?latitude=31.8014&longitude=34.6436&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m&timezone=auto',
      method: 'GET',
      success: function(data) {
        console.log('Weather data received:', data);
        if (data && data.current_weather) {
          const weather = data.current_weather;
          $('.current-time').text(new Date().toLocaleTimeString());
          $('.temp-value').text(Math.round(weather.temperature));
          $('.weather-description').text(getWeatherDescription(weather.weathercode));
          $('.wind-speed').text(`${Math.round(weather.windspeed)} km/h`);
          
          // Get additional data from hourly
          if (data.hourly && data.hourly.time) {
            const currentHour = new Date().getHours();
            const index = data.hourly.time.findIndex(time => new Date(time).getHours() === currentHour);
            if (index !== -1) {
              $('.humidity').text(`${data.hourly.relative_humidity_2m[index]}%`);
              $('.pressure').text(`${Math.round(data.hourly.pressure_msl[index])} hPa`);
            }
          }
          
          const iconClass = getWeatherIconFromCode(weather.weathercode);
          $('.weather-icon i').removeClass().addClass(`fas ${iconClass}`);
          
          // Update 5-day forecast
          if (data.daily && data.daily.time) {
            $('.forecast-items').empty(); // Clear previous forecast
            data.daily.time.slice(1, 5).forEach((date, index) => {
              const formattedDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
              const maxTemp = Math.round(data.daily.temperature_2m_max[index]);
              const minTemp = Math.round(data.daily.temperature_2m_min[index]);
              const weatherCode = data.daily.weathercode[index];
              const forecastIconClass = getWeatherIconFromCode(weatherCode);

              
              const forecastHtml = `
                <div class="forecast-day">
                  <div class="forecast-date">${formattedDate}</div>
                  <div class="forecast-icon"><i class="fas ${forecastIconClass}"></i></div>
                  <div class="forecast-temp">
                    <span class="max-temp">H: ${maxTemp}°</span>
                    <span class="min-temp">L: ${minTemp}°</span>
                  </div>
                </div>
              `;
              $('.forecast-items').append(forecastHtml);
            });
          }
        }
      },
      error: function() {
        $('.weather-description').text('Unable to fetch weather data');
      }
    });
  }

  // Stock Market API configuration
  const STOCK_API_KEY = 'd0bqrf9r01qs9fjiqgtgd0bqrf9r01qs9fjiqgu0'; // Finnhub API key
  const STOCKS = [
    { symbol: 'META', name: 'Meta', elementId: 'stock-meta' },
    { symbol: 'AAPL', name: 'Apple', elementId: 'stock-apple' },
    { symbol: 'MSFT', name: 'Microsoft', elementId: 'stock-microsoft' },
    { symbol: 'AMZN', name: 'Amazon', elementId: 'stock-amazon' }
  ];

  // Stock data caching mechanism
  const StockCache = {
    // Cache storage with expiration
    _cache: {},
    
    // Set cache with expiration (default 15 minutes)
    set: function(symbol, data, expirationMinutes = 15) {
      this._cache[symbol] = {
        data: data,
        timestamp: Date.now(),
        expiration: expirationMinutes * 60 * 1000
      };
    },
    
    // Get cache, checking for expiration
    get: function(symbol) {
      const cached = this._cache[symbol];
      if (!cached) return null;
      
      // Check if cache is expired
      if (Date.now() - cached.timestamp > cached.expiration) {
        delete this._cache[symbol];
        return null;
      }
      
      return cached.data;
    },
    
    // Clear specific or all cache
    clear: function(symbol = null) {
      if (symbol) {
        delete this._cache[symbol];
      } else {
        this._cache = {};
      }
    }
  };

  function fetchStockData() {
    // Only fetch if stock API is selected
    if (!selectedAPIs.includes('stock')) {
      console.log('Stock API not selected');
      return;
    }

    console.log('Starting stock data fetch...');
    
    // Fallback to manual stock prices if API fails
    const manualStockPrices = {
      'META': { price: 301.45, change: -5.22, changePercent: -1.7 },
      'AAPL': { price: 175.23, change: 2.45, changePercent: 1.4 },
      'MSFT': { price: 335.67, change: 3.12, changePercent: 0.9 },
      'AMZN': { price: 145.89, change: -1.76, changePercent: -1.2 }
    };
    
    STOCKS.forEach(stock => {
      console.log(`Attempting to fetch data for ${stock.symbol}...`);
      
      // Check cache first
      const cachedData = StockCache.get(stock.symbol);
      if (cachedData) {
        console.log(`Using cached data for ${stock.symbol}`);
        updateStockElement(stock.symbol, cachedData.price, cachedData.change, cachedData.changePercent);
        return;
      }
      
      // Fetch from Finnhub API
      $.ajax({
        url: `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${STOCK_API_KEY}`,
        method: 'GET',
        dataType: 'json',
        timeout: 10000,
        success: function(response) {
          console.log(`Finnhub data for ${stock.symbol}:`, response);
          
          if (response && response.c) {
            const price = parseFloat(response.c);
            const previousClose = parseFloat(response.pc);
            const change = parseFloat(response.d || 0);
            const changePercent = parseFloat(response.dp || 0);
            
            // Cache the stock data
            StockCache.set(stock.symbol, { price, change, changePercent });
            
            // Update UI
            updateStockElement(stock.symbol, price, change, changePercent);
          } else {
            console.warn(`Invalid data for ${stock.symbol}`);
            const manualData = manualStockPrices[stock.symbol];
            if (manualData) {
              updateStockElement(stock.symbol, manualData.price, manualData.change, manualData.changePercent);
            } else {
              updateStockElementWithError(stock.symbol, 'Unavailable', 'Data Error');
            }
          }
        },
        error: function(xhr, status, error) {
          console.error(`Finnhub API Error for ${stock.symbol}:`, {
            status: status,
            error: error,
            response: xhr.responseText
          });
          
          // Fallback to manual prices
          const manualData = manualStockPrices[stock.symbol];
          if (manualData) {
            console.warn(`Using manual data for ${stock.symbol}`);
            updateStockElement(stock.symbol, manualData.price, manualData.change, manualData.changePercent);
          } else {
            updateStockElementWithError(stock.symbol, 'Network Error', 'Check Connection');
          }
        }
      });
    });
    
    $('#stock-update-time').text(new Date().toLocaleTimeString());
  }
  
  function updateStockElement(symbol, price, change, changePercent) {
    const stockCard = $(`#stock-${symbol.toLowerCase().replace(/[^a-z]/g, '')}`);
    if (stockCard.length) {
      stockCard.find('.price-value').text(`$${price.toFixed(2)}`);
      
      const changeElement = stockCard.find('.price-change');
      changeElement.text(`${change > 0 ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(2)}%)`);
      changeElement.removeClass('positive negative');
      changeElement.addClass(change > 0 ? 'positive' : 'negative');
    } else {
      console.warn(`No stock card found for symbol: ${symbol}`);
      // Dynamically create stock card if not exists
      const newStockCard = `
        <div class="stock-card" data-aos="fade-up" data-aos-delay="1000" data-aos-easing="ease-in-out" id="stock-${symbol.toLowerCase().replace(/[^a-z]/g, '')}">
          <div class="stock-info">
            <div class="stock-name">${symbol}</div>
            <div class="stock-symbol">${symbol}</div>
          </div>
          <div class="stock-price">
            <span class="price-value">$${price.toFixed(2)}</span>
            <span class="price-change ${change > 0 ? 'positive' : 'negative'}">${change > 0 ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(2)}%)</span>
          </div>
        </div>
      `;
      $('.stock-cards').append(newStockCard);
    }
  }
  
  function updateStockElementWithError(symbol, priceText, changeText) {
    const stockElement = $(`#stock-${symbol.toLowerCase()}`);
    if (stockElement.length) {
      stockElement.find('.price-value').text(priceText);
      stockElement.find('.price-change').text(changeText);
    }
  }

  // Helper function for weather description
  function getWeatherDescription(code) {
    const descriptions = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      95: 'Thunderstorm'
    };
    return descriptions[code] || 'Unknown';
  }

  // Helper function for weather icon
  function getWeatherIconFromCode(code) {
    const icons = {
      0: 'fa-sun',
      1: 'fa-cloud-sun',
      2: 'fa-cloud',
      3: 'fa-cloud',
      45: 'fa-smog',
      48: 'fa-smog',
      51: 'fa-cloud-rain',
      53: 'fa-cloud-rain',
      55: 'fa-cloud-rain',
      61: 'fa-cloud-rain',
      63: 'fa-cloud-rain',
      65: 'fa-cloud-rain',
      71: 'fa-snowflake',
      73: 'fa-snowflake',
      75: 'fa-snowflake',
      80: 'fa-cloud-rain',
      81: 'fa-cloud-rain',
      82: 'fa-cloud-rain',
      95: 'fa-bolt'
    };
    return icons[code] || 'fa-cloud';
  }

  // Initial data fetch with error handling
  try {
    console.log('Starting initial data fetch...');
    fetchWeather();
    fetchStockData();
  } catch (error) {
    console.error('Initial data fetch error:', error);
  }

  // Update weather every 5 minutes
  setInterval(fetchWeather, 300000);

  // Update stocks every 5 minutes
  setInterval(fetchStockData, 300000);

  // Manual refresh for stocks
  $('.stock-refresh i').click(function() {
    console.log('Manual refresh triggered');
    fetchStockData();
    $(this).addClass('rotate');
    setTimeout(() => $(this).removeClass('rotate'), 1000);
  });

  // Add smooth transitions for updates
  $('.temperature, .weather-description, .detail-item span, .price-value, .price-change').css('transition', 'all 0.3s ease');
});

function getWeatherIcon(code) {
  if (code === 0) return '<span style="color: gold;">☀️</span>';
  if (code === 1 || code === 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code === 51 || code === 53 || code === 55) return "🌦️";
  if (code === 61 || code === 63 || code === 65) return "🌧️";
  if (code === 71 || code === 73 || code === 75) return "❄️";
  if (code === 80 || code === 81 || code === 82) return "🌦️";
  if (code === 95) return "⛈️";
  return "❓";
}

function loadNavbar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log(user)
  document.getElementById('nav-user-name').textContent = (user.firstName || '') + ' ' + (user.lastName || '');
  document.getElementById('nav-profile-img').src = user.profilePicture || '../pics/defaultPic.png';
}

function loadProfileInfo() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
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
      '<img src="' + (user.profilePicture || '../pics/defaultPic.png') + '" alt="Profile Image" width="100">' +
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
        if (weather) {
          const icon = getWeatherIcon(weather.weathercode);
          
            document.getElementById('weather-info').innerHTML =
              icon + ' ' + weather.temperature + '°C';

        } else {
          document.getElementById('weather-info').textContent = 'Unavailable';
        }
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
    Promise.all(symbols.map(function(stock) {
      return fetch('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + stock.symbol + '&apikey=' + apiKey)
        .then(function(res) { return res.json(); })
        .then(function(data) {
          const quote = data['Global Quote'];
          if (!quote || !quote['05. price']) {
            return {
              symbol: stock.symbol,
              name: stock.name,
              price: null,
              change: null,
              percent: null
            };
          }
          return {
            symbol: stock.symbol,
            name: stock.name,
            price: quote['05. price'],
            change: quote['09. change'],
            percent: quote['10. change percent']
          };
        }).catch(function() {
          return {
            symbol: stock.symbol,
            name: stock.name,
            price: null,
            change: null,
            percent: null
          };
        });
    })).then(function(stocks) {
      let table = '<table style="width:100%;margin-top:10px;border-collapse:collapse;">' +
        '<tr>' +
          '<th style="text-align:left;padding:4px;">Symbol</th>' +
          '<th style="text-align:left;padding:4px;">Name</th>' +
          '<th style="text-align:left;padding:4px;">Price</th>' +
          '<th style="text-align:left;padding:4px;">Change</th>' +
          '<th style="text-align:left;padding:4px;">Change %</th>' +
        '</tr>' +
        stocks.map(function(stock) {
          if (stock.price === null) {
            return '<tr>' +
              '<td style="padding:4px;">' + stock.symbol + '</td>' +
              '<td style="padding:4px;">' + stock.name + '</td>' +
              '<td colspan="3" style="padding:4px;color:red;">Unavailable or limit reached</td>' +
            '</tr>';
          }
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
    }).catch(function() {
      document.getElementById('stock-info').textContent = 'Unavailable';
    });
  }
}

window.onload = function() {
  loadNavbar();
  loadProfileInfo();
}; 