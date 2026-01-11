import { useState } from "react";
import "./App.css";
import Globe from "./components/globe.jsx";
import { Canvas } from "@react-three/fiber";
import StarsBG from "./components/stars.jsx";
import { mockCountries } from "./mockCountries";


function App() {
  const [country, setCountry] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleCountryChange = (e) => {
    const input = e.target.value;
    setCountry(input);
    setActiveIndex(-1);

    if (!input) return setSuggestions([]);

    setSuggestions(
      mockCountries
        .filter((c) =>
          c.toLowerCase().includes(input.toLowerCase())
        )
        .slice(0, 5)
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && activeIndex === -1) {
      fetchData();
      return;
    }

    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) =>
        i <= 0 ? suggestions.length - 1 : i - 1
      );
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      setCountry(suggestions[activeIndex]);
      setSuggestions([]);
      setActiveIndex(-1);
    }

    if (e.key === "Escape") {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  const fetchData = async (overrideCountry) => {
    const query = overrideCountry ?? country;
    if (!query.trim()) return;

    if (!mockCountries.some(c => c.toLowerCase() === query.toLowerCase())) {
      setError("Country not found.");
      setData(null);
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);
    setData(null);

    try {
      const response = await fetch(`/country?name=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error. status: ${response.status}`);
      }
    
      let raw;
      try {
        raw = await response.json();
      } catch {
        setError("Could not get response from server.");
        setLoading(false);
        return;
      }

      const adaptedData = {
        countryInfo: {
          commonName: raw.country.commonName,
          officialName: raw.country.officialName,
          currencyName: raw.country.currencyName,
          currencySymbol: raw.country.currencySymbol,
          flagPng: raw.country.flagPng,
          flagSvg: raw.country.flagSvg,
          population: raw.country.population,
          timezone: raw.country.timezone,
          capital: raw.country.capital,
          capitalLat: raw.country.capitalLat,
          capitalLng: raw.country.capitalLng,
        },

        weatherInfo: {
          temp: raw.weather.temp,
          feelsLike: raw.weather.feelsLike,
          humidity: raw.weather.humidity,
          windSpeed: raw.weather.windSpeed,
          weatherMain: raw.weather.weatherMain,
          weatherDescription: raw.weather.weatherDescription,
          weatherIcon: raw.weather.weatherIcon,
        },

        timeInfo: {
          dateTimeString: raw.time.dateTimeString,
          utcOffset: raw.time.utcOffset,
        },

        travelAdvisory: {
          description: raw.wikipedia.description,
          imageUrl: raw.wikipedia.imageUrl,
        },

        travelInfo: {
          name: raw.geo.name,
          formattedAddress: raw.geo.formattedAddress,
          openingHours: raw.geo.openingHours,
          website: raw.geo.website,
          description: raw.wikipedia.description,
          wikiImage: raw.wikipedia.imageUrl,
        },
      };
       
      setData(adaptedData);
    } catch (err){
      console.error(err);
      setError(err.message || "Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ position: "fixed", inset: 0, zIndex: -1 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 3, 5]} intensity={1.2} />
        <StarsBG />
        <Globe
          focused={Boolean(data)}
          lat={data?.countryInfo.capitalLat ?? 0}
          lng={data?.countryInfo.capitalLng ?? 0}
        />
      </Canvas>

      <div className="top-bar">
        <div className="top-bar-inner">
          {!data ? (
            <div className="search-box">
              <input
                className="input"
                value={country}
                onChange={handleCountryChange}
                onKeyDown={handleKeyDown}
                placeholder="Search a country..."
              />
              <button className="button" onClick={fetchData}>
                Search
              </button>

              {suggestions.length > 0 && (
                <div className="autocomplete-suggestions">
                  {suggestions.map((s, i) => (
                    <div
                      key={s}
                      className={i === activeIndex ? "active" : ""}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => {
                        setCountry(s);
                        setSuggestions([]);
                        setActiveIndex(-1);
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="country-header">
              {data.countryInfo.commonName}
            </div>
          )}
        </div>
      </div>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {data && (
        <div className="results-panel">
          <div className="card">
            <h2>{data.countryInfo.commonName}</h2>
            <p><strong>Capital:</strong> {data.countryInfo.capital}</p>
            <p><strong>Population:</strong> {data.countryInfo.population.toLocaleString()}</p>
            <img src={data.countryInfo.flagPng} className="flag" />
          </div>

          <div className="card">
            <h3>Weather</h3>
            <p><strong>Condition:</strong> {data.weatherInfo.weatherDescription}</p>
            <p><strong>Temperature:</strong> {(data.weatherInfo.temp - 273.15).toFixed(1)}°C</p>
            <p><strong>Feels like:</strong> {(data.weatherInfo.feelsLike - 273.15).toFixed(1)}°C</p>
            <p><strong>Humidity:</strong> {data.weatherInfo.humidity}%</p>
            <p><strong>Wind speed:</strong> {data.weatherInfo.windSpeed} m/s</p>
          </div>


          <div className="card">
            <h3>Local Time</h3>
            <p>{data.timeInfo.dateTimeString}</p>
          </div>

          <div className="card">
            <h3>Country Facts</h3>
            <p><strong>Official name:</strong> {data.countryInfo.officialName}</p>
            <p>
              <strong>Currency:</strong>{" "}
              {data.countryInfo.currencyName} ({data.countryInfo.currencySymbol})
            </p>
            <p><strong>Timezone:</strong> {data.countryInfo.timezone}</p>
          </div>

          <div className="card">
            <h3>About {data.countryInfo.commonName}</h3>

            {data.travelAdvisory.imageUrl && (
              <img
                src={data.travelAdvisory.imageUrl}
                alt={`${data.countryInfo.commonName} flag`}
                style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }}
              />
            )}

            <p style={{ lineHeight: "1.5" }}>
              {data.travelAdvisory.description}
            </p>
          </div>

          <div className="card">
            <h3>Point of Interest</h3>
            <p><strong>Name:</strong> {data.travelInfo.name}</p>
            <p><strong>Address:</strong> {data.travelInfo.formattedAddress}</p>

            {data.travelInfo.openingHours && (
              <p><strong>Opening hours:</strong> {data.travelInfo.openingHours}</p>
            )}

            {data.travelInfo.website && (
              <p>
                <a href={data.travelInfo.website} target="_blank" rel="noreferrer">
                  Visit website
                </a>
              </p>
            )}
          </div>

        </div>

      )}
    </>
  );
}

export default App;
