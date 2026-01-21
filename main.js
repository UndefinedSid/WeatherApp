// ==========================================
// Weather Dashboard Application
// ==========================================

// Demo Mode Flag - Set to true to use mock data (for testing/troubleshooting network issues)
const DEMO_MODE = true; // Change to false to use real OpenWeatherMap API

// API Configuration
const API_CONFIG = {
  key: "fcc8de7015bbb202209bbf0261babf4c",
  baseUrl: "https://api.openweathermap.org/data/2.5/",
  forecastUrl: "https://api.openweathermap.org/data/2.5/forecast",
  geoUrl: "https://api.openweathermap.org/geo/1.0/direct"
};

// Mock data for demo mode
const MOCK_WEATHER = {
  "London": {
    current: {
      name: "London",
      sys: { country: "GB" },
      main: {
        temp: 8,
        feels_like: 5,
        temp_min: 6,
        temp_max: 10,
        humidity: 72,
        pressure: 1013
      },
      weather: [{ main: "Cloudy" }],
      wind: { speed: 5.2 }
    },
    forecast: {
      list: [
        { dt: Math.floor(Date.now() / 1000) + 86400, main: { temp: 9, temp_min: 3, temp_max: 14 }, weather: [{ main: "Rainy" }] },
        { dt: Math.floor(Date.now() / 1000) + 172800, main: { temp: 7, temp_min: 2, temp_max: 12 }, weather: [{ main: "Cloudy" }] },
        { dt: Math.floor(Date.now() / 1000) + 259200, main: { temp: 10, temp_min: 5, temp_max: 16 }, weather: [{ main: "Sunny" }] },
        { dt: Math.floor(Date.now() / 1000) + 345600, main: { temp: 11, temp_min: 6, temp_max: 17 }, weather: [{ main: "Clear" }] },
        { dt: Math.floor(Date.now() / 1000) + 432000, main: { temp: 9, temp_min: 4, temp_max: 14 }, weather: [{ main: "Cloudy" }] },
      ]
    }
  },
  "New York": {
    current: {
      name: "New York",
      sys: { country: "US" },
      main: {
        temp: 2,
        feels_like: -3,
        temp_min: 0,
        temp_max: 4,
        humidity: 65,
        pressure: 1018
      },
      weather: [{ main: "Sunny" }],
      wind: { speed: 4.1 }
    },
    forecast: {
      list: [
        { dt: Math.floor(Date.now() / 1000) + 86400, main: { temp: 3, temp_min: -4, temp_max: 10 }, weather: [{ main: "Sunny" }] },
        { dt: Math.floor(Date.now() / 1000) + 172800, main: { temp: 1, temp_min: -8, temp_max: 5 }, weather: [{ main: "Snowy" }] },
        { dt: Math.floor(Date.now() / 1000) + 259200, main: { temp: 4, temp_min: -2, temp_max: 9 }, weather: [{ main: "Clear" }] },
        { dt: Math.floor(Date.now() / 1000) + 345600, main: { temp: 5, temp_min: -1, temp_max: 11 }, weather: [{ main: "Sunny" }] },
        { dt: Math.floor(Date.now() / 1000) + 432000, main: { temp: 2, temp_min: -5, temp_max: 8 }, weather: [{ main: "Cloudy" }] },
      ]
    }
  },
  "Tokyo": {
    current: {
      name: "Tokyo",
      sys: { country: "JP" },
      main: {
        temp: 5,
        feels_like: 2,
        temp_min: 3,
        temp_max: 7,
        humidity: 55,
        pressure: 1025
      },
      weather: [{ main: "Clear" }],
      wind: { speed: 3.5 }
    },
    forecast: {
      list: [
        { dt: Math.floor(Date.now() / 1000) + 86400, main: { temp: 6, temp_min: 0, temp_max: 13 }, weather: [{ main: "Clear" }] },
        { dt: Math.floor(Date.now() / 1000) + 172800, main: { temp: 4, temp_min: -2, temp_max: 10 }, weather: [{ main: "Cloudy" }] },
        { dt: Math.floor(Date.now() / 1000) + 259200, main: { temp: 7, temp_min: 1, temp_max: 14 }, weather: [{ main: "Sunny" }] },
        { dt: Math.floor(Date.now() / 1000) + 345600, main: { temp: 8, temp_min: 2, temp_max: 15 }, weather: [{ main: "Clear" }] },
        { dt: Math.floor(Date.now() / 1000) + 432000, main: { temp: 5, temp_min: -1, temp_max: 11 }, weather: [{ main: "Rainy" }] },
      ]
    }
  }
};

