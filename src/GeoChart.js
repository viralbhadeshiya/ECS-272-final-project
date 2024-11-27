import React, { useRef, useEffect, useState } from "react";
import { select, geoPath, geoMercator, zoom, pointer } from "d3";
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

const tooltip = select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("background-color", "rgba(0, 0, 0, 0.8)")
  .style("color", "#fff")
  .style("padding", "5px 10px")
  .style("border-radius", "5px")
  .style("font-size", "12px")
  .style("visibility", "hidden");

function GeoChart({ data, dimensions }) {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [transform, setTransform] = useState(null);
  const [selectedDate, setSelectedDate] = useState("2020-01-22"); // Default date
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationIndex, setAnimationIndex] = useState(0); // Progress index
  const [hoveredCountry, setHoveredCountry] = useState(null);

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

    svg.selectAll("*").remove();

    svg.append("rect").attr("width", width).attr("height", height).attr("fill", "#ADD8E6");

    // projects geo-coordinates on a 2D plane
    const projection = geoMercator()
      .fitSize([width, height], data)
      .precision(100);

    // takes geojson data,
    // transforms that into the d attribute of a path element
    const pathGenerator = geoPath().projection(projection);

    // Append a group to contain all map elements (for zooming)
    const mapGroup = svg
      .selectAll("g.map-group")
      .data([null])
      .join("g")
      .attr("class", "map-group")
      .attr("transform", transform ? transform.toString() : null);

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
        const yValue = bounds[1][1] - fillHeight;
        console.log(
          `Country: ${feature.properties.name}, Date: ${selectedDate}, Proportion: ${validProportion}, ` +
          `Bounds: ${JSON.stringify(bounds)}, Total Height: ${totalHeight}, ` +
          `Fill Height: ${fillHeight}, Y-Value: ${yValue}, Country Data: `,
          countryData
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
      .attr("stroke-width", 0.5)
      .attr("d", (feature) => pathGenerator(feature))
      .on("mouseover", function (event, feature) {
        select(this).attr("stroke", "black").attr("stroke-width", 2);
        setHoveredCountry(feature.properties.name);
      })
      .on("mouseout", function() {
        select(this).attr("stroke", "black").attr("stroke-width", 0.5);

        setHoveredCountry(null);
        tooltip.style("visibility", "hidden");
      });

    // Overlay shaded regions and add click functionality
    mapGroup
      .selectAll(".red-fill")
      .data(data.features)
      .join("path")
      .attr("class", "red-fill")
      .attr("d", (feature) => pathGenerator(feature))
      .attr("fill", (feature) => {
        const currentDateData = covidData.find((d) => d.date === selectedDate);
        const countryData = currentDateData?.countries.find(
          (country) => country.country === feature.properties.name
        );

        const proportion = parseFloat(countryData?.proportion || 0);
        return proportion === 0 ? "none" : "red";
      })
      .attr("clip-path", (feature) => `url(#clip-${feature.properties.name})`)
      .style("pointer-events", "none");
    
    mapGroup
      .selectAll(".country-border")
      .data(data.features)
      .join("path")
      .attr("class", "country-border")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .attr("d", (feature) => pathGenerator(feature))
      .on("mouseover", function (event, feature) {
        select(this).attr("stroke", "black").attr("stroke-width", 2);
        setHoveredCountry(feature.properties.name);
      })
      .on("mouseout", function() {
        select(this).attr("stroke", "black").attr("stroke-width", 0.5);

        setHoveredCountry(null);
        tooltip.style("visibility", "hidden");
      });

    const zoomBehavior = zoom()
      .scaleExtent([1,8])
      .translateExtent([
        [0,0],
        [width, height],
      ])
      .on("zoom", (event) => {
        const { transform } = event;
        setTransform(transform);
        mapGroup.attr("transform", transform);
      });

      svg.call(zoomBehavior);
  }, [data, covidData, dimensions, selectedDate, transform, hoveredCountry]);

  // Function to handle the animation of the date change
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && animationIndex < dates.length - 1) {
        setAnimationIndex((prevIndex) => prevIndex + 1);
        setSelectedDate(dates[animationIndex]);
      } else if (isPlaying && animationIndex === dates.length - 1) {
        setIsPlaying(false);
      }
    }, 100); // Adjust the speed of the animation (500 ms per step)

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [isPlaying, animationIndex, dates]);

  return (
    <div ref={wrapperRef}>
      <svg ref={svgRef} style={{ width: "100%", height: "70vh" }}></svg>
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
      {hoveredCountry && (
      <div
        style={{
          position: "absolute",
          pointerEvents: "none", // Ensure the tooltip does not block interactions
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "#fff",
          padding: "5px 10px",
          borderRadius: "5px",
          whiteSpace: "nowrap",
          fontSize: "14px",
        }}
      >
        {hoveredCountry}
      </div>
    )}
    </div>
  );
}

export default GeoChart;
