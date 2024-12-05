import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { select, geoPath, geoMercator, zoom } from "d3";
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

const getWave = (selectedDate) => {
  const selectedDateObj = new Date(selectedDate);
  const wave1End = new Date('2020-05-01');
  const wave2End = new Date('2021-10-01');

  if (selectedDateObj <= wave1End) {
    return "Wave 1";
  } else if (selectedDateObj <= wave2End) {
    return "Wave 2";
  } else {
    return "Wave 3";
  }
};

function EuropeGeoChart({ data, dimensions }) {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [selectedDate, setSelectedDate] = useState("2020-01-22"); // Default date
  const [isPlaying, setIsPlaying] = useState(true);
  const [animationIndex, setAnimationIndex] = useState(0); // Progress index

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
    const euroGroup = svg
      .selectAll("g.map-group")
      .data([null])
      .join("g")
      .attr("class", "map-group");

    const euroPaths = svg
      .append("defs")
      .selectAll("clipPath")
      .data(data.features)
      .join("clipPath")
      .attr("id", (feature) => {
        const sanitizedName = feature.properties.name.replace(/[^a-zA-Z0-9]/g, "_");
        const id = `id-${sanitizedName}`;
        //console.log(`Generated clipPath ID: ${id}`);
        return id;
      });

    euroPaths.selectAll("rect")
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
    
        return fillHeight;
      });

    // Render base map
    euroGroup
      .selectAll(".country")
      .data(data.features)
      .join("path")
      .attr("class", "country")
      .attr("fill", "#f0f0f0")
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .attr("d", (feature) => pathGenerator(feature));

    const europeanCountries = [
      "Austria", "Belgium", "Croatia", "Denmark", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland",
      "Italy", "Netherlands", "Norway", "Poland", "Portugal", "Spain", "Sweden", "Switzerland", "United Kingdom"
    ];

    // Overlay shaded regions and add click functionality
    euroGroup
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
      .attr("clip-path", (feature) => {
        const sanitizedName = feature.properties.name.replace(/[^a-zA-Z0-9]/g, "_");
        const clipPathReference = `url(#id-${sanitizedName})`;
        //console.log(`Country: ${feature.properties.name}, ClipPath Reference: ${clipPathReference}`);
        return clipPathReference;
      });

    euroGroup
      .selectAll(".country-border")
      .data(data.features)
      .join("path")
      .attr("class", "country-border")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .attr("d", (feature) => pathGenerator(feature));

    const labels = euroGroup.selectAll(".country-label-group")
      .data(data.features.filter((feature) => europeanCountries.includes(feature.properties.name)))
      .join("g")
      .attr("class", "country-label-group")
      .attr("transform", (feature) => {
        const [x,y] = projection(d3.geoCentroid(feature));
        return `translate(${x},${y})`;
      });

    labels.append("text")
      .attr("class", "country-label")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "3px")
      .style("fill", "black")
      .style("font-weight", "bold")
      .text((feature) => feature.properties.name);

    labels.append("rect")
      .attr("x", function() {
        return this.parentNode.querySelector("text").getBBox().x;
      })
      .attr("y", function() {
        return this.parentNode.querySelector("text").getBBox().y;
      })
      .attr("width", function() {
        return this.parentNode.querySelector("text").getBBox().width;
      })
      .attr("height", function() {
        return this.parentNode.querySelector("text").getBBox().height;
      })
      .style("fill", "white")
      .style("opacity", 0.7)
      .lower();

    const zoomBehavior = zoom()
      .scaleExtent([1,8])
      .translateExtent([
        [0,0],
        [width, height],
      ])
      .on("zoom", (event) => {

        euroGroup.attr("transform", event.transform);
      });

    svg.call(zoomBehavior);

    const europeCenter = projection([25, 56]);
    const zoomScale = 4;

    svg.transition()
       .duration(1000)
       .call(
        zoomBehavior.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(zoomScale)
          .translate(-europeCenter[0], -europeCenter[1])
       );
    svg.on(".zoom", null);
  }, [data, covidData, dimensions, selectedDate]);

  // Function to handle the animation of the date change
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && animationIndex < dates.length - 1) {
        setAnimationIndex((prevIndex) => prevIndex + 1);
        const newDate = dates[animationIndex];
        setSelectedDate(newDate);
      } else if (isPlaying && animationIndex === dates.length - 1) {
        setIsPlaying(false);
      }
    }, 50); // Adjust the speed of the animation (50 ms per step)

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [isPlaying, animationIndex, dates]);

  const buGnColors = [
    d3.interpolateBuGn(0.0),
    d3.interpolateBuGn(0.5),
    d3.interpolateBuGn(0.8),
  ];

  const timelineStyle = {
    flex: 0.85,
    margin: "0 10px",
    appearance: "none", 
    height: "8px", 
    borderRadius: "4px",
    background: `linear-gradient(to right, ${buGnColors[0]} 11.86%, ${buGnColors[1]} 73.31%, ${buGnColors[2]} 100%)`,
    outline: "none",
  };

  return (
    <div ref={wrapperRef}>
      <svg ref={svgRef} id="europe-svg" style={{ width: "90%", height: "80vh" }}></svg>
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
            const newDate = dates[index];
            setSelectedDate(newDate);
          }}
          style={timelineStyle}
        />
        <span>{selectedDate}</span>
        <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
          {getWave(selectedDate)}
        </span>
      </div>
    </div>
  );
}

export default EuropeGeoChart;
