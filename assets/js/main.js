const searchBtn = document.querySelector('.search-btn'),
  inputEl = document.querySelector('#city-search'),
  apiKey = '35d13417d0c1faaaddc8386417eb0ec6'
let cityData = {},
  cityLat,
  cityLon

const getAndShowData = (ev) => {
  ev.preventDefault()
  let cityName = inputEl.value,
    latLonUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
  fetch(latLonUrl)
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      cityLat = data.coord.lat
      cityLon = data.coord.lon
      fromLatLong()
    })
}

const fromLatLong = () => {
  let mainCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&units=imperial&exclude=minutely,hourly,alerts&appid=${apiKey}`
  fetch(mainCallUrl)
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      cityData = data
    })
}

const displayToday = () => {}

searchBtn.addEventListener('click', getAndShowData)
