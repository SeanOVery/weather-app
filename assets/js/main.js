const searchBtn = document.querySelector('.search-btn'),
  inputEl = document.querySelector('#city-search'),
  weatherTodayConatiner = document.querySelector('.weather-today'),
  resultsContainer = document.querySelector('.results-container'),
  forecastContainer = document.querySelector('.weather-forecast'),
  recentSearchesContainer = document.querySelector('.search-history-list'),
  apiKey = '35d13417d0c1faaaddc8386417eb0ec6'

let cityData = {},
  recentSearchesArr = [],
  cityLat,
  cityLon

const init = () => {
  let storedCities = JSON.parse(localStorage.getItem('cities'))

  if (storedCities !== null) {
    recentSearchesArr = storedCities
    displayRecentSearches()
  }
}

const storeCities = (str) => {
  if (!(recentSearchesArr.includes(str)) && recentSearchesArr.length === 5) {
    recentSearchesArr.shift()
    recentSearchesArr.push(str)
  } else if (!(recentSearchesArr.includes(str))) {
    recentSearchesArr.push(str)
  }
  localStorage.setItem('cities', JSON.stringify(recentSearchesArr))
}

const getAndShowData = () => {
  let cityName = trimAndCapitalizeCity(inputEl.value),
  latLonUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`

  storeCities(cityName)

  while (weatherTodayConatiner.firstChild) {
    weatherTodayConatiner.removeChild(weatherTodayConatiner.firstChild)
  }
  while (forecastContainer.firstChild) {
    forecastContainer.removeChild(forecastContainer.firstChild)
  }
  while (recentSearchesContainer.firstChild) {
    recentSearchesContainer.removeChild(recentSearchesContainer.firstChild)
  }

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

const trimAndCapitalizeCity = (str) => {
  let strTrim = str.trim().toLowerCase()
  return strTrim.charAt(0).toUpperCase() + strTrim.slice(1)
}

const fromLatLong = () => {
  let mainCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&units=imperial&exclude=minutely,hourly,alerts&appid=${apiKey}`

  fetch(mainCallUrl)
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      cityData = data
      displayToday()
      displayForecast()
      displayRecentSearches()
    })
}

const displayToday = () => {
  const newDiv1 = document.createElement('div'),
    newDiv2 = document.createElement('div'),
    newDiv3 = document.createElement('div'),
    newDiv4 = document.createElement('div'),
    newDiv5 = document.createElement('div'),
    newIcon = document.createElement('img')

  resultsContainer.classList.remove('hide')
  newIcon.setAttribute('src', `http://openweathermap.org/img/wn/${cityData.current.weather[0].icon}.png`)
  newIcon.setAttribute('alt', cityData.current.weather[0].main)
  newDiv1.classList.add('city-today')
  newDiv1.textContent = `${trimAndCapitalizeCity(inputEl.value)} ${moment.unix(cityData.current.dt, 'X').format('MM/DD/YYYY')}`
  newDiv2.textContent = `Temperature: ${cityData.current.temp.toFixed()} °F`
  newDiv3.textContent = `Wind: ${cityData.current.wind_speed.toFixed(1)} MPH`
  newDiv4.textContent = `Humidity: ${cityData.current.humidity.toFixed()}%`
  newDiv5.textContent = `UV Index: ${cityData.current.uvi.toFixed(1)}`

  newDiv1.append(newIcon)
  weatherTodayConatiner.append(newDiv1, newDiv2, newDiv3, newDiv4, newDiv5)
}

const displayForecast = () => {
  for (let i = 1; i < 6; i++) {

    const newDivContainer = document.createElement('div'),
      newDiv1 = document.createElement('div'),
      newDiv2 = document.createElement('div'),
      newDiv3 = document.createElement('div'),
      newDiv4 = document.createElement('div'),
      newDiv5 = document.createElement('div'),
      newIcon = document.createElement('img')

    newDivContainer.classList.add('forecast-card')
    newIcon.setAttribute('src', `http://openweathermap.org/img/wn/${cityData.daily[i].weather[0].icon}@2x.png`)
    newIcon.setAttribute('alt', cityData.daily[i].weather[0].main)
    newDiv1.textContent = moment.unix(cityData.daily[i].dt).format('MM/DD/YYYY')
    newDiv3.textContent = `Temperature: ${cityData.daily[i].temp.day.toFixed()} °F`
    newDiv4.textContent = `Wind: ${cityData.daily[i].wind_speed.toFixed(1)} MPH`
    newDiv5.textContent = `Humidity: ${cityData.daily[i].humidity.toFixed()}%`

    newDiv2.append(newIcon)
    newDivContainer.append(newDiv1, newDiv2, newDiv3, newDiv4, newDiv5)
    forecastContainer.append(newDivContainer)

  }
}

const displayRecentSearches = () => {
  for (let i = 0; i < recentSearchesArr.length; i++) {
    const newLi = document.createElement('li'),
      newButton = document.createElement('button')

    newButton.classList.add('search-item-btn')
    newButton.textContent = recentSearchesArr[i]
    newButton.addEventListener('click', () => {
      inputEl.value = newButton.textContent
      getAndShowData()
    })

    newLi.append(newButton)
    recentSearchesContainer.append(newLi)
  }
}

init()

searchBtn.addEventListener('click', getAndShowData)
