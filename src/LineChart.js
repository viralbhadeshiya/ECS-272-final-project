import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function LineChart({ country, wave, globalMapData }) {
    const [lineChartData, setLineChartData] = useState([]);
    const [selectedMetric, setSelectedMetric] = useState("totalCases");
    const svgRef = useRef();

    // Helper function to filter the data for the selected Country & Wave
    const getWaveData = (country, wave, globalMapData) => {
        const waveData = globalMapData[wave];

        if (!waveData) return [];

        const countryData = Object.entries(waveData).reduce((acc, [date, countries]) => {
            const countryInfo = countries[country];
            const currentDate = new Date(date);

            if (countryInfo) {
                acc.push({
                    date: new Date(currentDate.setDate(currentDate.getDate() + 1)),
                    totalCases: countryInfo.TotalCases,
                    totalDeaths: countryInfo.TotalDeath,
                });
            }
            return acc;
        }, []);

        countryData.sort((a,b) => a.date - b.date);

        return countryData;
    };

    // Line Chart
    useEffect(() => {
        if (lineChartData.length > 0) {
            const margin = { top: 40, right: 30, bottom: 60, left: 60 };
            const width = 800 - margin.left - margin.right;
            const height = 500 - margin.top - margin.bottom;

            d3.select(svgRef.current).selectAll('*').remove();

            const svg = d3.select(svgRef.current)
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);

            const x = d3.scaleTime()
                .domain(d3.extent(lineChartData, (d) => d.date))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(lineChartData, (d) => d[selectedMetric])])
                .range([height, 0]);
            
            const xAxis = d3.axisBottom(x)
                .tickFormat(d3.timeFormat("%b %Y"));

            const xAxisGroup = svg.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis)

            xAxisGroup.selectAll('text')
                .style('text-anchor', 'middle')
                .attr('transform', 'rotate(90)')
                .attr('dx', 30)
                .attr('dy', -5);

            svg.append('g')
                .call(d3.axisLeft(y));

            // Line for Total Cases OR Total Deaths
            svg.append('path')
                .data([lineChartData])
                .attr('fill', 'none')
                .attr('stroke', selectedMetric === "totalCases" ? 'red' : 'blue')
                .attr('stroke-width', 2)
                .attr('d', d3.line()
                    .x((d) => x(d.date))
                    .y((d) => y(d[selectedMetric]))
                );
            
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', -7)
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .text(`${country} - ${wave} (${selectedMetric.toUpperCase()})`);
        }
    }, [lineChartData, country, wave, selectedMetric]);

    useEffect(() => {
        if (country && wave && globalMapData) {
            const dataForWave = getWaveData(country, wave, globalMapData);
            // console.log(`Filtered data for ${country} in wave ${wave}:`, dataForWave);
            setLineChartData(dataForWave);
        }
    }, [country, wave, globalMapData]);

    const handleMetricChange = (e) => {
        setSelectedMetric(e.target.value);
    };

    return (
        <div>
            <label>
                Select Metric: 
                <select value={selectedMetric} onChange={handleMetricChange}>
                    <option value="totalCases"> Total Cases</option>
                    <option value="totalDeaths"> Total Deaths</option>
                </select>
            </label>
            <div ref={svgRef}></div>
        </div>
    );
}

export default LineChart;