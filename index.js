const wrapper = document.querySelector(".search-area");
const container = document.querySelector(".container");
const locations = document.querySelector(".location");
const titles = document.querySelector(".titles");
const errorMessage = document.querySelector(".errorMessage");
const Dropdowncontainer = document.querySelector(".dropdown-container");
const input = document.querySelector(".search-area input");
const searchbtn = document.getElementById("searchbtn");
const cityContainer = document.getElementById("cityContainer");
const settings = document.querySelector(".btn-settings");
const searchContent = document.querySelector("#searchContent");
const switchBtn = document.querySelector(".switch-btn");
const metricModes = document.querySelectorAll(".metric");
const imperialModes = document.querySelectorAll(".imperial");
const mode = document.getElementById("mode");
const popup = document.getElementById("popup");
const dropsettings = document.querySelector(".dropdown-settings");
const days = document.querySelector(".hourOption");
const dropdownDays = document.querySelectorAll(".dropdown-days");
const hourlyData = document.querySelector(".items");
const dropdownDaysItems = document.querySelectorAll(".dropdown-day");
const countryName = document.getElementById("countryName");
const cityName = document.getElementById("cityName");
const date = document.getElementById("date");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const first = document.querySelectorAll("first");
const precipitation = document.getElementById("precipitation");
const dailyDataContainer = document.querySelector(".card");
const currentDay = document.getElementById("currentDay");
const loader = document.getElementById("loaderElement");
const loadingContainer = document.querySelector(".loadingContainer");
const d1 = document.getElementById("d1");
const iconTemp = document.querySelector(".iconTemp");
const cityNames = "https://api.turkiyeapi.dev/v1/provinces";
var cityList = {};
var cityLat = 0;
var cityLong = 0;
var urlMetric = "";
var city = "";
var country = "";
var country_code = "";
var weatherIcon = "";
const dates = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const datesLong = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const codes = {
  clear: 0,
  partlyCloudy: [1, 2],
  overcast: 3,
  fog: [45, 48],
  drizzle: [51, 53, 55],
  rain: [61, 63, 65, 80, 81, 82],
  snow: [71, 73, 75, 77, 85, 86],
  storm: [95, 96, 99],
};

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const date = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });
    getWeatherData(lat, lon, date);
    getCityFromCoords(lat, lon);
  });
}

/* prend la liste des villes */
const getCityNames = (ct) => {
  fetch(ct)
    .then((res) => {
      if (res.status != 200) {
        throw new Error(`HTTP ${res.status}`);
      }
      showItems();

      return res.json();
    })
    .then(({ data }) => {
      showItems();
      cityList = Object.values(data).map((el) => el.name);
      createCityDropdwon(cityList);

      date.textContent = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    })
    .catch((err) => {
      hideItems();
      errorMessage.hidden = false;
    });
};

function showLoader() {
  loader.hidden = false;
}

function hideLoader() {
  loader.hidden = true;
}

function waitData() {
  locations.hidden = true;
  loadingContainer.hidden = false;
}

function dataShow() {
  if (cityName.textContent != "" && countryName.textContent != "") {
    locations.hidden = false;
    loadingContainer.hidden = true;
  }
}

function showItems() {
  titles.hidden = false;
  container.hidden = false;
  errorMessage.hidden = true;
}

function hideItems() {
  titles.hidden = true;
  container.hidden = true;
  errorMessage.hidden = false;
}

showItems();
showLoader();
getCityNames(cityNames);

function getCityFromCoords(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Reverse geocoding failed");
      }
      return response.json();
    })
    .then((data) => {
      const address = data.address;
      country = address.country;
      city = address.province
        ? address.province
        : address.city || address.town || address.village;
      cityName.textContent = city;
      countryName.textContent = country;

      country_code = address.country_code;
      dataShow();
      getCoordonates(city, country_code);
    });
}

