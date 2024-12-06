import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import monthlyData from './grouped_bar_chart_monthly_data.json';

function EconomyChart({ data }) {
    const [chartData, setChartData] = useState([]);
    const [selectedMetric, setSelectedMetric] = useState("manufacturing_pmi");
    const [detailedData, setDetailedData] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedWave, setSelectedWave] = useState(null);
    const [chartType, setChartType] = useState('groupedBarChart');
    const svgRef = useRef();

    const getChartData = useCallback((data) => {
        return data.map(d => ({
            country: d.country,
            wave1: parseFloat(d.wave1[selectedMetric]),
            wave2: parseFloat(d.wave2[selectedMetric]),
            wave3: parseFloat(d.wave3[selectedMetric]),
        }));
    }, [selectedMetric]);

    function getMetricDataForWave(country, wave, metric) {
        const waveDates = {
            wave1: [
                "2020-01-01", "2020-02-01", "2020-03-01", "2020-04-01"
            ],
            wave2: [
                "2020-05-01", "2020-06-01", "2020-07-01", "2020-08-01", "2020-09-01", "2020-10-01", "2020-11-01", "2020-12-01", "2021-01-01", "2021-02-01", "2021-03-01", "2021-04-01", "2021-05-01", "2021-06-01", "2021-07-01", "2021-08-01", "2021-09-01"
            ],
            wave3: [
                "2021-10-01", "2021-11-01", "2021-12-01", "2022-01-01", "2022-02-01", "2022-03-01", "2022-04-01", "2022-05-01"
            ]
        };

        if (monthlyData[country] && monthlyData[country][wave]) {
            const result = {};

            const waveData = monthlyData[country][wave];
            waveDates[wave].forEach(date => {
                if (waveData[date] && waveData[date][metric] !== undefined) {
                    if (!result[date]) result[date] = {};
                    result[date][metric] = waveData[date][metric];
                }
            });

            return {
                [country]: result
            };
        } 
    }

    const renderMonthlyChart = useCallback(() => {
        if (detailedData && selectedCountry && selectedWave) {
            const margin = { top: 40, right: 60, bottom: 40, left: 60 };
            const width = 1300 - margin.left - margin.right;
            const height = 500 - margin.top - margin.bottom;

            d3.select(svgRef.current).selectAll('*').remove();

            const svg = d3.select(svgRef.current)
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);
                
            const months = Object.keys(detailedData[selectedCountry]);
            const values = months.map(date => detailedData[selectedCountry][date][selectedMetric]);

            const x = d3.scaleBand()
                .domain(months)
                .rangeRound([0, width])
                .padding(0.1);

            const isConsumerConfidence = selectedMetric === "consumer_confidence";
            const yMax = d3.max(values);
            const yMin = d3.min(values);
            const n = isConsumerConfidence ? Math.max(Math.abs(yMax), Math.abs(yMin)) : yMax;

            const y = d3.scaleLinear()
                .domain(isConsumerConfidence ? [-n, n]: [0, n])
                .nice()
                .range([height, 0]);

            const xAxis = d3.axisBottom(x);
            const yAxis = d3.axisLeft(y);

            svg.append('g')
                .attr('transform', `translate(0, ${isConsumerConfidence ? y(0) : height})`)
                .call(xAxis)
                .selectAll('text')
                .remove();

            svg.append('g')
                .call(yAxis);

            const colorScale = d3.scaleOrdinal()
                .domain(['wave1', 'wave2', 'wave3'])
                .range(d3.schemeBuGn[3]);

            svg.append('g')
                .selectAll('rect')
                .data(months)
                .enter()
                .append('rect')
                .attr('x', (d) => x(d))
                .attr('y', (d, i) => {
                    const value = values[i];
                    return isConsumerConfidence ? (value < 0 ? y(0) : y(value)) : y(value);
                })
                .attr('width', x.bandwidth())
                .attr('height', (d, i) => {
                    const value = values[i];
                    return isConsumerConfidence ? Math.abs(y(value) - y(0)) : Math.abs(y(value) - y(0));
                })
                .attr('fill', (d) => colorScale(selectedWave))
                .on('mouseover', function(event, d) {
                    const [x, y] = d3.pointer(event, svg.node());
                    // Remove any previous tooltips to avoid stacking
                    svg.select('#tooltip').remove();
                    svg.select('#tooltip-bg').remove();

                    const monthIndex = months.indexOf(d);
                    const value = values[monthIndex];

                    // Create the background rectangle for the tooltip
                    svg.append('rect')
                        .attr('id', 'tooltip-bg')
                        .attr('x', x - 20)
                        .attr('y', y - 25)
                        .attr('width', 40)
                        .attr('height', 20)
                        .attr('fill', 'white')
                        .attr('opacity', 0.7)
                        .attr('stroke', 'black')
                        .attr('rx', 4);
                    // Create the tooltip text
                    svg.append('text')
                        .attr('id', 'tooltip')
                        .attr('x', x)
                        .attr('y', y - 10)
                        .attr('text-anchor', 'middle')
                        .style('font-size', '12px')
                        .style('font-weight', 'bold')
                        .style('fill', 'black')
                        .text(value);
                })
                .on('mouseout', () => {
                    svg.select('#tooltip').remove();
                    svg.select('#tooltip-bg').remove();
                });

            svg.append('g')
               .selectAll('text')
               .data(months)
               .enter()
               .append('text')
               .attr('x', (d) => x(d) + x.bandwidth() / 2)
               .attr('y', (d, i) => {
                    const value = values[i];
                    if (isConsumerConfidence) {
                        if (value < 0) {
                            return y(0) - 5;
                        } else {
                            return y(0) + 15;
                        }
                    } else {
                        return height + 15;
                    }
               })
               .attr('text-anchor', 'middle')
               .style('font-size', '12px')
               .text(d => d);

            // Add the country name as a title for the chart
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', 0)
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .text(`${selectedCountry}, ${selectedWave}`);
        }
    },[detailedData, selectedCountry, selectedMetric, selectedWave]);

    // Render the grouped bar chart
    const renderGroupedBarChart = useCallback(() => {
        if (chartData.length > 0) {
            const margin = { top: 40, right: 60, bottom: 40, left: 60 };
            const width = 1300 - margin.left - margin.right;
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

            // Range of y-axis, so it also includes negative values for consumer confidence
            const isConsumerConfidence = selectedMetric === "consumer_confidence";
            const yMax = d3.max(chartData, (d) => Math.max(d.wave1, d.wave2, d.wave3));
            const yMin = d3.min(chartData, (d) => Math.min(d.wave1, d.wave2, d.wave3));
            const n = isConsumerConfidence ? Math.max(Math.abs(yMax), Math.abs(yMin)) : yMax; // Ensure symmetric range

            const y = d3.scaleLinear()
                .domain(isConsumerConfidence ? [-n, n]: [0, n])
                .nice()
                .range([height, 0]);

            const xAxis = d3.axisBottom(x0);
            const yAxis = d3.axisLeft(y);

            svg.append('g')
                .attr('transform', `translate(0, ${isConsumerConfidence ? y(0) : height})`)
                .call(xAxis)
                .selectAll('text')
                .remove();

            svg.append('g')
                .call(yAxis);

            // Create the grouped bars for each wave
            const colorScale = d3.scaleOrdinal()
                .domain(['wave1', 'wave2', 'wave3'])
                .range(d3.schemeBuGn[3]);

            // Zero line
            if (isConsumerConfidence) {
                svg.append('line')
                    .attr('x1', 0)
                    .attr('x2', width)
                    .attr('y1', y(0))
                    .attr('y2', y(0))
                    .attr('stroke', '#000')
                    .attr('stroke-width', 1)
                    .attr('stroke-dasharray', '4 4');
            }

            svg.append('g')
                .selectAll('g')
                .data(chartData)
                .enter()
                .append('g')
                .attr('transform', (d) => `translate(${x0(d.country)}, 0)`)
                .selectAll('rect')
                .data(d => ['wave1', 'wave2', 'wave3'].map(wave => ({ wave, value: d[wave], country: d.country })))
                .enter()
                .append('rect')
                .attr('x', (d) => x1(d.wave))
                .attr('y', (d) => Math.min(y(0), y(d.value)))
                .attr('width', x1.bandwidth())
                .attr('height', (d) => Math.abs(y(d.value) - y(0)))
                .attr('fill', (d) => colorScale(d.wave))
                .on('mouseover', function(event, d) {
                    const [x, y] = d3.pointer(event, svg.node());
                    svg.append('rect')
                       .attr('id', 'tooltip-bg')
                       .attr('x', x - 20)
                       .attr('y', y - 25)
                       .attr('width', 40)
                       .attr('height', 20)
                       .attr('fill', 'white')
                       .attr('opacity', 0.7)
                       .attr('stroke', 'black')
                       .attr('rx', 4);
                    svg.append('text')
                       .attr('id', 'tooltip')
                       .attr('x', x)
                       .attr('y', y - 10)
                       .attr('text-anchor', 'middle')
                       .style('font-size', '12px')
                       .style('font-width', 'bold')
                       .style('fill', 'black')
                       .text(d.value);
                })
                .on('mouseout', () => {
                    svg.select('#tooltip').remove();
                    svg.select('#tooltip-bg').remove();
                })
                .on('click', (event, d) => {
                    const processedData = getMetricDataForWave(d.country, d.wave, selectedMetric);
                    setSelectedCountry(d.country);
                    setSelectedWave(d.wave);
                    setDetailedData(processedData);
                    setChartType('monthlyChart');
                })
                .style("cursor", "pointer");
            
            // Add country labels
            svg.append('g')
                .selectAll('text')
                .data(chartData)
                .enter()
                .append('text')
                .attr('x', (d) => x0(d.country) + x0.bandwidth() / 2)
                .attr('y', (d) => {
                    if (isConsumerConfidence) {
                        if (d3.min(['wave1', 'wave2', 'wave3'].map(w => d[w])) < 0) {
                            return y(0) - 5;
                        } else {
                            return y(0) + 15;
                        }
                    } else {
                        return height + 15;
                    }
                })
                .attr('text-anchor', 'middle')
                .style('font-size', '12px')
                .text((d) => d.country);
                
            // Legend
            const legend = svg.append('g')
                .attr('transorm', `translate(${width - 200}, ${margin.top})`);

            const legendData = ['wave1', 'wave2', 'wave3'];

            legend.selectAll('rect')
                .data(legendData)
                .enter()
                .append('rect')
                .attr('x', width)
                .attr('y', (d, i) => i * 20)
                .attr('width', 15)
                .attr('height', 15)
                .attr('fill', (d) => colorScale(d));

            legend.selectAll('text')
                .data(legendData)
                .enter()
                .append('text')
                .attr('x', width + 20)
                .attr('y', (d, i) => i * 20 + 12)
                .style('font-size', '12px')
                .text((d) => d);
        }
    }, [chartData, selectedMetric]);
    
    useEffect(() => {
        if (data) {
            const formattedData = getChartData(data);
            setChartData(formattedData);
        }
    }, [data, getChartData]);

    useEffect(() => {
        if (chartType === 'monthlyChart') {
            renderMonthlyChart();
            
        } else if (chartType === 'groupedBarChart') {
            renderGroupedBarChart();
        }
    },[chartType, renderMonthlyChart, renderGroupedBarChart]);

    const handleMetricChange = (e) => {
        const processedData = getMetricDataForWave(selectedCountry, selectedWave, e.target.value);
        setDetailedData(processedData);
        if (chartType === "monthlyChart") setChartType('monthlyChart');
        else setChartType('groupedBarChart');
        setSelectedMetric(e.target.value);
    };


    return (
        <div>
            <label>
                Select Metric:
                <select value={selectedMetric} onChange={handleMetricChange} style={{ marginLeft: '5px' }}>
                    <option value="manufacturing_pmi">Manufacturing PMI</option>
                    <option value="services_pmi">Services PMI</option>
                    <option value="consumer_confidence">Consumer Confidence</option>
                </select>
            </label>
            <div ref={svgRef}></div>
            <button
                style={{
                    padding: '10px 20px',
                    fontSize: '12px',
                    borderRadius: '10px',
                    backgroundColor: 'grey',
                    color: 'white',
                    border: 'none',
                    curson: 'pointer',
                    transition: 'background-color 0.3s',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'green'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'grey'}
                onClick={() => setChartType('groupedBarChart')}
            >
            Click Refresh to go back 
            </button>
        </div>
    )
}

export default EconomyChart;