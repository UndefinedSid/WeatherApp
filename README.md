# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a vanilla JavaScript weather application that fetches real-time weather data from the OpenWeatherMap API. The app provides a clean, responsive interface for users to search for weather information by city name.

## Architecture

The project follows a simple client-side architecture:

- **`index.html`**: Main HTML structure with search input and weather display sections
- **`main.css`**: Styling with background image overlay, responsive design, and weather-themed UI
- **`main.js`**: Core JavaScript functionality handling API calls, DOM manipulation, and user interactions

### Key Components

**API Integration**: Uses OpenWeatherMap API with the endpoint `https://api.openweathermap.org/data/2.5/weather`
- API key is hardcoded in `main.js` (line 2)
- Fetches weather data in metric units
- Handles invalid city errors with user feedback

**User Interface**:
- Search functionality triggered by Enter key press
- Dynamic content updates for location, temperature, weather conditions, and date
- Error handling displays validation messages for invalid cities

**Data Flow**:
1. User enters city name and presses Enter
2. `setQuery()` captures keypress event
3. `getResults()` makes API call with city query
4. `displayResults()` updates DOM with weather data
5. `dateBuilder()` formats current date display

## Development Commands

### Running the Application
```bash
# Serve the application locally (using Python's built-in server)
python3 -m http.server 8000
# Then open http://localhost:8000 in browser

# Alternative using Node.js live-server (if installed globally)
npx live-server
```

### Development Workflow
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit"

# Check git status
git status

# View recent changes
git diff

# Stage and commit changes
git add -A
git commit -m "Description of changes"
```

### Testing the Application
```bash
# Test API connectivity (replace with actual city)
curl "https://api.openweathermap.org/data/2.5/weather?q=London&units=metric&APPID=fcc8de7015bbb202209bbf0261babf4c"

# Validate HTML structure
# (No specific validation command configured)
```

## Important Implementation Notes

**API Key Security**: The OpenWeatherMap API key is currently hardcoded in `main.js`. For production deployment, this should be moved to environment variables or a secure configuration system.

**Missing Assets**: The CSS references `bg.jpg` for background image, but this file is not present in the repository. The application will work without it but may not display the intended visual design.

**Error Handling**: The application includes basic error handling for invalid city names (HTTP status code ≠ 200) and displays user-friendly error messages.

**Browser Compatibility**: Uses modern JavaScript features like arrow functions, template literals, and fetch API. Requires modern browser support (ES6+).

## File Structure Context

```
weather project/
├── index.html          # Main HTML structure
├── main.css           # Styling and layout
├── main.js            # JavaScript functionality and API integration
└── WARP.md           # This file
```

The project is currently not committed to git (all files show as untracked), indicating it's in initial development phase.
