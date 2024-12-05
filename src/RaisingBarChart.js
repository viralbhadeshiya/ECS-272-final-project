import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const RaisingBarChart = ({ data, selectedDate, flagData }) => {
  const chartRef = useRef();

  useEffect(() => {
    if (!data[selectedDate]) return;

    const svg = d3.select(chartRef.current);
    const width = 600; // Larger width for better visibility
    const height = 400; // Larger height for better visibility
    const margin = { top: 20, right: 50, bottom: 40, left: 170 };
    const staticBarWidth = width - margin.left - margin.right;

    // Clear previous chart
    svg.selectAll("*").remove();

    // Prepare data with exactly 5 slots
    const chartData = [...data[selectedDate].slice(0, 5)];
    while (chartData.length < 5) {
      chartData.push({ Country: null, TotalCases: 0, NewCases: 0, TotalDeath: 0, NewDeath: 0 });
    }

    const yScale = d3
      .scaleBand()
      .domain(d3.range(5)) // Always 5 slots
      .range([margin.top, height - margin.bottom])
      .padding(0.2);

    // Create a color scale keyed by country names
    const colorScale = d3
      .scaleOrdinal(d3.schemeCategory10)
      .domain(Object.keys(data).flatMap((date) => data[date].map((d) => d.Country)));

    const yAxis = d3.axisLeft(yScale).tickFormat((i) => chartData[i]?.Country || "");

    // Add Y-axis with larger font size for country names
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "14px") // Increased font size
      .style("font-weight", "bold");

    // Draw bars
    svg
      .selectAll(".bar")
      .data(chartData, (_, i) => i) // Key by index to maintain consistent slots
      .join("rect")
      .attr("class", "bar")
      .attr("x", margin.left)
      .attr("y", (_, i) => yScale(i))
      .attr("width", staticBarWidth)
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => (d.Country ? colorScale(d.Country) : "transparent")); // Transparent for empty slots

    // Add larger square flags at the right end of the bars
    const flagSize = 40; // Increased size for square flags
    svg
      .selectAll(".flag")
      .data(chartData, (_, i) => i) // Key by index to maintain consistent slots
      .join("image")
      .attr("class", "flag")
      .attr("x", margin.left + staticBarWidth - flagSize) // Align to the right of the bar
      .attr("y", (_, i) => yScale(i) + (yScale.bandwidth() - flagSize) / 2) // Center vertically
      .attr("width", flagSize)
      .attr("height", flagSize)
      .attr("xlink:href", (d) => (d.Country ? flagData[d.Country] : "")) // URL of the flag
      .style("visibility", (d) => (d.Country ? "visible" : "hidden")); // Hide for empty slots

    // Add table-like text inside bars
    svg
      .selectAll(".bar-text")
      .data(chartData, (_, i) => i) // Key by index to maintain consistent slots
      .join("g")
      .attr("class", "bar-text-group")
      .attr("transform", (_, i) => `translate(${margin.left + 10}, ${yScale(i)})`)
      .each(function (d) {
        const group = d3.select(this);

        if (d.Country) {
          // First Row
          group
            .append("text")
            .attr("x", 10) // Left column
            .attr("y", yScale.bandwidth() / 4) // First row
            .style("fill", "white")
            .style("font-size", "12px")
            .text(`TotalCases: ${d.TotalCases}`);

          group
            .append("text")
            .attr("x", staticBarWidth / 2 - 70) // Adjust to fit text before the larger flag
            .attr("y", yScale.bandwidth() / 4) // First row
            .style("fill", "white")
            .style("font-size", "12px")
            .text(`NewCases: ${d.NewCases}`);
          // Second Row
          group
            .append("text")
            .attr("x", 10) // Left column
            .attr("y", (yScale.bandwidth() / 4) * 3) // Second row
            .style("fill", "white")
            .style("font-size", "12px")
            .text(`TotalDeaths: ${d.TotalDeath}`);
          group
            .append("text")
            .attr("x", staticBarWidth / 2 - 70) // Adjust to fit text before the larger flag
            .attr("y", (yScale.bandwidth() / 4) * 3) // Second row
            .style("fill", "white")
            .style("font-size", "12px")
            .text(`NewDeaths: ${d.NewDeath}`);
        
        }
      });
  }, [data, selectedDate, flagData]);

  return <svg ref={chartRef} width="600" height="400"></svg>; // Updated dimensions
};

export default RaisingBarChart;
