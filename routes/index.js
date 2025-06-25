import { Router } from "express";
import countries from 'i18n-iso-countries';
import axios from "axios";
import env from 'dotenv';


env.config()

const route = Router();

const OPEN_WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY;
const GEOLOCATION_API_KEY = process.env.GEOLOCATION_API_KEY;
const my_lon = process.env.DEFAULT_LON;
const my_lat = process.env.DEFAULT_LAT;
let inputted_lon;
let inputted_lat;


function DT_to_DT_TXT(dt){
    let date = new Date(dt * 1000);

    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'short',  
        day: 'numeric',   
        timeZone: 'UTC'
        });
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    const formattedUTC = `${hours}:${minutes} - ${formattedDate} `;
    return formattedUTC;
}


async function hourly_forcasts(lat, lon){

    try{
        let request = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=4&units=metric&appid=${OPEN_WEATHER_API_KEY}`);
        let response = request.data.list;
        let forcasts = [];
        response.forEach((forcast, index) =>{
            forcasts.push({
                'date': forcast.dt_txt.split(' ')[1].slice(0, 5),
                'temp': forcast.main.temp,
                'weather': forcast.weather[0].main,
                'icon': `https://openweathermap.org/img/wn/${forcast.weather[0].icon}@2x.png`
            })  
        })
        return forcasts;
    } catch (error){
        console.log("Failed to make request: " + error.message);
    }
}

async function getforcast(lat = my_lat, lon=my_lon){
    try{
        let request = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`)
        let response = request.data
        let data = {
        'country': {
            'name': countries.getName(response.sys.country, 'en'),
            'icon': `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`,
            'temp': response.main.temp,
            'date': DT_to_DT_TXT(response.dt)
        },
        'forcast': {
            'weather_forcast': response.weather[0].description,
            'temp_max': response.main.temp_max,
            'temp_min': response.main.temp_min,
            'humidity': response.main.humidity,
            'cloudy': response.clouds.all,
            'wind': ((response.wind.speed) * (18/5)).toFixed(2),
        },

        'hourly_forcast': await hourly_forcasts(lat, lon)
    }
    return data;
    } catch (error){
        console.log('Failed to fuilfil request: ' + error.message);
    }
}

route.get('/', async (req, res) =>{
    let response = await getforcast();
    res.render('index.ejs', {content: response});
})

route.post('/', async (req, res) =>{
    try{
        let request = await axios.get(`https://api.distancematrix.ai/maps/api/geocode/json?address=${req.body.location}&key=${GEOLOCATION_API_KEY}`);
        let response = request.data
        inputted_lat = response.result[0].geometry.location.lat;
        inputted_lon = response.result[0].geometry.location.lng;
        let data = await getforcast(inputted_lat, inputted_lon)
        res.render('index.ejs', {content: data});
    } catch (error){
        console.log('failed to get location: ' + error.message)
    }
})

export default route