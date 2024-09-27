import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants } from "./Constants";
import { CreateImageUrl } from "./WeatherInfoProvider";
import { WeatherInfo } from "./WeatherInfo";

class Helper {
    SaveWeatherInfo = async (weatherInfo) => {
        try {
            await AsyncStorage.setItem(
                Constants.TEMPERATURE,
                weatherInfo.temperature.toString()
            );
            await AsyncStorage.setItem(
                Constants.HUMIDITY,
                weatherInfo.humidity.toString()
            );
            await AsyncStorage.setItem(
                Constants.PRESSURE,
                weatherInfo.pressure.toString()
            );
            await AsyncStorage.setItem(
                Constants.IMAGE_URL,
                weatherInfo.imageUrl.toString()
            );

            let now = new Date();
            now = now.toString();

            await AsyncStorage.setItem(Constants.LAST_UPDATE_TIME, now);
        } catch (e) {
            console.log("Error while saving weather info:", e);
        }
    };

    LoadWeatherInfo = async () => {
        try {
            const temperature = await AsyncStorage.getItem(
                Constants.TEMPERATURE
            );
            const humidity = await AsyncStorage.getItem(Constants.HUMIDITY);
            const pressure = await AsyncStorage.getItem(Constants.PRESSURE);
            const imageUrl = await AsyncStorage.getItem(Constants.IMAGE_URL);

            if (
                temperature === null ||
                humidity === null ||
                pressure === null ||
                imageUrl === null
            ) {
                return null;
            }

            return new WeatherInfo(temperature, humidity, pressure, imageUrl);
        } catch (e) {
            console.log("Error while loading weather info:", e);
        }
    };

    GetLastUpdateTime = async () => {
        try {
            const time = await AsyncStorage.getItem(Constants.LAST_UPDATE_TIME);
            if (time !== null) {
                return time;
            }
        } catch (e) {
            console.log("Error while reading weather info:", e);
        }
    };
}

export const helper = new Helper();
