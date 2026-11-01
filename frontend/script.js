const cityInput = document.getElementById("cityInput");
const error = document.getElementById("error");

async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        error.textContent = "Please enter a city name.";
        return;
    }

    error.textContent = "";

    try {

        // Step 1: Find city coordinates
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        const geoData = await geoResponse.json();

        if (!geoData.results) {
            error.textContent = "City not found.";
            return;
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Step 2: Get weather
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`
        );

        const weatherData = await weatherResponse.json();

        displayWeather(location, weatherData);

    } catch (err) {

        error.textContent = "Something went wrong. Please try again.";

        console.log(err);
    }
}


function displayWeather(location, data) {

    const current = data.current;

    document.getElementById("cityName").textContent =
        `${location.name}, ${location.country}`;

    document.getElementById("temperature").textContent =
        `${Math.round(current.temperature_2m)}°C`;

    document.getElementById("feelsLike").textContent =
        `${Math.round(current.apparent_temperature)}°C`;

    document.getElementById("humidity").textContent =
        `${current.relative_humidity_2m}%`;

    document.getElementById("wind").textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;

    document.getElementById("condition").textContent =
        getWeatherDescription(current.weather_code);

    document.getElementById("weatherIcon").textContent =
        getWeatherIcon(current.weather_code);

    displayForecast(data.daily);
}


function displayForecast(daily) {

    const forecast = document.getElementById("forecast");

    forecast.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {

        const date = new Date(daily.time[i]);

        const day = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const card = document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `
            <h3>${day}</h3>

            <div class="icon">
                ${getWeatherIcon(daily.weather_code[i])}
            </div>

            <p>
                ${Math.round(daily.temperature_2m_max[i])}°C
            </p>

            <p>
                ${Math.round(daily.temperature_2m_min[i])}°C
            </p>

            <small>
                ${getWeatherDescription(daily.weather_code[i])}
            </small>
        `;

        forecast.appendChild(card);
    }
}


function getWeatherDescription(code) {

    const weather = {
        0: "Clear Sky",
        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Foggy",
        51: "Light Drizzle",
        53: "Drizzle",
        55: "Heavy Drizzle",
        61: "Light Rain",
        63: "Rain",
        65: "Heavy Rain",
        71: "Light Snow",
        73: "Snow",
        75: "Heavy Snow",
        80: "Rain Showers",
        81: "Rain Showers",
        82: "Heavy Rain Showers",
        95: "Thunderstorm",
        96: "Thunderstorm",
        99: "Thunderstorm"
    };

    return weather[code] || "Unknown";
}


function getWeatherIcon(code) {

    if (code === 0) return "☀️";
    if (code <= 3) return "🌤️";
    if (code <= 48) return "🌫️";
    if (code <= 55) return "🌦️";
    if (code <= 65) return "🌧️";
    if (code <= 75) return "❄️";
    if (code <= 82) return "🌧️";
    if (code >= 95) return "⛈️";

    return "🌤️";
}


// Press Enter to search
cityInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        getWeather();
    }

});


async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        error.textContent = "Please enter a city name";
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:3000/api/weather?city=${encodeURIComponent(city)}`
        );

        const data = await response.json();

        if (!response.ok) {
            error.textContent = data.message;
            return;
        }

        console.log(data);

        displayWeather(
            {
                name: data.city,
                country: data.country
            },
            data.weather
        );

    } catch (err) {

        console.log(err);
        error.textContent = "Backend server is not running";
    }
}