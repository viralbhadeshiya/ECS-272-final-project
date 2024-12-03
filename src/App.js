import React, { useState } from "react";
// import Video from "./Video";
import GeoChart from "./GeoChart";
import data from "./GeoChart.world.geo.json";
import lineData from './line_graph_data.json';
import economyData from './grouped_bar_chart_average_data.json';
import RaisingBarChart from "./RaisingBarChart";
import raisingBarData from './bar_chart_raising_data.json';
import LineChart from "./LineChart";
import EconomyBar from "./EconomyBarChart";
import "./App.css";

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedWave, setSelectedWave] = useState(null);
  const [selectedDate, setSelectedDate] = useState("2020-01-22");

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
  };

  const handleWaveChange = (wave) => {
    setSelectedWave(wave);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  }

  return (
    <div style={{ padding: "10px" }}>
      <h2> COVID-19 Data Interactivity </h2>

      <div className="geo-chart-container">
        {/* GeoChart (Geographical Map Animation) */}
        <GeoChart 
          data={data}
          onCountryClick={handleCountryClick}
          onWaveChange={handleWaveChange}
          onDateChange={handleDateChange}
        />
      </div>

      <div className="chart-container">
        {/* LineChart (Line Graph for the selected country & wave) */}
        {selectedCountry && selectedWave && (
          <div className="line-chart-container">
            <LineChart
              country={selectedCountry}
              wave={selectedWave}
              globalMapData={lineData}
            />
          </div>
        )}
        {/* Raising bar chart */}
        <div className="raising-bar-chart-container">
          <RaisingBarChart
            data={raisingBarData}
            selectedDate={selectedDate}
            />
        </div>
      </div>

      <h2> Economy Grouped Bar Chart for 9 continents </h2>
      <div className="economy-chart-container">
        {/* Grouped Bar Chart for the 9 continents */}
        <EconomyBar data={economyData}/>
      </div>
    </div>
  );
}

export default App;
