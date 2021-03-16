// OpenWeather API key: c0d1389376180ead6ac004e04a7cce56
// PositionStack API key: 948c242b419708ce2ee096640a68ff69

// DOM elements:
const searchBoxEl = $('#search-box');
const searchButtonEl = $('#search-button');
const searchHistoryEl = $('#search-history');
const currentWeatherEl = $('#current-weather');

// API URLs:
const weatherApi = 'https://api.openweathermap.org/data/2.5/onecall?appid=c0d1389376180ead6ac004e04a7cce56&exclude=minutely,hourly,alerts&units=imperial';
const positionStackApi = 'http://api.positionstack.com/v1/forward?access_key=948c242b419708ce2ee096640a68ff69&query=';

// Global variables:
var historyList=[];

// Functions:
function getCity() {
    let searchCity = searchBoxEl.val();
    searchBoxEl.val('');
    storeHistory(searchCity);
    fetchCoords(searchCity);
}

function fetchCoords(city) {
    let coordsUrl = positionStackApi + city;
    fetch(coordsUrl)
    .then(response => response.json())
    .then(data => {
    fetchWeather(data.data[0].latitude, data.data[0].longitude, city);
    });
}

function fetchWeather(lat, lon, city) {
    let weatherUrl = weatherApi + `&lat=${lat}&lon=${lon}`;

    fetch(weatherUrl)
    .then(response => response.json())
    .then(data => {
    writeWeather(data, city);
    });
}

function writeWeather(data,city) {
    currentWeatherEl.html('');
    let date = moment(data.current.dt).format('(MM/DD/YYYY)');
    let icon = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}.png`
    currentWeatherEl.append($('<h2>Current Weather:</h2>'));
    currentWeatherEl.append($(`<h3>${city} ${date} <img src='${icon}'></img></h2>`));
    currentWeatherEl.append($(`<h4>Temperature: ${data.current.temp} °F</h4>`));
    currentWeatherEl.append($(`<h4>Humidity: ${data.current.humidity}%</h4>`));
    currentWeatherEl.append($(`<h4>Wind Speed: ${data.current.wind_speed} MPH</h4>`));
    let indexText = $('<h4>UV Index: </h4>');
    let indexBox = $(`<span>${data.current.uvi}</span>`);
    if (data.current.uvi <= 2) {
        indexBox.css('background-color', 'green');
    } else if (data.current.uvi <= 5) {
        indexBox.css('background-color', 'yellow');
    } else if (data.current.uvi <= 7) {
        indexBox.css('background-color', 'orange');
    } else {
        indexBox.css('background-color', 'red');
    }
    indexText.append(indexBox);
    currentWeatherEl.append(indexText);
    currentWeatherEl.append($('<h2>5-Day forecast:</h2>'));
    let forecastContainer = $('<div class="row justify-content-around"></div>');
    for (let i = 0; i < 5; i++) {
        let dayCard = $('<div class="card col-2 bg-info text-light"></div>');
        let forecast = data.daily[i];
        let forecastDate = moment(forecast.dt).format('(MM/DD/YYYY)');
        dayCard.append($(`<h4>${forecastDate}</h4>`));
        let forecastIcon = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`
        dayCard.append($(`<p><img src=${forecastIcon}></img></p>`));
        dayCard.append($(`<p>Temp: ${forecast.temp.day} °F<p>`));
        dayCard.append($(`<p>Humidty: ${forecast.humidity}%<p>`));
        forecastContainer.append(dayCard);
    }
    currentWeatherEl.append(forecastContainer);
}

function storeHistory(city) {
    if ($.inArray(city, historyList) === -1) {
        historyList.push(city);
        localStorage.setItem('searchHistory',JSON.stringify(historyList));
        writeHistory();
    }
}

function writeHistory() {
    searchHistoryEl.html('');
    for (let i = 0; i < historyList.length; i++) {
        let newEntry = $(`<div class="card history col-12">${historyList[i]}</div>`);
        searchHistoryEl.append(newEntry);
    }
}

// Event Listeners:
searchButtonEl.on('click', getCity);
searchBoxEl.on('keyup', function(event) {
    if (event.keyCode === 13) {
        getCity();
    }
})
$(document).on('click','.history',function(event){
    let city = $(event.target).text();
    fetchCoords(city);
})


// TODO: 
// Fix date parsing
// Load localstorage search history on load
// Update CSS 