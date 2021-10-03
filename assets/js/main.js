const searchBtn = document.querySelector('.search-btn'),
  inputEl = document.querySelector('#city-search'),
  weatherTodayConatiner = document.querySelector('.weather-today'),
  resultsContainer = document.querySelector('.results-container'),
  forecastContainer = document.querySelector('.weather-forecast'),
  recentSearchesContainer = document.querySelector('.search-history-list'),
  errorDialogEl = document.querySelector('#dialog'),
  apiKey = '35d13417d0c1faaaddc8386417eb0ec6'

let cityData = {},
  recentSearchesArr = [],
  cityLat,
  cityLon
// variable declaration
const init = () => {
  let storedCities = JSON.parse(localStorage.getItem('cities'))

  if (storedCities !== null) {
    recentSearchesArr = storedCities
    displayRecentSearches()
  }
}// gets previous searches from local storage and shows them on opening page

const storeCities = (str) => {
  if (!(recentSearchesArr.includes(str)) && recentSearchesArr.length === 5) {
    recentSearchesArr.shift()
    recentSearchesArr.push(str)
  } else if (!(recentSearchesArr.includes(str))) {
    recentSearchesArr.push(str)
  }
  localStorage.setItem('cities', JSON.stringify(recentSearchesArr))
} // I set the max recent search items to 5 so this checks if there are already 5 items or is something has already been searched and based on those parameters updates and saves local storage

const trimAndCapitalizeCity = (str) => {
  let strTrim = str.trim().toLowerCase()
  return strTrim.charAt(0).toUpperCase() + strTrim.slice(1)
} // takes in the users input and cuts it up so it can be used in the api

const getAndShowData = () => {
  let cityName = trimAndCapitalizeCity(inputEl.value),
  latLonUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`

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
      if (response.status === 200) {
        storeCities(cityName)
        return response.json();
      } else if (response.status === 404) {
        throw new Error('City not found')
      } else {
        throw new Error('Something went wrong');
      }
    })
    .then((data) => {
      cityLat = data.coord.lat
      cityLon = data.coord.lon
      fromLatLong()
    })
    .catch((error) => {
      errorDialogEl.innerHTML = error
      $('#dialog').dialog({
        height: 100,
        width: 200,
      })
      displayRecentSearches()
    })
} // this is the first api call. The main goal of it is to take the city that was input and convert it to latitude and longitude. It also handles removing the previous search's info with the while loops and throws an error on screen if the user inputs a city that can't be understood and a different error for other possible issues like the openweather api server being down(They said 95% uptime so prob not an issue but who knows)

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
} // this takes the lat and lon from the last function and makes the main call to get all the data and runs major functions.

const displayToday = () => {
  const newDiv1 = document.createElement('div'),
    newDiv2 = document.createElement('div'),
    newDiv3 = document.createElement('div'),
    newDiv4 = document.createElement('div'),
    newDiv5 = document.createElement('div'),
    newIcon = document.createElement('img')
  let uvi = cityData.current.uvi

  resultsContainer.classList.remove('hide')
  newIcon.setAttribute('src', `https://openweathermap.org/img/wn/${cityData.current.weather[0].icon}.png`)
  newIcon.setAttribute('alt', cityData.current.weather[0].main)
  newDiv1.classList.add('city-today')
  newDiv1.textContent = `${trimAndCapitalizeCity(inputEl.value)} ${moment.unix(cityData.current.dt, 'X').format('MM/DD/YYYY')}`
  newDiv2.textContent = `Temperature: ${cityData.current.temp.toFixed()} °F`
  newDiv3.textContent = `Wind: ${cityData.current.wind_speed.toFixed(1)} MPH`
  newDiv4.textContent = `Humidity: ${cityData.current.humidity.toFixed()}%`
  newDiv5.textContent = `UV Index: ${cityData.current.uvi.toFixed(1)}`
  if (uvi <= 2) {
    newDiv5.classList.add('uvilow')
  } else if (uvi <= 5) {
    newDiv5.classList.add('uvimid')
  } else if (uvi <=8) {
    newDiv5.classList.add('uvihigh')
  } else {
    newDiv5.classList.add('uviveryhigh')
  }

  newDiv1.append(newIcon)
  weatherTodayConatiner.append(newDiv1, newDiv2, newDiv3, newDiv4, newDiv5)
} // this function creates and shows the date for today's weather in the today card.

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
    newIcon.setAttribute('src', `https://openweathermap.org/img/wn/${cityData.daily[i].weather[0].icon}@2x.png`)
    newIcon.setAttribute('alt', cityData.daily[i].weather[0].main)
    newDiv1.textContent = moment.unix(cityData.daily[i].dt).format('MM/DD/YYYY')
    newDiv3.textContent = `Temperature: ${cityData.daily[i].temp.day.toFixed()} °F`
    newDiv4.textContent = `Wind: ${cityData.daily[i].wind_speed.toFixed(1)} MPH`
    newDiv5.textContent = `Humidity: ${cityData.daily[i].humidity.toFixed()}%`

    newDiv2.append(newIcon)
    newDivContainer.append(newDiv1, newDiv2, newDiv3, newDiv4, newDiv5)
    forecastContainer.append(newDivContainer)

  }
} // this function creates and displays the forecast data container and the cards within

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
} // this function updates the recent searches bar

init() // run on open

searchBtn.addEventListener('click', getAndShowData) // search button event listener
