import React, { useState } from "react";
import GeoChart from "./GeoChart";
import data from "./GeoChart.world.geo.json";
import lineData from "./line_graph_data.json";
import economyData from "./grouped_bar_chart_average_data.json";
import RaisingBarChart from "./RaisingBarChart";
import raisingBarData from "./bar_chart_raising_data.json";
import LineChart from "./LineChart";
import EconomyBar from "./EconomyBarChart";
import EuropeGeoChart from "./EuropeGeoChart";
import EuropeTotalCaseLine from "./EuropeTotalCase";
import EuropeTotalDeathLine from "./EuropeTotalDeaths";
import EuropeBarChart from "./EuropeBarChart";
import { flagData } from "./flagData.js";
import "./App.css";

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [europeWave, setEuropeWave] = useState("wave1");
  const [selectedWave, setSelectedWave] = useState(null);
  const [selectedDate, setSelectedDate] = useState("2020-01-22");

  const europeanCountries = [
    "Austria", "Belgium", "Croatia", "Denmark", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland",
    "Italy", "Netherlands", "Norway", "Poland", "Portugal", "Spain", "Sweden", "Switzerland", "United Kingdom",
  ];

  const handleEuropeWaveChange = (newWave) => {
    setEuropeWave(newWave);
  };

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
  };

  const handleWaveChange = (wave) => {
    setSelectedWave(wave);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div style={{ padding: "20px 100px" }}>
      {/* Main Title */}
      <header style={{ fontFamily: "Roboto, sans-serif", textAlign: "center", marginBottom: "10px", fontWeight: "bold" }}>
        <h1>Impact of COVID-19 Across the World, Across the Waves</h1>
        <h3 style={{ fontFamily: "Roboto, serif" }}>
          Initial start with SARS-CoV-2 virus, continuing with the new variants
        </h3>
      </header>

      {/* Introduction Section */}
      <section style={{ marginBottom: "40px" }}>
        <div style={{ textIndent: "2em", fontFamily: "Georgia, sans-serif", lineHeight: "1.6", fontSize: "18px" }}>
          <p>
            Still an ongoing fight, COVID-19, caused by the SARS-CoV-2 virus, emerged in late 2019 and rapidly became a global pandemic. Characterized by symptoms ranging from mild respiratory issues to severe complications, the disease has had a profound impact on public health, economies, and daily life worldwide. 
          </p>
          <p>
            The pandemic unfolded in multiple waves, with distinct patterns of transmission and severity across regions. 
          </p>
        </div>
      </section>

      {/* European Geographical Chart */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "center", marginBottom: "40px" }}>
        <div>
          <h2 style={{ fontFamily: "Roboto, sans-serif" }}>Impact of COVID-19 in European Countries</h2>
          <p style={{ textIndent: "2em", fontFamily: "Georgia, sans-serif", lineHeight: "1.6", fontSize: "18px" }}>
            The European region experienced significant challenges during the COVID-19 pandemic.
          </p>
        </div>
        <div className="euro-chart-container">
          <EuropeGeoChart data={data} />
        </div>
      </section>

      {/* European countries TotalCases Line Chart */}
      <section style={{ marginBottom: "40px" }}>
        <h3 style={{ fontFamily: "Roboto, sans-serif" }}>
          How European Countries Experienced Peaks of Total Cases
        </h3>
        <EuropeTotalCaseLine
          europeanCountries={europeanCountries}
          globalMapData={lineData}
          onWaveChange={handleEuropeWaveChange}
        />
      </section>

      {/* European countries TotalDeaths Line Chart */}
      <section style={{ marginBottom: "40px" }}>
        <h3 style={{ fontFamily: "Roboto, sans-serif" }}>
          How European Countries Experienced Peaks of Total Deaths
        </h3>
        <EuropeTotalDeathLine
          europeanCountries={europeanCountries}
          globalMapData={lineData}
          wave={europeWave}
        />
      </section>

      {/* Economy Impact */}
      <section style={{ marginBottom: "40px" }}>
        <h3 style={{ fontFamily: "Roboto, sans-serif" }}>Economic Impact on Europe</h3>
        <EuropeBarChart wave={europeWave} />
      </section>

      {/* Interactive Visualizations */}
      <section>
        <h2 style={{ fontFamily: "Roboto, sans-serif", textAlign: "center" }}>
          COVID-19 Data Interactivity
        </h2>
        <div className="geo-chart-container">
          <GeoChart
            data={data}
            onCountryClick={handleCountryClick}
            onWaveChange={handleWaveChange}
            onDateChange={handleDateChange}
          />
        </div>

        <div className="chart-container">
          {/* Line Chart */}
          {selectedCountry && selectedWave && (
            <div className="line-chart-container">
              <LineChart
                country={selectedCountry}
                wave={selectedWave}
                globalMapData={lineData}
              />
            </div>
          )}

          {/* Raising Bar Chart */}
          <div className="raising-bar-chart-container">
            <RaisingBarChart
              data={raisingBarData}
              selectedDate={selectedDate}
              flagData={flagData}
            />
          </div>
        </div>

        {/* Grouped Bar Chart */}
        <section>
          <h2 style={{ fontFamily: "Roboto, sans-serif", textAlign: "left" }}>
            Economy Grouped Bar Chart for 9 Continents
          </h2>
          <div className="economy-chart-container">
            <EconomyBar data={economyData} />
          </div>
        </section>
      </section>
    </div>
  );
}

export default App;
