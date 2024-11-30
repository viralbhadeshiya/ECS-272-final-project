import React, { useState } from "react";
// import Video from "./Video";
import GeoChart from "./GeoChart";
import EuroGeo from "./EuropeGeoChart";
import data from "./GeoChart.world.geo.json";
import lineData from './line_graph_data.json'
import LineChart from "./LineChart";
import "./App.css";

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedWave, setSelectedWave] = useState(null);

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
  };

  const handleWaveChange = (wave) => {
    setSelectedWave(wave);
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2> COVID-19 Data Interactivity </h2>

      <div className="geo-chart-container">
        {/* GeoChart (Geographical Map Animation) */}
        <GeoChart 
          data={data}
          onCountryClick={handleCountryClick}
          onWaveChange={handleWaveChange}
        />
      </div>

      <div className="line-chart-container">
        {/* LineChart (Line Graph for the selected country & wave) */}
        {selectedCountry && selectedWave && (
          <LineChart
            country={selectedCountry}
            wave={selectedWave}
            globalMapData={lineData}
          />
        )}
      </div>
    </div>
  );
}

export default App;
