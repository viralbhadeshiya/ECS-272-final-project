import React, { useRef, useEffect, useState } from "react";
import { select, geoPath, geoMercator } from "d3";
import globalMapData from './global_map_data.json';

function extractCovidData(globalMapData) {
  // Extract all the dates (keys of the outer object)
  const dates = Object.keys(globalMapData);

  // Transform the data into a format usable for animation
  const structuredData = dates.map((date) => {
    const countries = Object.entries(globalMapData[date]).map(([country, proportion]) => ({
      country,
      proportion: parseFloat(proportion), // Convert proportion to a number
    }));

    return {
      date,
      countries,
    };
  });

  return structuredData;
}

function GeoChart({ data, dimensions }) {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [selectedDate, setSelectedDate] = useState("2020-1-22"); // Default date
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationIndex, setAnimationIndex] = useState(0); // Progress index
  //const [selectedCountry, setSelectedCountry] = useState(null);

  // Extract structured data from the JSON file
  const covidData = extractCovidData(globalMapData);
  const dates = covidData.map((d) => d.date);

  // will be called initially and on every data change
  useEffect(() => {
    const svg = select(svgRef.current);

    // use resized dimensions
    // but fall back to getBoundingClientRect, if no dimensions yet.
    const { width, height } =
      dimensions || wrapperRef.current.getBoundingClientRect();

    // projects geo-coordinates on a 2D plane
    const projection = geoMercator()
      .fitSize([width, height], data)
      .precision(100);

    // takes geojson data,
    // transforms that into the d attribute of a path element
    const pathGenerator = geoPath().projection(projection);

    // Append a group to contain all map elements (for zooming)
    const mapGroup = svg.selectAll("g.map-group").data([null]).join("g").attr("class", "map-group");

    const clipPaths = svg.selectAll("clipPath")
      .data(data.features)
      .join("clipPath")
      .attr("id", (feature) => `clip-${feature.properties.name}`);

    clipPaths.selectAll("rect")
      .data((feature) => [feature])
      .join("rect")
      .attr("x", (feature) => pathGenerator.bounds(feature)[0][0])
      .attr("y", (feature) => {
        const bounds = pathGenerator.bounds(feature);
        const totalHeight = bounds[1][1] - bounds[0][1];

        const currentDateData = covidData.find((d) => d.date === selectedDate);
        const countryData = currentDateData?.countries.find(
          (country) => country.country === feature.properties.name
        );

        const proportion = parseFloat(countryData?.proportion || 0);
  
        // Ensure proportion is valid (0 <= proportion <= 1)
        const validProportion = Math.max(0, Math.min(1, proportion));
        const yValue = bounds[1][1] - totalHeight * validProportion;

        console.log(
          `Country: ${feature.properties.name}, Proportion: ${validProportion}, Total Height: ${totalHeight}, Y-Position: ${yValue}`
        );
    
        return yValue;
      })
      .attr("width", (feature) => pathGenerator.bounds(feature)[1][0] - pathGenerator.bounds(feature)[0][0])
      .attr("height", (feature) => {
        const bounds = pathGenerator.bounds(feature);
        const totalHeight = bounds[1][1] - bounds[0][1];
        const currentDateData = covidData.find((d) => d.date === selectedDate);
        const countryData = currentDateData?.countries.find(
          (country) => country.country === feature.properties.name
        );
    
        const proportion = parseFloat(countryData?.proportion || 0);

        // Ensure proportion is valid (0 <= proportion <= 1)
        const validProportion = Math.max(0, Math.min(1, proportion));
        const fillHeight = totalHeight * validProportion;
        console.log(
          `Country: ${feature.properties.name}, Proportion: ${validProportion}, Total Height: ${totalHeight}, Fill Height: ${fillHeight}`
        );
    
        return fillHeight;
      });

    // Render base map
    mapGroup
      .selectAll(".country")
      .data(data.features)
      .join("path")
      .attr("class", "country")
      .attr("fill", "#f0f0f0")
      .attr("stroke", "black")
      .attr("d", (feature) => pathGenerator(feature));

    // Overlay shaded regions and add click functionality
    mapGroup
      .selectAll(".red-fill")
      .data(data.features)
      .join("path")
      .attr("class", "red-fill")
      .attr("d", (feature) => pathGenerator(feature))
      .attr("fill", "red")
      .attr("clip-path", (feature) => `url(#clip-${feature.properties.name})`);

    mapGroup
      .selectAll(".country")
      .data(data.features)
      .join("path")
      .attr("class", "country")
      .attr("fill", "#f0f0f0")
      .attr("stroke", "black")
      .attr("d", (feature) => pathGenerator(feature));

  }, [data, covidData, dimensions, selectedDate]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setAnimationIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % dates.length;
        setSelectedDate(dates[nextIndex]);
        return nextIndex;
      });
    }, 10);

    return () => clearInterval(interval);
  }, [isPlaying, dates]);

  return (
    <div ref={wrapperRef}>
      <svg ref={svgRef} style={{ width: "150%", height: "150%" }}></svg>
      <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
        <button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <input
          type="range"
          min="0"
          max={dates.length - 1}
          value={animationIndex}
          onChange={(e) => {
            const index = Number(e.target.value);
            setAnimationIndex(index);
            setSelectedDate(dates[index]);
          }}
          style={{ flex: 1, margin: "0 10px" }}
        />
        <span>{selectedDate}</span>
      </div>
    </div>
  );
}

export default GeoChart;
