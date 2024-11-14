const apiKey = 'be4e0a29432e1bcba79bcccf114ff902';
let units = 'metric'; 

function searchWeather() {
    const city = document.getElementById('searchInput').value;
    const suggestions = document.getElementById('suggestions');
    
    if (city) {
        suggestions.style.display = 'none';
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                displayCurrentWeather(data);
                getForecast(city); 
            })
            .catch(error => console.error('Error fetching weather data:', error));
    }
}

function displayCurrentWeather(data) {
    const currentWeatherDiv = document.getElementById('currentWeather');
    currentWeatherDiv.innerHTML = `
        <h2>Current Weather in ${data.name}</h2>
        <p>Temperature: ${data.main.temp}° ${units === 'metric' ? 'C' : 'F'}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} ${units === 'metric' ? 'm/s' : 'mph'}</p>
        <p>Weather: ${data.weather[0].description}</p>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
    `;
    currentWeatherDiv.style.display = 'block';
}

function toggleUnits() {
    units = units === 'metric' ? 'imperial' : 'metric';
    searchWeather(); 
}

function getForecast(city) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => displayForecast(data))
        .catch(error => console.error('Error fetching forecast data:', error));
}

function displayForecast(data) {
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = '<h2>5-Day Forecast</h2>';

    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));

    dailyForecasts.forEach(day => {
        forecastDiv.innerHTML += `
            <div class="forecast-day">
                <h3>${new Date(day.dt_txt).toLocaleDateString()}</h3>
                <p>High: ${day.main.temp_max}° ${units === 'metric' ? 'C' : 'F'}</p>
                <p>Low: ${day.main.temp_min}° ${units === 'metric' ? 'C' : 'F'}</p>
                <p>Weather: ${day.weather[0].description}</p>
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
            </div>
        `;
    });
    forecastDiv.style.display = 'block';
}

function searchWeather() {
    const city = document.getElementById('searchInput').value;
    if (city) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                displayCurrentWeather(data);
                getForecast(city); // Fetch and display forecast
            })
            .catch(error => console.error('Error fetching weather data:', error));
    }
}

function autoSuggest() {
    const query = document.getElementById('searchInput').value;
    const suggestions = document.getElementById('suggestions');
    
    if (query.length > 2) {
        fetch(`https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                if (data.list.length) {
                    suggestions.innerHTML = data.list.map(city => `<p onclick="selectSuggestion('${city.name}')">${city.name}, ${city.sys.country}</p>`).join('');
                    suggestions.style.display = 'block';
                } else {
                    suggestions.style.display = 'none';
                }
            })
            .catch(error => console.error('Error fetching city suggestions:', error));
    } else {
        suggestions.style.display = 'none';
    }
}

function selectSuggestion(city) {
    document.getElementById('searchInput').value = city;
    document.getElementById('suggestions').style.display = 'none';      
    searchWeather();
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    displayCurrentWeather(data);
                    getForecast(`${data.name}`);
                })
                .catch(error => console.error('Error fetching weather data for current location:', error));
        }, error => {
            alert('Unable to retrieve your location. Please check your location settings.');
            console.error('Geolocation error:', error);
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

