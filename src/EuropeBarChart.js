import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import data from './grouped_bar_chart_monthly_data.json';

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

    if (data[country] && data[country][wave]) {
        const result = {};

        const waveData = data[country][wave];
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

const BarCharts = ({ wave }) => {
    const svgRef1 = useRef(null);
    const svgRef2 = useRef(null);
    const svgRef3 = useRef(null);

    useEffect(() => {
        const renderBarChart = (detailedData, svgRef, metric, chartTitle) => {
            const margin = { top: 20, right: 0, bottom: 10, left: 50 };
            const width = svgRef.current.clientWidth - margin.left - margin.right;
            const height = svgRef.current.clientHeight - margin.top - margin.bottom;

            d3.select(svgRef.current).selectAll('*').remove();

            const svg = d3.select(svgRef.current)
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const months = Object.keys(detailedData["europe"]);
            const values = months.map(date => detailedData["europe"][date][metric]);

            const x = d3.scaleBand()
                .domain(months)
                .rangeRound([0, width])
                .padding(0.1);

            const isConsumerConfidence = metric === "consumer_confidence";
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
                .attr('fill', (d) => colorScale(wave))
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

            svg.append('text')
               .attr('x', width / 2)
               .attr('y', -10)
               .attr('text-anchor', 'middle')
               .style('font-size', '14px')
               .text(chartTitle);
        };

        const man_pmi = getMetricDataForWave("europe", wave, 'manufacturing_pmi');
        renderBarChart(man_pmi, svgRef1, 'manufacturing_pmi', `Europe ${wave} Manufacturing PMI`);
        const serv_pmi = getMetricDataForWave("europe", wave, 'services_pmi');
        renderBarChart(serv_pmi, svgRef2, 'services_pmi', `Europe ${wave} Services PMI`);
        const cons_conf = getMetricDataForWave("europe", wave, 'consumer_confidence');
        renderBarChart(cons_conf, svgRef3, 'consumer_confidence', `Europe ${wave} Consumer Confidence`);
    },[wave]);

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between'}}>
            <div style={{ flex: 1, margin: '0 20px' }}>
                <svg ref={svgRef1}></svg>
            </div>
            <div style={{ flex: 1, margin: '0 20px' }}>
                <svg ref={svgRef2}></svg>
            </div>
            <div style={{ flex: 1, margin: '0 20px' }}>
                <svg ref={svgRef3}></svg>
            </div>
        </div>
    )
};

export default BarCharts;