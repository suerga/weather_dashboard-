// Initialization
// Get search history from local history
var cityList = JSON.parse(localStorage.getItem("city-list"));
// If there is no data the list is empty
if (!cityList) {
    cityList = [];
}
// console.log(cityList);

// Function that returns uv condition based on its value
// Conditions from https://www.epa.gov/sites/production/files/documents/uviguide.pdf 
function uvCondition(value) {
    if (value < 2.5) {
        return "uv-low";
    }
    else if (value < 5.5) {
        return "uv-moderate";
    }
    else if (value < 7.5) {
        return "uv-high";
    }
    else if (value < 10.5) {
        return "uv-vhigh";
    }
    else {
        return "uv-extreme";
    }    
}

// Function to render search history
function renderSearchHistory() {
    // Clear search history area
    $("#search-history").empty();
    // For each city in the list
    $.each(cityList, function(index, city) {
        // Create a list item
        var liEl = $('<li class="search-item">').text(city);
        $("#search-history").append(liEl);
    });
}

// Function to update search history
function updateSearchHistory(cityName) {
    // If the city already exists in the list remove it
    if (cityList.includes(cityName)) {
        cityList.splice(cityList.indexOf(cityName), 1);
    }
    // Add that city to the beginning of the list
    var listLength = cityList.unshift(cityName);
    // If the list has more than 8 remove the oldest one
    if (listLength > 8) {
        cityList.pop();        
    }
    // Store the new list in local storage
    localStorage.setItem("city-list", JSON.stringify(cityList));
    
    // Display search history
    renderSearchHistory();
}

// Function that displays weather for a city
function renderWeather(cityName) {
    // Query URL
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?appid=de67b8db375cf19f0a90a7d7e6edfda6&units=imperial&q=" + cityName;
    // Query
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        // If successful
        console.log(response);
        // Display todays info
        $("#city").text(response.name + " (" + moment().format('l') + ")");
            // Icon of current weather
            var iconEl = $('<img class="weather-icon">').attr("src", "http://openweathermap.org/img/wn/" + response.weather[0].icon + ".png");
            $("#city").append(iconEl);
        $("#temperature").text("Temperature: " + response.main.temp + "\xb0F");
        $("#humidity").text("Humidity: " + response.main.humidity + "%");
        $("#wind-speed").text("Wind speed: " + response.wind.speed + " MPH");
        $("#uv-index").text("UV Index: ");

        // Display 5 day forecast returned by One Call API using lat and lon
        var oneCallURL = "https://api.openweathermap.org/data/2.5/onecall?appid=de67b8db375cf19f0a90a7d7e6edfda6&units=imperial&lat="
        + response.coord.lat + "&lon=" + response.coord.lon;

        // One Call API query
        $.ajax({
            url: oneCallURL,
            method: "GET"
        }).then(function(response) {
            console.log(response);
            // Display the uv index
            var uvEl = $("<span>").text(response.current.uvi);
            // Give it color class based on its value
            uvEl.addClass("uv " + uvCondition(response.current.uvi));
            $("#uv-index").append(uvEl);

            // Display the 5 day forecast
            $(".weather-forecast").attr("style", "display: block");
            // Add the days to the forecast
            // Clear old forecast
            $(".forecast-days").empty(); 
            // For each of the 5 days
            // Start at 1 (tomorrow) instead of 0 (today) 
            for (let i = 1; i < 6; i++) {
                divEl = $('<div class="forecast-day">');
                    // Add a date
                    var dateEl= $("<h3>").text(moment().add(i, 'days').format('l'));
                    divEl.append(dateEl);
                    // Add an icon
                    var iconEl = $('<img>').attr("src", "http://openweathermap.org/img/wn/" + response.daily[i].weather[0].icon + ".png");
                    divEl.append(iconEl);
                    // Add temperature
                    var tempEl = $("<p>").text("Temp: " + response.daily[i].temp.day + "\xb0F");
                    divEl.append(tempEl);
                    // Add humidity
                    var humidityEl = $("<p>").text("Humidity: " + response.daily[i].humidity + "%");
                    divEl.append(humidityEl);
                $(".forecast-days").append(divEl);             
            }
        });


        // Update the search history
        updateSearchHistory(response.name);
    }).catch(function() {
        // If unsuccessful
        // console.log("invalid city");
        // Display error
        $("#city").text("Invalid city name");
        $("#temperature").empty();
        $("#humidity").empty();
        $("#wind-speed").empty();
        $("#uv-index").empty();
        $(".weather-forecast").attr("style", "display: none");
    });
}

// When search button is clicked
$("#search-button").click(function(event) {
    // Prevent form submission from refreshing the page
    event.preventDefault();

    // Get city name from text input
    var userCity = $("#city-name").val();

    // Display the weather for the city
    renderWeather(userCity);
});

// When a city from the search history is clicked
$(document).on("click", ".search-item", function(event) {
    // Prevent any default action
    event.preventDefault();

    // console.log("list item clicked");
    // Get city name
    var userCity = $(this).text();

    // Display the weather for the city
    renderWeather(userCity);
});

// Code flow
renderSearchHistory();