import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

function EconomyChart({ data }) {
    const [chartData, setChartData] = useState([]);
    const [selectedMetric, setSelectedMetric] = useState("manufacturing_pmi");
    const svgRef = useRef();

    const getChartData = useCallback((data) => {
        return data.map(d => ({
            country: d.country,
            wave1: parseFloat(d.wave1[selectedMetric]),
            wave2: parseFloat(d.wave2[selectedMetric]),
            wave3: parseFloat(d.wave3[selectedMetric]),
        }));
    }, [selectedMetric]);

    // Render the grouped bar chart
    useEffect(() => {
        if (chartData.length > 0) {
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

            // Set up the x-axis scales for countries and waves
            const x0 = d3.scaleBand()
                .domain(chartData.map(d => d.country))
                .rangeRound([0, width])
                .padding(0.1);

            const x1 = d3.scaleBand()
                .domain(['wave1', 'wave2', 'wave3'])
                .rangeRound([0, x0.bandwidth()])
                .padding(0.05);

            const y = d3.scaleLinear()
                .domain([0, d3.max(chartData, (d) => Math.max(d.wave1, d.wave2, d.wave3))])
                .nice()
                .range([height, 0]);

            const xAxis = d3.axisBottom(x0);
            const yAxis = d3.axisLeft(y);

            svg.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis);

            svg.append('g')
                .call(yAxis);

            // Create the grouped bars for each wave
            const colorScale = d3.scaleOrdinal()
                .domain(['wave1', 'wave2', 'wave3'])
                .range(d3.schemeBuGn[3]);

            svg.append('g')
                .selectAll('g')
                .data(chartData)
                .enter()
                .append('g')
                .attr('transform', (d) => `translate(${x0(d.country)}, 0)`)
                .selectAll('rect')
                .data(d => ['wave1', 'wave2', 'wave3'].map(wave => d[wave]))
                .enter()
                .append('rect')
                .attr('x', (d, i) => x1(['wave1', 'wave2', 'wave3'][i]))
                .attr('y', (d) => y(d))
                .attr('width', x1.bandwidth())
                .attr('height', (d) => height - y(d))
                .attr('fill', (d, i) => colorScale(['wave1', 'wave2', 'wave3'][i]));

            // Add title
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', -7)
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .text(`${selectedMetric} by Wave`);
            
        }
    }, [chartData, selectedMetric]);

    useEffect(() => {
        if (data) {
            const formattedData = getChartData(data);
            setChartData(formattedData);
        }
    }, [data, getChartData]);

    const handleMetricChange = (e) => {
        setSelectedMetric(e.target.value);
    };


    return (
        <div>
            <label>
                Select Metric:
                <select value={selectedMetric} onChange={handleMetricChange}>
                    <option value="manufacturing_pmi">Manufacturing PMI</option>
                    <option value="services_pmi">Services PMI</option>
                    <option value="consumer_confidence">Consumer Confidence</option>
                </select>
            </label>
            <div ref={svgRef}></div>
        </div>
    )
}

export default EconomyChart;