import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'ldrs/helix'
import './index.css'; // Make sure to import the CSS file

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasLocation, setHasLocation] = useState(false);

  const apiKey = '0d3354f7f40e3bd88369dc78436a961d';

  const fetchWeatherByCoordinates = async (latitude, longitude) => {
    const geoUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
    try {
      const response = await axios.get(geoUrl);
      setData(response.data);
      setError('');
    } catch (err) {
      setError('Unable to fetch weather data');
    } finally {
      setLoading(false);
      setHasLocation(true);
    }
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoordinates(latitude, longitude);
      },
      (err) => {
        setError('Geolocation not enabled or unavailable');
        setLoading(false);
        setHasLocation(true);
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const searchLocation = async (event) => {
    if (event.key === 'Enter') {
      setLoading(true);
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`;
      try {
        const response = await axios.get(url);
        setData(response.data);
        setError('');
      } catch (err) {
        setError('Location not found');
      } finally {
        setLoading(false);
      }
      setLocation('');
    }
  };

  const convertUnixToTime = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!hasLocation) {
    return (<>
    <div className="spinner-center">
        <l-helix
          size="45"
          speed="2.5"
          color="black" 
        ></l-helix>
        <p className='text'>fetching your location</p>
        </div>
        </>

    );
  }

  // Weather conditions and their corresponding background images
  const weatherBackgrounds = {
    'clear sky': 'url("/images/clear-sky.jpg")',
    'few clouds': 'url("/images/few-clouds.jpg")',
    'scattered clouds': 'url("/images/scattered-clouds.jpg")',
    'broken clouds': 'url("/images/broken-clouds.jpg")',
    'shower rain': 'url("/images/shower-rain.jpg")',
    'rain': 'url("/images/rain.jpg")',
    'thunderstorm': 'url("/images/thunderstorm.jpg")',
    'snow': 'url("/images/snow.jpg")',
    'mist': 'url("/images/mist.jpg")',
    // Add more conditions as needed
  };

  // Determine the current weather description
  const weatherDescription = data.weather ? data.weather[0].description.toLowerCase() : '';

  return (
    <div className="app" style={{ backgroundImage: weatherBackgrounds[weatherDescription] }}>
      <div className="search">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyPress={searchLocation}
          placeholder="Enter location"
          type="text"
        />
      </div>
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>fetching your location</p>
        </div>
      ) : (
        <div className="container">
          <div className="top">
            <div className="location">
              <p>{data.name},{data.sys.country}</p>
            </div>
            <div className="temp">
              {data.main && <h1>{data.main.temp.toFixed()}°C</h1>}
            </div>
            <div className="feels">
              <p>Feels like </p> {data.main && <p>{data.main.feels_like.toFixed()}°C</p>}
            </div>
            <div className="description">
              {data.weather && <p>{data.weather[0].description}</p>}
            </div>
          </div>
          <div className="bottom">
            <div className="humidity">
              {data.main && <p>{data.main.humidity}%</p>}
              <p>Humidity</p>
            </div>
            <div className="wind">
              {data.wind && <p>{data.wind.speed.toFixed()} MPH</p>}
              <p>Wind speed</p>
            </div>
            <div className="sunrise-sunset">
              {data.sys && <p>Sunrise: {convertUnixToTime(data.sys.sunrise)}</p>}
              {data.sys && <p>Sunset: {convertUnixToTime(data.sys.sunset)}</p>}
            </div>
          </div>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default App;
