import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import govData from './gov_reg_data.json';
import vaccineImage from './vaccination.png';
import homeImage from './home.webp';

function LineChart({ country, wave, globalMapData }) {
    const [lineChartData, setLineChartData] = useState([]);
    const [selectedMetric, setSelectedMetric] = useState("totalCases");
    const [policyType, setPolicyType] = useState("C6");
    const svgRef = useRef();
    const tooltipRef = useRef();

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
    
    const getRegulationData = (country, policyType) => {
        const countryData = govData[country];
        if (!countryData || !countryData[policyType]) return [];
        return countryData[policyType].map(({ startDate, endDate, initialNote }) => ({
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            note: initialNote,
        }));
    };

    // Line Chart
    useEffect(() => {
        if (lineChartData.length > 0) {
            const margin = { top: 40, right: 10, bottom: 60, left: 60 };
            const width = 730 - margin.left - margin.right;
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

            const iconPath = policyType === 'H7' 
                ? vaccineImage
                : homeImage;

            const icon = svg.append('image')
                .attr('xlink:href', iconPath)
                .attr('width', 30)
                .attr('height', 30)
                .attr('x', x(lineChartData[0].date) - 15)
                .attr('y', y(lineChartData[0][selectedMetric]) - 15)
                .style('pointer-events','all');

            // Create an icon to represent the draggable dot
            icon.call(d3.drag() // Make the circle draggable
                    .on('drag', (event) => {
                        const closestDate = x.invert(event.x);
                        const closestIndex = d3.bisector(d => d.date).left(lineChartData, closestDate);
                        const closestDataPoint = lineChartData[closestIndex];

                        if (closestDataPoint) {
                            // Update icon position
                            icon.attr('x', x(closestDataPoint.date) - 15)
                                .attr('y', y(closestDataPoint[selectedMetric]) - 15);

                            const regulationData = getRegulationData(country, policyType);
                            const tooltip = d3.select(tooltipRef.current);

                            let isPolicyActive = false;
                            regulationData.forEach(({ startDate, endDate, note }) => {
                                if (closestDataPoint.date >= startDate && closestDataPoint.date <= endDate) {
                                    isPolicyActive = true;
                                    tooltip
                                        .style('opacity', 1)
                                        .style('left', `${event.pageX - 50}px`)
                                        .style('top', `${event.pageY + 10}px`)
                                        .html(
                                            `<strong>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</strong><br/>
                                            ${note}`
                                        )
                                }
                            });

                            if (!isPolicyActive) {
                                tooltip.style('opacity', 0);
                            }
                        }
                    }));
            
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', -7)
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .text(`${country} - ${wave} (${selectedMetric.toUpperCase()})`);
        }
    }, [lineChartData, country, wave, selectedMetric, policyType]);

    useEffect(() => {
        if (country && wave && globalMapData) {
            const dataForWave = getWaveData(country, wave, globalMapData);
            setLineChartData(dataForWave);
        }
    }, [country, wave, globalMapData]);

    const handleMetricChange = (e) => {
        setSelectedMetric(e.target.value);
    };

    const handlePolicyChange = (e) => {
        setPolicyType(e.target.value);
    }

    return (
        <div>
            <label style={{ marginRight: '10px', display: 'inline-block' }}>
                Select Metric: 
                <select value={selectedMetric} onChange={handleMetricChange} style={{ marginLeft: '5px' }}>
                    <option value="totalCases"> Total Cases</option>
                    <option value="totalDeaths"> Total Deaths</option>
                </select>
            </label>
            <label style={{ marginLeft: '20px', display: 'inline-block' }}>
                Select Policy:
                <select value={policyType} onChange={handlePolicyChange} style={{ marginLeft: '5px' }}>
                    <option value="C6">Stay-at-Home Policy</option>
                    <option value="H7">Vaccination Policy</option>
                </select>
            </label>
            <div ref={svgRef}></div>
            <div ref={tooltipRef} style={{ position: "relative", opacity: 0, background: "#fff", padding: "5px", border: "1px solid #000", borderRadius: "5px", pointerEvents: "none" }}></div>
        </div>
    );
}

export default LineChart;