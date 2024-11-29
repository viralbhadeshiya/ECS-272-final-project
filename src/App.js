import React, { useState } from "react";
// import Video from "./Video";
import GeoChart from "./GeoChart";
import EuroGeo from "./EuropeGeoChart";
import data from "./GeoChart.world.geo.json";
import "./App.css";

function App() {
  return (
    <React.Fragment>
      <EuroGeo data={data} />
      {/* <Video /> */}
    </React.Fragment>
  );
}

export default App;
