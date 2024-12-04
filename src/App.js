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
import EuropeGeoChart from "./EuropeGeoChart";
import EuropeTotalCaseLine from "./EuropeTotalCase";
import EuropeTotalDeathLine from "./EuropeTotalDeaths";
import EuropeBarChart from "./EuropeBarChart";
import "./App.css";

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [europeWave, setEuropeWave] = useState('wave1');
  const [selectedWave, setSelectedWave] = useState(null);
  const [selectedDate, setSelectedDate] = useState("2020-01-22");
  const europeanCountries = [
    "Austria", "Belgium", "Croatia", "Denmark", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland",
    "Italy", "Netherlands", "Norway", "Poland", "Portugal", "Spain", "Sweden", "Switzerland", "United Kingdom"
  ];

  const handleEuropeWaveChange = (newWave) => {
    setEuropeWave(newWave);
  }

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
    <div style={{ padding: "20px 100px" }}>
      {/* Main Title */}
      <header style={{ fontFamily: "Roboto, sans-serif", textAlign: "center", marginBottom: "10px", fontWeight: "bold" }}>
        <h1>Impact of COVID-19 Across the World, Across the Waves</h1>
        <h3 style={{ fontFamily: "Roboto, serif" }}>Initial start with SARS-CoV-2 virus, continuing with the new variants</h3>
      </header>

      {/* Introduction Section */}
      <section style={{ marginBottom: "40px" }}>
        <div style={{ textIndent: "2em", fontFamily: "Georgia, sans-serif", lineHeight: "1.6", fontSize: "18px" }}>
          <p>
            Still an ongoing fight, COVID-19, caused by the SARS-CoV-2 virus, emerged in the late 2019 and rapidly became a global pandemic. Characterized by symptoms ranging from mild respiratory issues to severe complications, the disease has had a profound impact on public health, economies, and daily life worldwide. 
            With varying levels of success, governments and healthcare systems implemented response strategies over multiple waves of the virus, from managing surges in infections to deploying vaccines and enforcing public health measures.
            These efforts were essential in mitigating the impact of the pandemic, though challenges in economy or resource availability accompanied. 
          </p>
          <p>
            The pandemic unfolded in multiple waves, with distinct patterns of transmission and severity across regions. 
            In the following narrative, it will focus on examining the effectiveness and unintended consequences of 
            government policies — primarily lockdowns and vaccination efforts — over the course of three distinct 
            pandemic waves:
          </p>
          <ol>
            <li>
              The initial outbreak in <strong>March 2020</strong>
            </li>
            <li>
              The rise of Beta variant in <strong>May 2020</strong>
            </li>
            <li>
              The emergence of the highly contagious Delta and Omicron variants in <strong>Oct. 2021</strong>
            </li>
          </ol>
          <p>
            The pandemic represents one of the most disruptive global events in recent history, affecting every continent and reshaping societal norms. In Europe, the pandemic's impact was particularly multifaceted, with countries navigating 
            unique challenges due to their high population density, interconnected economies, and economic stability. 
          </p>
        </div>
      </section>

      {/* European Geographical Chart for the Narrative Focus */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap:"20px", alignItems:"center", marginBottom: "40px" }}>
        <div>
          <h2 style={{ fontFamily: "Roboto, sans-serif" }}>Focusing on Impact of the virus in European countries</h2>
          <p style={{ textIndent: "2em", fontFamily: "Georgia, sans-serif", lineHeight: "1.6", fontSize: "18px" }}>
            The European region experienced significant challenges during the COVID-19 pandemic. Countries like Italy and Spain were among the hardest hit during the initial waves, while others managed better containment strategies. This visualization highlights the variations in impact across different countries in Europe.
          </p>
        </div>
        <div className="euro-chart-container">
          <EuropeGeoChart data={data}/>
        </div>
      </section>

      {/* European countries TotalCases Line Chart */}
      <section style={{ marginBottom: "40px" }}>
        <div>
          <h3 style={{ fontFamily:"Roboto, sans-serif" }}>How the European countries experienced different peaks of Total Cases</h3>
        </div>
        <div>
          <EuropeTotalCaseLine 
            europeanCountries={europeanCountries}
            globalMapData={lineData}
            onWaveChange={handleEuropeWaveChange}/>
        </div>
      </section>

      {/* European countries TotalDeaths Line Chart */}
      <section style={{ marginBottom: "40px" }}>
      <div>
          <h3 style={{ fontFamily:"Roboto, sans-serif" }}>How the European countries experienced different peaks of Total Deaths</h3>
        </div>
        <div>
          <EuropeTotalDeathLine
          europeanCountries={europeanCountries}
          globalMapData={lineData}
          wave={europeWave}/>
        </div>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <div>
          <h3 style={{ fontFamily:"Roboto, sans-serif" }}>Economical Impact on Europe</h3>
        </div>
        <div>
          <EuropeBarChart
          wave={europeWave}/>
        </div>
      </section>

      {/* Interactive Visualizations */}
      <section>
        <h2 style={{fontFamily: "Roboto, sans-serif", textAlign: "center" }}> COVID-19 Data Interactivity </h2>
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
      </section>

      <section>
        <h2 style={{ fontFamily: "Roboto, sans-serif", textAlign:"left" }}> Economy Grouped Bar Chart for 9 continents </h2>
        <div className="economy-chart-container">
          {/* Grouped Bar Chart for the 9 continents */}
          <EconomyBar data={economyData}/>
        </div>
      </section>
    </div>
  );
}

export default App;
