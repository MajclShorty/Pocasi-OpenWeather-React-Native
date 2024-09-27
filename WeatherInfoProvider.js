import { WeatherInfo } from "./WeatherInfo";

const API_KEY = "8b6ee035704291d8b8d8ddd37cdb265d"; // "váš_API_klíč";

export const GetCurrentWeatherInfo = async (latitude, longitude) => {
    const requestUrl = CreateRequestUrl(latitude, longitude);

    return await fetch(requestUrl)
        .then((result) => result.json())
        .then((result) => {
            return new WeatherInfo(
                result.main.temp,
                result.main.pressure,
                result.main.humidity,
                CreateImageUrl(result.weather[0].icon)
            );
        });
};

const CreateRequestUrl = (latitude, longitude) => {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
};

export const CreateImageUrl = (imageCode) => {
    return `https://openweathermap.org/img/w/${imageCode}.png`;
};
