import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const RaisingBarChart = ({ data, selectedDate }) => {
  const chartRef = useRef();

  useEffect(() => {
    if (!data[selectedDate]) return;

    const svg = d3.select(chartRef.current);
    const width = 600; // Increased width for larger chart
    const height = 400; // Increased height for larger chart
    const margin = { top: 20, right: 30, bottom: 40, left: 150 };
    const staticBarWidth = width - margin.left - margin.right; // Fixed bar width

    // Clear previous chart
    svg.selectAll("*").remove();

    const chartData = data[selectedDate].slice(0, 5); // Top 5 countries
    const yScale = d3
      .scaleBand()
      .domain(chartData.map((d) => d.Country))
      .range([margin.top, height - margin.bottom])
      .padding(0.2);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const yAxis = d3.axisLeft(yScale);

    // Add Y-axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);

    // Draw bars with fixed length
    svg
      .selectAll(".bar")
      .data(chartData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", margin.left)
      .attr("y", (d) => yScale(d.Country))
      .attr("width", staticBarWidth)
      .attr("height", yScale.bandwidth())
      .attr("fill", (d, i) => colorScale(i));

    // Add table-like text inside bars
    svg
      .selectAll(".bar-text")
      .data(chartData)
      .join("g")
      .attr("class", "bar-text-group")
      .attr("transform", (d) => `translate(${margin.left}, ${yScale(d.Country)})`)
      .each(function (d) {
        const group = d3.select(this);

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
          .attr("x", staticBarWidth / 2) // Right column
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
          .attr("x", staticBarWidth / 2) // Right column
          .attr("y", (yScale.bandwidth() / 4) * 3) // Second row
          .style("fill", "white")
          .style("font-size", "12px")
          .text(`NewDeaths: ${d.NewDeath}`);
      });
  }, [data, selectedDate]);

  return <svg ref={chartRef} width="600" height="400"></svg>; // Updated dimensions
};

export default RaisingBarChart;
