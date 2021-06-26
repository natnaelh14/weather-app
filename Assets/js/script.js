$("#target").submit(function () {
  let cityName = $("#search-input").val();
  processWeatherData(cityName);
});
function processWeatherData(cityName) {
  let requestUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&appid=104b6fe9ca5b072de45a0aa905980598&units=imperial";
  fetch(requestUrl)
    .then(function (response) {
      return response.json();
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
      $("#today-temp").text("Temp: " + data.main.temp + "°F");
      $("#today-wind").text("Wind: " + data.wind.speed + " MPH");
      $("#today-humidity").text("Humidity: " + data.main.humidity + "%");
      let cityPick = data.name;
      function createStorage() {
        if (!Object.values(localStorage).includes(cityPick)) {
          localStorage.setItem(localStorage.length, cityPick);
          let create = $("<button>");
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
            date: formatData(dataList[i].dt_txt),
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
      function formatData(dateString) {
        var date = new Date(dateString);
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var year = date.getFullYear();
        return month + "/" + day + "/" + year;
      }
      function getAverageData(date) {
        var data = weatherDataTotal[date];
        data.temp = data.temp / data.count;
        data.wind = data.wind / data.count;
        data.humidity = data.humidity / data.count;
        return data;
      }
      $("#img-icon").remove();
      let i = 0;
      let limit = 5;
      let counter = 0;
      $(".img-icon").remove();
      while (i < limit) {
        let dataObject;
        var currentDate = new Date().getDate();
        var validDate = dateList[i] !== currentDate;
        if (validDate) {
          limit++;
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
            "Humidity: " + Math.floor(dataObject.humidity) + "%"
          );
          counter++;
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
searchHistory();
$(".clear-history").click(function () {
  localStorage.clear();
  location.reload();
});
$(".search-btn").click(function (event) {
  let recentCity = $(event.target).text();
  processWeatherData(recentCity);
});