const changeMode = () => {
  if (mode.textContent.trim() == "imperial") {
    mode.textContent = " metric";
    document.querySelectorAll(".imperial span").forEach((el) => {
      el.hidden = false;
    });
    document.querySelectorAll(".imperial ").forEach((el) => {
      el.classList.add("active");
    });
    document.querySelectorAll(".metric ").forEach((el) => {
      el.classList.remove("active");
    });
    document.querySelectorAll(".metric span").forEach((el) => {
      el.hidden = true;
    });
  } else {
    mode.textContent = " imperial";
    document.querySelectorAll(".metric span").forEach((el) => {
      el.hidden = false;
    });
    document.querySelectorAll(".metric ").forEach((el) => {
      el.classList.add("active");
    });
    document.querySelectorAll(".imperial ").forEach((el) => {
      el.classList.remove("active");
    });
    document.querySelectorAll(".imperial span").forEach((el) => {
      el.hidden = true;
    });
  }
};

/* Retourne les coordonnées d'une ville*/
const getCoordonates = (ct, country_code) => {
  city = ct;
  fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${ct}&country_code=${country_code}&count=10&language=en&format=json`,
  )
    .then((response) => {
      if (response.status != 200) {
        throw new Error(`HTTP ${response.status}`);
      }
      showItems();
      return response.json();
    })
    .then((data) => {
      country = data.results[0].country;
      cityLat = data.results[0].latitude;
      cityLong = data.results[0].longitude;
    })
    .catch((error) => {
      hideItems();
    });
};

/* Affiche tous les données (Imperial mode) */
const getImperialCurrentWeather = (lat, long, day) => {
  waitData();
  changeMode();
  initialisedData();
  const imp = getLink(lat, long);
  if (searchContent.value.trim() != "Search for a place...") {
    fetch(imp)
      .then((response) => {
        if (response.status != 200) {
          throw new Error(`HTTP ${response.status}`);
        }
        showItems();

        return response.json();
      })
      .then((data) => {
        createCurrentWeather(data);
        createDailyWeather(data, day);
        createHourlyWeather(data, day);
      })
      .catch((error) => {
        hideItems();
      });
  }
};

/* Affiche tous les données (Metric mode)*/
const getWeatherData = (lat, long, day) => {
  waitData();
  const link = getLink(lat, long);
  initialisedData();
  if (searchContent.value.trim() != "Search for a place...") {
    fetch(link)
      .then((response) => {
        if (response.status != 200) {
          throw new Error(`HTTP ${response.status}`);
        }
        showItems();
        return response.json();
      })
      .then((data) => {
        createCurrentWeather(data);
        createDailyWeather(data, day);
        createHourlyWeather(data, day);
      })
      .catch((error) => {
        hideItems();
      });
  }
};

const getLink = (lat, long) => {
  let link = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&timezone=auto&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch`;
  if (mode.textContent.trim() == "imperial") {
    link = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&timezone=auto`;
  }
  return link;
};

const createCityDropdwon = (data) => {
  cityContainer.innerHTML = "";
  if (data.length != 0) {
    data.forEach((element) => {
      const p = document.createElement("p");
      p.className = "dropdown-item";
      p.textContent = element;
      p.addEventListener("click", (event) => {
        searchContent.value = event.target.textContent;
        getCoordonates(event.target.textContent, country_code);
        closeDropown();
      });
      cityContainer.appendChild(p);
    });
    hideLoader();
  } else {
    const p = document.createElement("p");
    p.className = "dropdown-item notFound";
    p.textContent = "No search result found!";
    cityContainer.appendChild(p);
  }
};

// Current Weather
const createCurrentWeather = (data) => {
  cityName.textContent = city;
  countryName.textContent = country;
  temperature.textContent = data.current.temperature_2m + "°";
  feelsLike.textContent = data.current.apparent_temperature + " °";
  humidity.textContent = data.current.relative_humidity_2m + " %";
  wind.textContent =
    data.current.wind_speed_10m +
    `${mode.textContent.trim() == "imperial" ? " km/h" : " mph"}`;
  precipitation.textContent =
    data.current.precipitation +
    `${mode.textContent.trim() == "imperial" ? " mm" : " in"}`;
  dataShow();
};

const initialisedData = () => {
  cityName.textContent = "-";
  countryName.textContent = "-";
  temperature.textContent = "";
  feelsLike.textContent = "-";
  humidity.textContent = "-";
  wind.textContent = "-";
  precipitation.textContent = "-";
  document.querySelectorAll(".day").forEach((el) => (el.innerHTML = ""));
  document.querySelectorAll(".item").forEach((el) => (el.innerHTML = ""));
};

// Daily Weather
const createDailyWeather = (data, day) => {
  document.querySelectorAll(".day").forEach((el) => (el.innerHTML = ""));
  data.daily.time.forEach((dateStr, index) => {
    const dateObj = new Date(dateStr);
    const dayName = dates[dateObj.getDay()];
    const dayLogName = datesLong[dateObj.getDay()];
    if (day != "-") {
      currentDay.textContent = day;
    } else {
      currentDay.textContent = index == 0 ? dayLogName : currentDay.textContent;
    }
    createDays(data.hourly);
    createDailyData(
      index,
      data.daily.temperature_2m_max[index],
      data.daily.temperature_2m_min[index],
      defineWeatherIcon(data.daily.weather_code[index]),
      dayName,
    );
  });
};

const createDailyData = (index, maxtemp, mintemp, img, day) => {
  const image = document.createElement("img");
  image.src = img;
  image.alt = "weather icon";
  image.className = "iconTemp";
  const sousElDiv = document.createElement("div");
  sousElDiv.className = "desc";
  sousElDiv.innerHTML = ` <p class="maxTemp">${maxtemp} °</p> <p class="minTemp">${mintemp} °</p>`;
  const mainDiv = document.querySelector(`.day${index + 1}`);
  mainDiv.innerHTML = `<p id="day${index + 1}">${day}</p>`;
  mainDiv.appendChild(image);
  mainDiv.appendChild(sousElDiv);
};

const createDays = (data) => {
  dropdownDaysItems.forEach((p) => {
    if (currentDay.textContent.trim() === p.textContent.trim()) {
      p.classList.add("active");
      p.onmouseleave = unfocused;
    }
    p.onmousedown = () => {
      currentDay.textContent = p.textContent;
      nextHourData(data);
    };
  });
};

// Hourly weather
const createHourlyWeather = (data, day) => {
  let times = [];
  let newIndex = 0;
  hourlyData.innerHTML = "";
  if (day == "-") {
    data.hourly.time.forEach((timeStr, index) => {
      const dateObj = new Date(timeStr);
      const dayName = datesLong[dateObj.getDay()];
      createHourlyData(
        dayName,
        timeStr,
        data.hourly.temperature_2m[index],
        defineWeatherIcon(data.hourly.weather_code[index]),
      );
    });
  } else {
    if (hourlyData.innerHTML != "") {
      hourlyData.innerHTML == "";
    } else {
      times = data.hourly.time.filter((timeStr) => {
        const dateObje = new Date(timeStr);
        const days = datesLong[dateObje.getDay()];
        return days == day;
      });
      newIndex = data.hourly.time.findIndex((timeStr) => {
        const dateObje = new Date(timeStr);
        const days = datesLong[dateObje.getDay()];
        return days == day;
      });
      times.forEach((timeStr, index) => {
        createHourlyData(
          day,
          timeStr,
          data.hourly.temperature_2m[newIndex + index],
          defineWeatherIcon(data.hourly.weather_code[newIndex + index]),
        );
      });
    }
  }
};

const createHourlyData = (day, timeStr, deg, img) => {
  /*ne prendre que les données du jour sélectionné */
  if (day == currentDay.textContent.trim()) {
    const dateObje = new Date(timeStr);
    const hours = dateObje.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    const div = document.createElement("div");
    div.className = "item hour";
    div.innerHTML = `<span><img src="${img}" alt="weather icon" loading="lazy">${
      hours === 0 ? 12 : hours
    } ${ampm}</span>`;
    div.innerHTML += `<p>${deg}°</p>`;
    hourlyData.appendChild(div);
  }
};

const nextHourData = (data) => {
  hourlyData.innerHTML = "";
  const dayName = currentDay.textContent;
  const dayIndex = datesLong.findIndex((d) => d === dayName);
  data.time.forEach((timeStr, index) => {
    const dateObj = new Date(timeStr);
    const day = dateObj.getDay();

    if (day == dayIndex) {
      createHourlyData(
        datesLong[day],
        timeStr,
        data.temperature_2m[index],
        defineWeatherIcon(data.weather_code[index]),
      );
    }
  });
};

/* Retourne les icones appropriés*/
const defineWeatherIcon = (code) => {
  if (codes.rain.includes(code)) return "assets/images/icon-rain.webp";
  if (code === codes.clear) return "assets/images/icon-sunny.webp";
  if (codes.partlyCloudy.includes(code))
    return "assets/images/icon-partly-cloudy.webp";
  if (codes.drizzle.includes(code)) return "assets/images/icon-drizzle.webp";
  if (codes.storm.includes(code)) return "assets/images/icon-storm.webp";
  if (codes.fog.includes(code)) return "assets/images/icon-fog.webp";
  if (codes.snow.includes(code)) return "assets/images/icon-snow.webp";
  return "assets/images/icon-overcast.webp";
};

const unfocused = () => {
  const day = currentDay.textContent;
  document.querySelector(`.${day}`).classList.remove("active");
};

const onTextChange = (txt) => {
  const citySelected = cityList.filter((el) =>
    el.toLowerCase().includes(txt.toLowerCase()),
  );

  createCityDropdwon(citySelected);
};

const refresh = () => {
  window.location.reload();
};

const observer = new MutationObserver(() => {
  if (currentDay.textContent !== "-") {
    dropdownDaysItems.forEach((el) => {
      el.style.display = "block";
    });

    observer.disconnect();
  }
});

observer.observe(currentDay, {
  childList: true,
  characterData: true,
  subtree: true,
});

cityContainer.addEventListener("focusout", closeDropown);
dropsettings.addEventListener("focusout", closeSettings);
settings.addEventListener("focus", openSettings);

searchbtn.addEventListener("click", () => {
  first.forEach((el) => el.classList.add("loading"));
  const day =
    currentDay.textContent.trim() != "-" ? currentDay.textContent.trim() : "-";
  if (searchContent.value != "") {
    getWeatherData(cityLat, cityLong, day);
  }
});

Dropdowncontainer.addEventListener("focusout", (e) => {
  /*verifie si le nouvel élément focus est toujours dans Dropdowncontainer*/
  if (!Dropdowncontainer.contains(e.relatedTarget)) {
    document.querySelector(".dropdown-items").style.visibility = "hidden";
  }
});

searchContent.addEventListener("focus", () => {
  openDropown();
  if (searchContent.value != "") {
    onTextChange(searchContent.value);
  }
});

searchContent.addEventListener("input", (e) => {
  onTextChange(e.target.value);
});

input.addEventListener("mouseleave", () => {
  searchbtn.style.background = "";
});

switchBtn.addEventListener("click", () => {
  const day =
    currentDay.textContent.trim() != "-" ? currentDay.textContent.trim() : "-";
  getImperialCurrentWeather(cityLat, cityLong, day);
  closeSettings();
});

days.addEventListener("focus", () => {
  openDropdownDays();
  const day = currentDay.textContent.trim();
  document.querySelector(`.${day}`)?.classList.add("active");
});

days.addEventListener("focusout", () => {
  closeDropdownDays();
  document.querySelectorAll(`.dropdown-day`).forEach((el) => {
    el.classList.remove("active");
  });
});

function openDropown() {
  document.querySelector(".dropdown-items").style.visibility = "visible";
}

function closeDropown() {
  document.querySelector(".dropdown-items").style.visibility = "hidden";
}

function openSettings() {
  document.querySelector(".dropdown-settings").style.visibility = "visible";
  document.querySelector(".dropdown-settings").focus();
}

function closeSettings() {
  document.querySelector(".dropdown-settings").style.visibility = "hidden";
}

function openDropdownDays() {
  document.querySelector(".days").style.visibility = "visible";
}

function closeDropdownDays() {
  document.querySelector(".days").style.visibility = "hidden";
}