// App State
const appState = {
  unit: 'metric', // metric for Celsius, imperial for Fahrenheit
  currentWeather: null,
  forecast: null,
  recentSearches: [],
};

// DOM Elements - will be queried on demand
function getDOMElements() {
  return {
    searchBox: document.querySelector('.search-box'),
    searchBtn: document.querySelector('.search-btn'),
    loadingEl: document.querySelector('.loading'),
    errorEl: document.querySelector('.error-message'),
    unitBtns: document.querySelectorAll('.unit-btn'),
    forecastContainer: document.querySelector('.forecast-container'),
    recentListEl: document.querySelector('.recent-list'),
  };
}

// ==========================================
// LOCAL STORAGE MANAGEMENT
// ==========================================

const localStorage_Keys = {
  PREFERENCES: 'weatherApp_preferences',
  RECENT_SEARCHES: 'weatherApp_recentSearches',
};

function savePreferences() {
  const preferences = {
    unit: appState.unit,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(localStorage_Keys.PREFERENCES, JSON.stringify(preferences));
}

function loadPreferences() {
  const saved = localStorage.getItem(localStorage_Keys.PREFERENCES);
  if (saved) {
    try {
      const preferences = JSON.parse(saved);
      appState.unit = preferences.unit || 'metric';
      updateUnitUI();
    } catch (e) {
      console.error('Error loading preferences:', e);
    }
  }
}

function saveRecentSearches() {
  localStorage.setItem(
    localStorage_Keys.RECENT_SEARCHES,
    JSON.stringify(appState.recentSearches)
  );
}

function loadRecentSearches() {
  const saved = localStorage.getItem(localStorage_Keys.RECENT_SEARCHES);
  if (saved) {
    try {
      appState.recentSearches = JSON.parse(saved);
      renderRecentSearches();
    } catch (e) {
      console.error('Error loading recent searches:', e);
    }
  }
}

function addToRecentSearches(city) {
  // Remove duplicates and keep only the city name
  const cityName = typeof city === 'string' ? city : city;
  appState.recentSearches = appState.recentSearches.filter(
    item => item.toLowerCase() !== cityName.toLowerCase()
  );

  // Add to beginning
  appState.recentSearches.unshift(cityName);

  // Keep only last 10 searches
  appState.recentSearches = appState.recentSearches.slice(0, 10);

  saveRecentSearches();
  renderRecentSearches();
}

// ==========================================
// UI STATE MANAGEMENT
// ==========================================

function showLoading() {
  const { loadingEl, errorEl } = getDOMElements();
  if (loadingEl) loadingEl.classList.remove('hidden');
  if (errorEl) errorEl.classList.add('hidden');
}

function hideLoading() {
  const { loadingEl } = getDOMElements();
  if (loadingEl) loadingEl.classList.add('hidden');
}

function showError(message) {
  const { errorEl } = getDOMElements();
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }
  hideLoading();
}

function hideError() {
  const { errorEl } = getDOMElements();
  if (errorEl) errorEl.classList.add('hidden');
}

function updateUnitUI() {
  const { unitBtns } = getDOMElements();
  if (unitBtns && unitBtns.length > 0) {
    unitBtns.forEach(btn => {
      const isSelected = btn.dataset.unit === appState.unit;
      btn.setAttribute('aria-pressed', isSelected);
    });
  }
}

// ==========================================
// TEMPERATURE CONVERSION
// ==========================================

