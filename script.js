$("#target").submit(function (e) {
  e.preventDefault();
  let cityName = $("#search-input").val();
  let requestUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&appid=104b6fe9ca5b072de45a0aa905980598&units=imperial";
  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      $("#city-name").text(data.name);
      $("#today-temp").text("Temp: " + data.main.temp + "°F");
      $("#today-wind").text("Wind: " + data.wind.speed + " MPH");
      $("#today-humidity").text("Humidity: " + data.main.humidity + "%");
    });
  let requestUrlTwo =
    "http://api.openweathermap.org/data/2.5/forecast?q=" +
    cityName +
    "&appid=104b6fe9ca5b072de45a0aa905980598&units=imperial";
  fetch(requestUrlTwo)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
    var weatherDataTotal = {};

    var dataList = data.list;
    for (let i = 0; i < dataList.length; i++) {
        var date = new Date(dataList[i].dt_txt).getDate();
        if(!weatherDataTotal[date]) {
            weatherDataTotal[date] = {
                date: formatData(dataList[i].dt_txt),
                temp: dataList[i].main.temp,
                wind: dataList[i].wind.speed,
                humidity: dataList[i].main.humidity,
                count: 1
            } 
        } else {
            weatherDataTotal[date].temp += dataList[i].main.temp;
            weatherDataTotal[date].wind += dataList[i].wind.speed;
            weatherDataTotal[date].humidity += dataList[i].main.humidity;
            weatherDataTotal[date].count ++;
        }
    }
    function formatData(dateString) {
        var date = new Date(dateString);
        var month = date .getMonth() + 1;
        var day = date .getDate();
        var year = date .getFullYear();
        return month + "/" + day + "/" + year;
    }
    function getAverageData(date) {
        var data =  weatherDataTotal[date];
        data.temp = data.temp/data.count;
        data.wind = data.wind/data.count;
        data.humidity = data.humidity/data.count;
        return data;
    }
    let index = 0;
    for (let i = new Date().getDate() + 1; i <= new Date().getDate() + 5; i++) {
        index++;
        let dataObject;
        dataObject = getAverageData(i);
        $('#time-'+index).text(dataObject.date)
        $('#temp-'+index).text("Temp: " + Math.floor(dataObject.temp) + "°F")
        $('#wind-'+index).text("Wind: " + Math.floor(dataObject.wind) + " MPH")
        $('#humidity-'+index).text("Humidity: " + Math.floor(dataObject.humidity) + "%")
    }
    });
});


