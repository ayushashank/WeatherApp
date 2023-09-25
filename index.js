const API_KEY = "17b753abbd348136159bd210981cbb79";

const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");

const grantAccessContainer = document.querySelector(
  "[data-grantAccessContainer]"
);
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector("[data-loadingPage]");
const userInfoContainer = document.querySelector("[data-infoContainer]");
const errorContainer = document.querySelector("[data-cityNotFound]");
const unexpectedErrorPage = document.querySelector("[data-unexpectedError]");
const searchInput = document.querySelector("[data-searchInput]");

let currTab = userTab;
currTab.classList.add("current-tab");
getfromSessionStorage();

userTab.addEventListener("click", () => {
  switchTab(userTab);
});
searchTab.addEventListener("click", () => {
  switchTab(searchTab);
});

function switchTab(clickedTab) {
  if (clickedTab != currTab) {
    unexpectedErrorPage.classList.remove("active");
    currTab.classList.remove("current-tab");
    currTab = clickedTab;
    currTab.classList.add("current-tab");

    // If search form is invisible then make it visible
    if (!searchForm.classList.contains("active")) {
      unexpectedErrorPage.classList.remove("active");
      errorContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      userInfoContainer.classList.remove("active");
      searchForm.classList.add("active");
    }

    // If search form is visible then go to user-weather info page
    else {
      unexpectedErrorPage.classList.remove("active");
      errorContainer.classList.remove("active");
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");

      // Making the searchBox empty after switching tabs
      searchInput.value = "";

      // Check whether the coordinates of the user are present already in the session or not
      getfromSessionStorage();
    }
  }
}

// To check whether the coordinates are present in local/session storage or not
function getfromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");

  // If coordinates are not present then make the grant access page visible
  if (!localCoordinates) {
    grantAccessContainer.classList.add("active");
  }
  // If coordinates are present then show the weather with those coordinates
  else {
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

// API Call
async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;

  unexpectedErrorPage.classList.remove("active");
  grantAccessContainer.classList.remove("active");
  loadingScreen.classList.add("active");
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();

    unexpectedErrorPage.classList.remove("active");
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (err) {
    loadingScreen.classList.remove("active");
    // Add error page
    unexpectedErrorPage.classList.add("active");
  }
}

// Adding the weather information to the UI
function renderWeatherInfo(weatherInfo) {
  const cityName = document.querySelector("[data-cityName]");
  const countryFlag = document.querySelector("[data-countryFlag]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");

  cityName.innerText = weatherInfo?.name;
  countryFlag.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  desc.innerText = weatherInfo?.weather?.[0]?.description;
  weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temp.innerText = `${weatherInfo?.main?.temp}°C`;
  windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
  humidity.innerText = `${weatherInfo?.main?.humidity}%`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

// Finding the coordinates of the user
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    // Insert an alert
    unexpectedErrorPage.classList.add("active");
  }
}
function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };

  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}

// Searching the coordinates of the input and adding the info to UI
searchForm.addEventListener("submit", (val) => {
  val.preventDefault();
  const cityName = searchInput.value;

  if (cityName === "") {
    return;
  } else {
    fetchSearchWeatherInfo(cityName);
  }
});

async function fetchSearchWeatherInfo(cityName) {
  unexpectedErrorPage.classList.remove("active");
  errorContainer.classList.remove("active");
  userInfoContainer.classList.remove("active");
  grantAccessContainer.classList.remove("active");
  loadingScreen.classList.add("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();

    loadingScreen.classList.remove("active");
    unexpectedErrorPage.classList.remove("active");
    userInfoContainer.classList.add("active");

    if (data?.cod === "404") {
      userInfoContainer.classList.remove("active");
      errorContainer.classList.add("active");
    } else {
      renderWeatherInfo(data);
    }
  } catch (err) {
    // Add an alert
    loadingScreen.classList.remove("active");
    unexpectedErrorPage.classList.add("active");
  }
}