function convertTemp(celsius) {
  if (appState.unit === 'metric') {
    return celsius;
  }
  // Convert Celsius to Fahrenheit: (C × 9/5) + 32
  return (celsius * 9/5) + 32;
}

// ==========================================
// WEATHER ICON MAPPING
// ==========================================

function getWeatherIcon(description) {
  const desc = description.toLowerCase();

  if (desc.includes('clear') || desc.includes('sunny')) return '☀️';
  if (desc.includes('cloud')) return '☁️';
  if (desc.includes('rain') || desc.includes('drizzle')) return '🌧️';
  if (desc.includes('thunderstorm')) return '⛈️';
  if (desc.includes('snow')) return '❄️';
  if (desc.includes('mist') || desc.includes('fog')) return '🌫️';
  if (desc.includes('wind')) return '💨';

  return '🌤️';
}

// ==========================================
// DATE FORMATTING
// ==========================================

function formatDate(date) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getDayName(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// ==========================================
// API CALLS
// ==========================================

async function fetchWeatherData(city) {
  try {
    showLoading();
    hideError();

    console.log('Fetching weather for:', city);

    // Demo mode - use mock data
    if (DEMO_MODE) {
      console.log('Using DEMO_MODE');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      // List available cities for debugging
      console.log('Available cities in MOCK_WEATHER:', Object.keys(MOCK_WEATHER));
      
      const mockCity = Object.keys(MOCK_WEATHER).find(
        key => key.toLowerCase() === city.toLowerCase().trim()
      );
      
      console.log('Matching city found:', mockCity);
      
      if (!mockCity) {
        console.error('City not found. Available:', Object.keys(MOCK_WEATHER).join(', '));
        showError(`❌ City not found in demo data. Try: ${Object.keys(MOCK_WEATHER).join(', ')}`);
        hideLoading();
        return;
      }
      
      const mockData = MOCK_WEATHER[mockCity];
      console.log('Mock data for', mockCity, ':', mockData);
      
      if (!mockData.current || !mockData.forecast) {
        console.error('Mock data incomplete for', mockCity);
        showError('❌ Error: Incomplete mock data');
        hideLoading();
        return;
      }
      
      appState.currentWeather = mockData.current;
      appState.forecast = mockData.forecast;
      addToRecentSearches(mockData.current.name);
      
      console.log('App state updated:', appState);
      
      hideLoading();
      displayWeather();
      displayForecast();
      return;
    }

    const units = appState.unit === 'metric' ? 'metric' : 'imperial';
    
    // Build URLs directly (avoid using baseUrl to prevent caching issues)
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${units}&appid=${API_CONFIG.key}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=${units}&appid=${API_CONFIG.key}`;

    console.log('Fetching from OpenWeatherMap API for:', city);

    // Fetch current weather with timeout
    const weatherController = new AbortController();
    const weatherTimeoutId = setTimeout(() => weatherController.abort(), 15000);

    let weatherResponse;
    try {
      weatherResponse = await fetch(weatherUrl, {
        signal: weatherController.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });
    } catch (err) {
      clearTimeout(weatherTimeoutId);
      console.error('Fetch failed:', err);
      throw err;
    }

    clearTimeout(weatherTimeoutId);

    if (!weatherResponse.ok) {
      if (weatherResponse.status === 404) {
        showError('❌ City not found. Please enter a valid city name.');
      } else if (weatherResponse.status === 401) {
        showError('❌ Invalid API key. Please enable DEMO_MODE for testing.');
      } else {
        showError(`❌ API Error: ${weatherResponse.status}. Try enabling DEMO_MODE.`);
      }
      hideLoading();
      return;
    }

    const weatherData = await weatherResponse.json();
    
    if (!weatherData.name) {
      showError('❌ Invalid response from API.');
      hideLoading();
      return;
    }

    appState.currentWeather = weatherData;

    // Fetch forecast data
    const forecastController = new AbortController();
    const forecastTimeoutId = setTimeout(() => forecastController.abort(), 15000);

    try {
      const forecastResponse = await fetch(forecastUrl, {
        signal: forecastController.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });

      clearTimeout(forecastTimeoutId);

      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json();
        appState.forecast = forecastData;
      }
    } catch (forecastError) {
      console.warn('Forecast fetch failed:', forecastError);
      clearTimeout(forecastTimeoutId);
    }

    addToRecentSearches(weatherData.name);
    hideLoading();
    displayWeather();
    displayForecast();

  } catch (error) {
    console.error('Fetch error details:', {
      name: error.name,
      message: error.message,
    });
    
    if (error.name === 'AbortError') {
      showError('❌ Request timeout. Try enabling DEMO_MODE or check your connection.');
    } else if (error instanceof TypeError) {
      showError('❌ Network error. Check your connection or try enabling DEMO_MODE in the code.');
    } else {
      showError('❌ Unable to fetch weather data. Try enabling DEMO_MODE.');
    }
    hideLoading();
  }
}

// ==========================================
// DISPLAY FUNCTIONS
// ==========================================

function displayWeather() {
  if (!appState.currentWeather) {
    console.error('No weather data to display');
    return;
  }

  const weather = appState.currentWeather;
  const unitSymbol = appState.unit === 'metric' ? '°C' : '°F';

  // Helper function to safely update elements
  const updateElement = (selector, content) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = content;
  };

  try {
    // Update location
    updateElement('.location .city', `${weather.name}, ${weather.sys.country}`);
    updateElement('.location .date', formatDate(new Date()));

    // Update current weather - Convert temperature
    const temp = Math.round(convertTemp(weather.main.temp));
    updateElement('.temp-value', temp);
    updateElement('.current .unit', unitSymbol);

    // Update weather description and icon
    const weatherDesc = weather.weather[0].main;
    updateElement('.current .weather', weatherDesc);
    updateElement('.weather-icon', getWeatherIcon(weatherDesc));

    // Update high/low temps - Convert temperatures
    const tempMin = Math.round(convertTemp(weather.main.temp_min));
    const tempMax = Math.round(convertTemp(weather.main.temp_max));
    updateElement('.hi-low', `${tempMin}${unitSymbol} / ${tempMax}${unitSymbol}`);

    // Update additional info
    const feelsLike = Math.round(convertTemp(weather.main.feels_like));
    updateElement('.feels-like', `${feelsLike}${unitSymbol}`);
    updateElement('.humidity', `${weather.main.humidity}%`);

    const windSpeed = appState.unit === 'metric' 
      ? `${Math.round(weather.wind.speed)} m/s`
      : `${Math.round(weather.wind.speed * 2.237)} mph`;
    updateElement('.wind', windSpeed);

    updateElement('.pressure', `${weather.main.pressure} hPa`);

    console.log('Weather displayed successfully for:', weather.name);
  } catch (error) {
    console.error('Error displaying weather:', error);
  }
}

function displayForecast() {
  if (!appState.forecast) {
    console.warn('No forecast data available');
    return;
  }

  const { forecastContainer } = getDOMElements();
  if (!forecastContainer) {
    console.error('Forecast container not found');
    return;
  }

  // Clear previous forecast cards
  forecastContainer.innerHTML = '';
  console.log('Forecast container cleared');

  const forecasts = appState.forecast.list;
  const dailyForecasts = {};

  // Group forecasts by day (one forecast per day at noon)
  forecasts.forEach(forecast => {
    const date = new Date(forecast.dt * 1000);
    const day = date.toLocaleDateString();

    // Keep forecast closest to noon for each day
    if (!dailyForecasts[day] ||
      Math.abs(date.getHours() - 12) < Math.abs(new Date(dailyForecasts[day].dt * 1000).getHours() - 12)) {
      dailyForecasts[day] = forecast;
    }
  });

  // Get first 5 days
  const forecastDays = Object.values(dailyForecasts).slice(0, 5);
  console.log('Forecast days to display:', forecastDays.length);

  forecastDays.forEach(forecast => {
    const date = new Date(forecast.dt * 1000);
    const temp = Math.round(convertTemp(forecast.main.temp));
    
    // Get min/max, with fallback logic
    let tempMin = forecast.main.temp_min !== undefined ? forecast.main.temp_min : forecast.main.temp;
    let tempMax = forecast.main.temp_max !== undefined ? forecast.main.temp_max : forecast.main.temp;
    
    tempMin = Math.round(convertTemp(tempMin));
    tempMax = Math.round(convertTemp(tempMax));
    
    const unitSymbol = appState.unit === 'metric' ? '°C' : '°F';
    const icon = getWeatherIcon(forecast.weather[0].main);
    const description = forecast.weather[0].main;

    // Format date: "Mon, Jan 22"
    const dayName = getDayName(date);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    console.log(`Forecast: ${description} - Temp: ${temp}${unitSymbol}, Low: ${tempMin}${unitSymbol}, High: ${tempMax}${unitSymbol}`);

    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.role = 'listitem';
    card.innerHTML = `
      <div class="forecast-day">${dayName}, ${dateStr}</div>
      <div class="forecast-icon">${icon}</div>
      <div class="forecast-temp">${temp}${unitSymbol}</div>
      <div class="forecast-temps-label">Low / High</div>
      <div class="forecast-minmax">
        <span class="temp-low">${tempMin}${unitSymbol}</span> / <span class="temp-high">${tempMax}${unitSymbol}</span>
      </div>
      <div class="forecast-desc">${description}</div>
    `;

    card.addEventListener('click', () => {
      // Scroll to current weather on mobile
      document.querySelector('.current-weather').scrollIntoView({ behavior: 'smooth' });
    });

    forecastContainer.appendChild(card);
  });

  console.log('Forecast cards rendered successfully');
}

function renderRecentSearches() {
  const { recentListEl } = getDOMElements();
  if (!recentListEl) return;

  recentListEl.innerHTML = '';

  if (appState.recentSearches.length === 0) {
    recentListEl.innerHTML = '<p style="color: rgba(255,255,255,0.7); font-size: 14px;">No recent searches yet</p>';
    return;
  }

  appState.recentSearches.forEach(city => {
    const item = document.createElement('button');
    item.className = 'recent-item';
    item.role = 'listitem';
    item.textContent = city;
    item.addEventListener('click', () => {
      const { searchBox } = getDOMElements();
      if (searchBox) searchBox.value = city;
      fetchWeatherData(city);
    });
    recentListEl.appendChild(item);
  });
}

function attachEventListeners() {
  const { searchBox, searchBtn, unitBtns } = getDOMElements();

  // Search functionality - Enter key
  if (searchBox) {
    searchBox.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const city = searchBox.value.trim();
        console.log('Enter pressed, city:', city);
        if (city) {
          fetchWeatherData(city);
        }
      }
    });
  }

  // Search functionality - Button click
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const { searchBox: currentSearchBox } = getDOMElements();
      if (currentSearchBox) {
        const city = currentSearchBox.value.trim();
        console.log('Search button clicked, city:', city);
        if (city) {
          fetchWeatherData(city);
        }
      }
    });
  }

  // Unit toggle
  if (unitBtns && unitBtns.length > 0) {
    unitBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const unitValue = btn.dataset.unit;
        console.log('Unit toggled to:', unitValue);
        appState.unit = unitValue === 'celsius' ? 'metric' : 'imperial';
        savePreferences();
        updateUnitUI();
        
        // Re-fetch if weather data exists
        if (appState.currentWeather) {
          showLoading();
          setTimeout(() => {
            displayWeather();
            displayForecast();
            hideLoading();
          }, 300);
        }
      });
    });
  }
}
  
  // ==========================================

function init() {
  console.log('Initializing app...');
  loadPreferences();
  loadRecentSearches();
  attachEventListeners();

  // Optional: Load default city
  const defaultCity = 'London';
  if (appState.recentSearches.length === 0) {
    console.log('Loading default city:', defaultCity);
    fetchWeatherData(defaultCity);
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
