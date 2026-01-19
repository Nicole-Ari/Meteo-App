const wrapper = document.querySelector(".search-area");
const input = document.querySelector(".search-area input");
const searchbtn = document.getElementById("searchbtn");
const cityContainer = document.getElementById("cityContainer");
const settings = document.querySelector(".btn-settings");
const searchContent = document.querySelector("#searchContent");
const switchBtn = document.querySelector(".switch-btn");
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
const d1 = document.getElementById("d1");
const iconTemp = document.querySelector(".iconTemp");
const urlImperial =
  "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m&current=temperature_2m,precipitation,relative_humidity_2m,apparent_temperature,wind_speed_10m&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch";

const cityNames = "https://api.turkiyeapi.dev/v1/provinces";
var cityList = [];
var cityLat = 0;
var cityLong = 0;
var urlMetric = "";
var city = "";
var country = "";
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

fetch(cityNames)
  .then((res) => res.json())
  .then(({ data }) =>
    data.forEach((element) => {
      const p = document.createElement("p");
      p.className = "dropdown-item";
      p.textContent = element.name;
      p.addEventListener("click", (event) => {
        searchContent.value = event.target.textContent;
        getCoordonates(event.target.textContent);
      });
      cityContainer.appendChild(p);
      date.textContent = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }),
  )
  .catch((err) => console.log(err));

getCoordonates = (ct) => {
  city = ct;
  fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${ct}&country_code=TR&count=10&language=en&format=json`,
  )
    .then((response) => response.json())
    .then((data) => {
      country = data.results[0].country;
      cityLat = data.results[0].latitude;
      cityLong = data.results[0].longitude;
    })
    .catch((error) => console.error("Error fetching geocoding data:", error));
};

getWeatherData = (lat, long) => {
  fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&timezone=auto`,
  )
    .then((response) => response.json())
    .then((data) => {
      createCurrentWeather(data);
      createDailyWeather(data);
      createHourlyWeather(data);
    })
    .catch((error) => console.error("Error fetching weather data:", error));
};

createCurrentWeather = (data) => {
  ((cityName.textContent = city),
    (countryName.textContent = country),
    (temperature.textContent = data.current.temperature_2m + " °"),
    (feelsLike.textContent = data.current.apparent_temperature + " °"),
    (humidity.textContent = data.current.relative_humidity_2m + " %"),
    (wind.textContent = data.current.wind_speed_10m + " km/h"),
    (precipitation.textContent = data.current.precipitation + " mm"));
};

createDailyWeather = (data) => {
  document.querySelectorAll(".day").innerHTML = "";
  data.daily.time.forEach((dateStr, index) => {
    const dateObj = new Date(dateStr);
    const dayName = dates[dateObj.getDay()];
    const dayLogName = datesLong[dateObj.getDay()];
    currentDay.textContent = index == 0 ? dayLogName : currentDay.textContent;
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

createDailyData = (index, maxtemp, mintemp, img, day) => {
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

createDays = (data) => {
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

createHourlyWeather = (data) => {
  hourlyData.innerHTML = "";
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
};

createHourlyData = (day, timeStr, deg, img) => {
  /*ne prendre que les données du jour sélectionné */
  if (day == currentDay.textContent.trim()) {
    const dateObje = new Date(timeStr);
    const hours = dateObje.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    const div = document.createElement("div");
    div.className = "item hour";
    div.innerHTML = `<span><img src="${img}" alt="weather icon">${
      hours === 0 ? 12 : hours
    } ${ampm}</span>`;
    div.innerHTML += `<p>${deg}°</p>`;
    hourlyData.appendChild(div);
  }
};

nextHourData = (data) => {
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

defineWeatherIcon = (code) => {
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

searchbtn.addEventListener("click", () => {
  first.forEach((el) => el.classList.add("loading"));
  getWeatherData(cityLat, cityLong);
});

wrapper.addEventListener("focus", () => {
  openDropown();
});

cityContainer.addEventListener("focusout", () => {
  closeDropown();
});

input.addEventListener("mouseleave", () => {
  searchbtn.style.background = "";
});

dropsettings.addEventListener("focusout", () => {
  closeSettings();
});

settings.addEventListener("focus", () => {
  openSettings();
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
  document.querySelector(".dropdown-items").focus();
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
