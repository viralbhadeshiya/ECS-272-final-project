import React, { useState } from "react";
// import Video from "./Video";
import GeoChart from "./GeoChart";
import data from "./GeoChart.world.geo.json";
import "./App.css";

function App() {
  return (
    <React.Fragment>
      <GeoChart data={data} />
      {/* <Video /> */}
    </React.Fragment>
  );
}

export default App;
