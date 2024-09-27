import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import NetInfo from "@react-native-community/netinfo";
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { helper } from './StorageHelper'
import { GetCurrentWeatherInfo } from './WeatherInfoProvider';

export default function App() {
    const [temperature, setTemperature] = useState("");
    const [pressure, setPressure] = useState("");
    const [humidity, setHumidity] = useState("");
    const [image, setImage] = useState(null);
    const [time, setTime] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const savedDataExpirationHours = 3;
    

    const UpdateWeatherData = async (latitude, longitude) => {
        let weatherInfo = null;

        const isConnected = await NetInfo.fetch().then((state) => {
            return state.isConnected;
        });

        if (isConnected) {
            weatherInfo = await GetCurrentWeatherInfo(latitude, longitude);
            if (weatherInfo !== null) {
                await helper.SaveWeatherInfo(weatherInfo);
                UpdateUIWithNewInfo(weatherInfo);
            }
        } else {
            if (SavedDataIsCurrent()) {
                weatherInfo = await helper.LoadWeatherInfo();
            }
            if (weatherInfo !== null) {
                UpdateUIWithNewInfo(weatherInfo);
            }
        }
    };

    const UpdateUIWithNewInfo = async (weatherInfo) => {
        setTemperature(weatherInfo.temperature.toString() + "°");
        setPressure(weatherInfo.pressure.toString() + "hPa");
        setHumidity(weatherInfo.humidity.toString() + " %");
        setImage(weatherInfo.imageUrl.toString());

        let lastUpdateTime = await helper.GetLastUpdateTime();
        lastUpdateTime = lastUpdateTime.toString();
        const date = new Date(lastUpdateTime);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");

        setTime(`${hours}:${minutes}`);
    };

    const ResetUI = () => {
        setTemperature("-°");
        setPressure("-hPa");
        setHumidity("- %");
        setImage(null);
        setTime("-");
    };

    const SavedDataIsCurrent = async () => {
        let currentDate = new Date();
        let storageDate = await helper.GetLastUpdateTime();
        let expirationDate = new Date(storageDate);
        expirationDate.setHours(
            expirationDate.getHours() + savedDataExpirationHours
        );

        return currentDate < expirationDate;
    };

    const RefreshWeatherData = async () => {
        setIsLoading(true);
        ResetUI();

        let location = await Location.getCurrentPositionAsync({});

        if (location) {
            await UpdateWeatherData(
                location.coords.latitude,
                location.coords.longitude
            );
        }

        setIsLoading(false);
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setPressure("GPS refused");
            } else {
                try {
                    RefreshWeatherData();
                } catch (e) {
                    Alert.alert(
                        "Error",
                        e,
                        [
                            {
                                text: "OK",
                            },
                        ],
                        { cancelable: false }
                    );
                }
            }
        })();
    }, []);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onLongPress={RefreshWeatherData}
                style={styles.opacity}
                activeOpacity={0.6}
            >
                {isLoading && (
                    <ActivityIndicator
                        size="large"
                        color="white"
                        style={{ marginBottom: 50 }}
                    />
                )}

                <Text style={styles.lastUpdate}>Last update: {time}</Text>
                <Text style={styles.temperature}>{temperature}</Text>
                <Text style={styles.pressureLabel}>Pressure</Text>
                <Text style={styles.pressure}>{pressure}</Text>
                <Text style={styles.humidityLabel}>HUMIDITY</Text>
                <Text style={styles.humidity}>{humidity}</Text>
                <Image source={{ uri: image }} style={styles.image} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#61a2ff",
    },
    opacity: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    lastUpdate: {
        color: "white",
        fontSize: 18,
        opacity: 0.6,
    },
    temperature: {
        color: "white",
        fontSize: 120,
        marginBottom: 30,
    },
    pressureLabel: {
        color: "white",
        fontSize: 20,
        opacity: 0.6,
    },
    pressure: {
        color: "white",
        fontSize: 40,
        marginBottom: 30,
    },
    humidityLabel: {
        color: "white",
        fontSize: 20,
        opacity: 0.6,
    },
    humidity: {
        color: "white",
        fontSize: 60,
        marginBottom: 30,
    },
    image: {
        width: 90,
        height: 90,
    },
});
