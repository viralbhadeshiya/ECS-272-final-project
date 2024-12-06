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
        <div style={{ fontFamily: "Georgia, sans-serif", lineHeight: "1.6", fontSize: "18px", marginBottom: "20px" }}>
          {/* Wave 1 Narrative */}
          <h4 style={{ fontFamily: "Roboto, sans-serif", marginTop: "20px" }}>Wave 1: The Early Surge (January - May 2020)</h4>
          <p>
            Europe’s first encounter with COVID-19 was characterized by widespread uncertainty and an overwhelmed healthcare system. 
            The virus spread from Asia to Europe, with Italy, Spain, and France reporting alarming increases in cases and deaths by March 2020. 
            Early delays in implementing lockdowns and insufficient testing allowed the virus to spread unchecked in densely populated urban centers.
          </p>
          <ul>
            <li>
              <strong>Italy:</strong> The hardest-hit country in this wave, especially in Lombardy. Hospitals were flooded with patients, and healthcare workers faced severe shortages of personal protective equipment (PPE). Daily deaths climbed into the thousands.
            </li>
            <li>
              <strong>Spain:</strong> Rapidly followed Italy, with Madrid becoming a hotspot. Mass gatherings earlier in the year contributed to the explosion in cases.
            </li>
            <li>
              <strong>France:</strong> Experienced a slower initial rise but faced a severe surge by April, leading to full national lockdowns.
            </li>
            <li>
              <strong>Germany:</strong> Benefited from robust testing and early interventions, keeping death rates lower compared to other major countries.
            </li>
          </ul>
          <p>
            Public compliance with stringent lockdown measures helped flatten the curve by summer, though economic activities came to a near halt. 
            This wave highlighted vulnerabilities in unprepared healthcare systems and the need for cross-border coordination.
          </p>

          {/* Wave 2 Narrative */}
          <h4 style={{ fontFamily: "Roboto, sans-serif", marginTop: "20px" }}>Wave 2: The Beta Variant and Partial Recovery (May 2020 - Oct 2021)</h4>
          <p>
            The summer of 2020 brought hope as cases dropped and restrictions eased. However, the resumption of travel and social activities fueled 
            the second wave by late 2020. This wave was driven largely by the Beta variant (B.1.351), which had higher transmissibility and some vaccine resistance.
          </p>
          <ul>
            <li>
              <strong>France:</strong> Repeated surges forced new lockdowns, significantly affecting daily life and business operations.
            </li>
            <li>
              <strong>Spain:</strong> Struggled with localized outbreaks. Despite improved healthcare readiness, the pressure on hospitals mounted once again.
            </li>
            <li>
              <strong>Poland and Eastern Europe:</strong> This region faced delayed but severe surges, exposing underfunded healthcare systems and slower public health responses.
            </li>
            <li>
              <strong>Germany and the Netherlands:</strong> These countries observed spikes in cases due to holiday travel and the reopening of schools.
            </li>
          </ul>
          <p>
            Economic impacts deepened during this wave, with unemployment surging and businesses struggling to recover from the initial shock. 
            However, the beginning of vaccination campaigns in December 2020 brought cautious optimism.
          </p>

          {/* Wave 3 Narrative */}
          <h4 style={{ fontFamily: "Roboto, sans-serif", marginTop: "20px" }}>Wave 3: The Rise of Delta and Omicron Variants (Oct 2021 - Late 2021)</h4>
          <p>
            The third wave saw the emergence of the highly transmissible Delta variant, followed later by the Omicron variant. Despite vaccination efforts, 
            Delta caused significant outbreaks, especially in countries with slow vaccine rollouts or vaccine hesitancy.
          </p>
          <ul>
            <li>
              <strong>Germany:</strong> Faced one of the highest infection rates during this wave due to vaccine hesitancy and resistance among certain segments of the population.
            </li>
            <li>
              <strong>France and the U.K.:</strong> Accelerated vaccination campaigns significantly reduced deaths during this wave, though infections remained high.
            </li>
            <li>
              <strong>Scandinavian countries:</strong> Benefited from higher vaccination rates and stricter public health measures, experiencing milder impacts.
            </li>
            <li>
              <strong>Italy and Spain:</strong> Continued to improve their responses compared to earlier waves, though Omicron presented new challenges by partially evading immunity.
            </li>
          </ul>
          <p>
            Vaccination campaigns across Europe prevented mass casualties and reduced hospitalization rates during this wave. 
            However, Omicron's rapid spread kept public health systems on high alert.
          </p>
        </div>
        <h3 style={{ fontFamily: "Roboto, sans-serif" }}>
          How European Countries Experienced Peaks of Total Cases
        </h3>
        {/* Total Cases Observation */}
        <section style={{ marginBottom: "40px" }}>
          <h3 style={{ fontFamily: "Roboto, sans-serif" }}>
            Total Cases Observation Across Waves
          </h3>
          <div style={{ fontFamily: "Georgia, sans-serif", lineHeight: "1.6", fontSize: "18px", marginBottom: "20px" }}>
            <p>
              The trajectory of total cases in Europe highlights the exponential nature of viral spread and the impact of public health measures:
            </p>
            <ul>
              <li>
                <strong>Wave 1:</strong> Cases grew rapidly due to delayed responses, with Italy, Spain, and France emerging as hotspots. 
                Early lockdowns helped flatten the curve but not before significant outbreaks.
              </li>
              <li>
                <strong>Wave 2:</strong> Total cases rose more steadily, driven by the Beta variant (B.1.351). Vaccination efforts began toward 
                the end of this wave, offering a gradual slowdown in case growth.
              </li>
              <li>
                <strong>Wave 3:</strong> Total cases surged again with the Delta and Omicron variants. Although vaccines reduced the severity 
                of infections, the variants' higher transmissibility caused record-high case numbers in some countries.
              </li>
            </ul>
            <p>
              Eastern European countries, such as Poland and Hungary, faced delayed but severe case surges in waves 2 and 3 due to slower 
              vaccination rollouts and public health responses.
            </p>
          </div>
        </section>

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
        {/* Total Deaths Observation */}
        <section style={{ marginBottom: "40px" }}>
          <h3 style={{ fontFamily: "Roboto, sans-serif" }}>
            Total Deaths Observation Across Waves
          </h3>
          <div style={{ fontFamily: "Georgia, sans-serif", lineHeight: "1.6", fontSize: "18px", marginBottom: "20px" }}>
            <p>
              The total deaths data reveals the devastating toll of COVID-19 on European populations, particularly in countries with strained healthcare systems:
            </p>
            <ul>
              <li>
                <strong>Wave 1:</strong> Deaths were highest during this wave as countries struggled to understand the virus and ramp up healthcare responses. 
                Italy and Spain reported thousands of deaths daily at their peaks.
              </li>
              <li>
                <strong>Wave 2:</strong> Deaths were lower relative to total cases, reflecting improved treatments and expanded healthcare capacities. 
                However, the Beta variant caused spikes in countries like France and Poland.
              </li>
              <li>
                <strong>Wave 3:</strong> Deaths rose again with the Delta variant, though widespread vaccination campaigns significantly reduced 
                fatalities compared to earlier waves.
              </li>
            </ul>
            <p>
              Deaths in Eastern Europe remained high during the third wave due to slower vaccination uptake and underfunded healthcare systems. 
              Western Europe, in contrast, saw a decoupling of cases and deaths thanks to vaccines.
            </p>
          </div>
        </section>
        <EuropeTotalDeathLine
          europeanCountries={europeanCountries}
          globalMapData={lineData}
          wave={europeWave}
        />
      </section>

      {/* Economy Impact */}
      <section style={{ marginBottom: "40px" }}>
        <h3 style={{ fontFamily: "Roboto, sans-serif" }}>Economic Impact on Europe</h3>
        {/* Economic Impact Narrative */}
        <section style={{ marginBottom: "40px" }}>
          <div style={{ fontFamily: "Georgia, sans-serif", lineHeight: "1.6", fontSize: "18px", marginBottom: "20px" }}>
            {/* Wave 1 Narrative */}
            <h4 style={{ fontFamily: "Roboto, sans-serif", marginTop: "20px" }}>Wave 1: The Early Disruption (January - June 2020)</h4>
            <p>
              The onset of the pandemic caused immediate disruptions across the global economy, particularly in Europe. Manufacturing PMI 
              plummeted below 50, signaling contraction as supply chains were disrupted. The services sector was hit even harder due to lockdowns, 
              with many businesses forced to shut down temporarily. Consumer confidence dropped dramatically as uncertainty about the future gripped 
              households and businesses alike.
            </p>
            <ul>
              <li><strong>Manufacturing:</strong> Reduced workforce availability and halted production due to lockdowns pushed manufacturing PMI to historic lows.</li>
              <li><strong>Services:</strong> Drastic drops in the services PMI highlighted the near standstill in industries like hospitality, tourism, and retail.</li>
              <li><strong>Consumer Confidence:</strong> Consumer sentiment nosedived as fears over job security and declining income levels set in.</li>
            </ul>

            {/* Wave 2 Narrative */}
            <h4 style={{ fontFamily: "Roboto, sans-serif", marginTop: "20px" }}>Wave 2: Partial Recovery with Lingering Challenges (July 2020 - March 2021)</h4>
            <p>
              As initial lockdowns were lifted and economies reopened, manufacturing started to recover. However, the services sector faced a slower rebound due to lingering 
              restrictions and reduced demand in areas like travel and entertainment. The rollout of vaccines in late 2020 brought some optimism, but periodic outbreaks 
              and renewed restrictions, particularly in Europe, hindered full recovery.
            </p>
            <ul>
              <li><strong>Manufacturing:</strong> Manufacturing PMI rebounded above 50 as industries adapted to new safety protocols and global trade resumed.</li>
              <li><strong>Services:</strong> Services PMI showed moderate improvement but remained volatile due to localized restrictions.</li>
              <li><strong>Consumer Confidence:</strong> While consumer sentiment improved, it remained subdued compared to pre-pandemic levels, reflecting cautious optimism.</li>
            </ul>

            {/* Wave 3 Narrative */}
            <h4 style={{ fontFamily: "Roboto, sans-serif", marginTop: "20px" }}>Wave 3: Vaccination Progress Amid New Variants (April 2021 - Late 2021)</h4>
            <p>
              The Delta and Omicron variants presented new challenges, but widespread vaccination efforts prevented a repeat of the severe economic downturns seen earlier. 
              Manufacturing remained strong, though supply chain issues persisted. The services sector saw significant improvement as restrictions eased further and consumer 
              demand rebounded.
            </p>
            <ul>
              <li><strong>Manufacturing:</strong> Despite challenges, manufacturing PMI stayed robust, driven by pent-up demand and government stimulus.</li>
              <li><strong>Services:</strong> Services PMI rose steadily as vaccination campaigns and reopening plans restored consumer confidence.</li>
              <li><strong>Consumer Confidence:</strong> Optimism returned as vaccination rates increased, though concerns over inflation and supply chain disruptions lingered.</li>
            </ul>
          </div>
        </section>
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
