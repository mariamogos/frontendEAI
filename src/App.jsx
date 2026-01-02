import { useState } from "react";
import "./App.css";
import Globe from "./components/globe.jsx";
import { Canvas } from "@react-three/fiber";
import StarsBG from "./components/stars.jsx";

import { mockTravelData } from "./mockData";
import { mockCountries } from "./mockCountries";

const USE_MOCK_DATA = true;

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

  const fetchData = async () => {
    if (!country.trim()) return;

    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      if (USE_MOCK_DATA) {
        await new Promise((r) => setTimeout(r, 600));
        setData(mockTravelData);
        return;
      }
    } catch {
      setError("Error fetching data.");
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

      {/* ===== TOP BAR ===== */}
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
              🌍 {data.countryInfo.commonName}
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
            <p>{data.weatherInfo.weatherDescription}</p>
            <p>{(data.weatherInfo.temp - 273.15).toFixed(1)}°C</p>
          </div>

          <div className="card">
            <h3>Local Time</h3>
            <p>{data.timeInfo.dateTimeString}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
