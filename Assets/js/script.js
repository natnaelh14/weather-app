//Search Button Event Listeners
$("#target").submit(function (e) {
  e.preventDefault();
  let cityName = $("#search-input").val();
  $("#search-input").val("");
  processWeatherData(cityName);
});

function processWeatherData(cityName) {
  // Current Weather API
  let requestUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&appid=104b6fe9ca5b072de45a0aa905980598&units=imperial";
  fetch(requestUrl)
    .then(function (response) {
      if (response.status !== 200) {
        $("#city-name").text("Please enter valid input");
          return;
      } else {
        return response.json();
      }
    })
    .then(function (data) {
      $("#city-name").text(
        data.name + " " + moment(new Date()).format("MM/DD/YYYY")
      );
      $("#img-big-icon").remove();
      if (data.main.temp < 60) {
        $("#icon-big").prepend(
          $("<img>", { id: "img-big-icon", src: "./cloudy.png" })
        );
      } else if (data.main.temp > 80) {
        $("#icon-big").prepend(
          $("<img>", { id: "img-big-icon", src: "./bright.png" })
        );
      } else {
        $("#icon-big").prepend(
          $("<img>", { id: "img-big-icon", src: "./partly-bright.png" })
        );
      }
      //Adding Current Weather data to respective html element
      $("#today-temp").text("Temp: " + Math.floor(data.main.temp) + "°F");
      $("#today-wind").text("Wind: " + Math.floor(data.wind.speed) + " MPH");
      $("#today-humidity").text(
        "Humidity: " + Math.floor(data.main.humidity) + "%"
      );
      let cityPick = data.name;
      function createStorage() {
        //Storing users search history in local storage
        if (!Object.values(localStorage).includes(cityPick)) {
          localStorage.setItem(localStorage.length, cityPick);
          let create = $("<button>");
          //Adding CSS classes for dynamically appended button element
          create.attr(
            "class",
            "list-group-item list-group-item-action search-btn"
          );
          create.attr("type", "button");
          create.text(cityPick);
          $(".recent-search").prepend(create);
        }
      }
      createStorage();
      //Adding API to get UV Index information using the lan & lon from user's city name input.
      let lat = data.coord.lat;
      let lon = data.coord.lon;
      let requestUrlTwo =
        "https://api.openweathermap.org/data/2.5/onecall?lat=" +
        lat +
        "&lon=" +
        lon +
        "&appid=104b6fe9ca5b072de45a0aa905980598&units=imperial";
      fetch(requestUrlTwo)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          $("#today-uv").text("UV Index: " + data.current.uvi);
        });
    });
  //Third API to add 5 days forecast
  let requestUrlThree =
    "http://api.openweathermap.org/data/2.5/forecast?q=" +
    cityName +
    "&appid=104b6fe9ca5b072de45a0aa905980598&units=imperial";
  fetch(requestUrlThree)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var weatherDataTotal = {};
      var dataList = data.list;
      var dateList = [];
      for (let i = 0; i < dataList.length; i++) {
        var date = new Date(dataList[i].dt_txt).getDate();
        if (!dateList.includes(date)) dateList.push(date);
        if (!weatherDataTotal[date]) {
          weatherDataTotal[date] = {
            date: formatDate(dataList[i].dt_txt),
            temp: dataList[i].main.temp,
            wind: dataList[i].wind.speed,
            humidity: dataList[i].main.humidity,
            count: 1,
          };
        } else {
          weatherDataTotal[date].temp += dataList[i].main.temp;
          weatherDataTotal[date].wind += dataList[i].wind.speed;
          weatherDataTotal[date].humidity += dataList[i].main.humidity;
          weatherDataTotal[date].count++;
        }
      }
      function formatDate(dateString) {
        var date = new Date(dateString);
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var year = date.getFullYear();
        return month + "/" + day + "/" + year;
      }
      //Since the API is 3 hour increments, I am averaging it out per day.
      function getAverageData(date) {
        var data = weatherDataTotal[date];
        data.temp = data.temp / data.count;
        data.wind = data.wind / data.count;
        data.humidity = data.humidity / data.count;
        return data;
      }
      $("#img-icon").remove();
      //Loop through the function (getAverageData()) an append it the html.

      let i = 0;
      let limit = 5;
      let counter = 0;
      $(".img-icon").remove();
      while (i < limit) {
        let dataObject;
        var currentDate = new Date().getDate();
        var validDate = dateList[i] !== currentDate;
        if (validDate) {
          dataObject = getAverageData(dateList[i]);
          $("#time-" + counter).text(dataObject.date);
          if (dataObject.temp < 60) {
            $("#icon-" + counter).prepend(
              $("<img>", { class: "img-icon", src: "./cloudy.png" })
            );
          } else if (dataObject.temp > 80) {
            $("#icon-" + counter).prepend(
              $("<img>", { class: "img-icon", src: "./bright.png" })
            );
          } else {
            $("#icon-" + counter).prepend(
              $("<img>", { class: "img-icon", src: "./partly-bright.png" })
            );
          }
          $("#temp-" + counter).text(
            "Temp: " + Math.floor(dataObject.temp) + "°F"
          );
          $("#wind-" + counter).text(
            "Wind: " + Math.floor(dataObject.wind) + " MPH"
          );
          $("#humidity-" + counter).text(
            "Hum: " + Math.floor(dataObject.humidity) + "%"
          );
          counter++;
        } else {
          limit++;
        }
        i++;
      }
    });
}
function searchHistory() {
  for (let i = 0; i < localStorage.length; i++) {
    let create = $("<button>");
    create.attr("class", "list-group-item list-group-item-action search-btn");
    create.attr("type", "button");
    create.text(localStorage.getItem(i));
    $(".recent-search").prepend(create);
  }
}
//Clear search history
searchHistory();
$(".clear-history").click(function () {
  localStorage.clear();
  location.reload();
});
//Enabling city search by clicking the history
$(".search-btn").click(function (event) {
  let recentCity = $(event.target).text();
  processWeatherData(recentCity);
});
