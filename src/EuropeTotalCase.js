import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";


function MultiLineChart({ europeanCountries, globalMapData, onWaveChange }) {
    const chartRefs = useRef([]);
    const [selectedWave, setSelectedWave] = useState('wave1');

    const getWaveData = (country, wave, globalMapData) => {
        const waveData = globalMapData[wave];
        if (!waveData) return[];

        const countryData = Object.entries(waveData).reduce((acc, [date, countries]) => {
            const countryInfo = countries[country];
            const currentDate = new Date(date);

            if (countryInfo) {
                acc.push({
                    date: new Date(currentDate.setDate(currentDate.getDate() + 1)),
                    totalCases: countryInfo.TotalCases,
                });
            }
            return acc;
        }, []);

        countryData.sort((a,b) => a.date - b.date);
        return countryData;
    };

    useEffect(() => {
        if (europeanCountries.length > 0 && globalMapData) {
            europeanCountries.forEach((country, index) => {
                const lineChartData = getWaveData(country, selectedWave, globalMapData);

                const margin = { top: 20, right: 50, bottom: 55, left: 60 };
                const width = 300 - margin.left - margin.right;
                const height = 200 - margin.top - margin.bottom;

                d3.select(chartRefs.current[index]).selectAll("*").remove();

                const svg = d3.select(chartRefs.current[index])
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);

                const x = d3.scaleTime()
                    .domain(d3.extent(lineChartData, (d) => d.date))
                    .range([0, width]);

                const y = d3.scaleLinear()
                    .domain([0, d3.max(lineChartData, (d) => d.totalCases)])
                    .range([height, 0]);

                const xAxis = d3.axisBottom(x)
                    .tickFormat(d3.timeFormat("%b %Y"))
                    .ticks(d3.timeMonth.every(1));

                svg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(xAxis)
                    .selectAll(".tick text")
                    .remove();

                svg.append("g").call(d3.axisLeft(y));

                svg.append("path")
                    .data([lineChartData])
                    .attr("fill", "none")
                    .attr("stroke", "red")
                    .attr("stroke-width", 2)
                    .attr(
                        "d",
                        d3.line()
                            .x((d) => x(d.date))
                            .y((d) => y(d.totalCases))
                    );
    
                svg.append("text")
                    .attr("x", width / 2)
                    .attr("y", -10)
                    .attr("text-anchor", "middle")
                    .style("font-size", "12px")
                    .text(`${country} - ${selectedWave}`);
            });
        }
    }, [europeanCountries, selectedWave, globalMapData]);

    const handleWaveChange = (event) => {
        onWaveChange(event.target.value);
        setSelectedWave(event.target.value);
    }
    
    return (
        <div>
            <label>
                Select Wave:
                <select value={selectedWave} onChange={handleWaveChange} 
                style={{
                    fontSize: "15px",
                    padding: "5px",
                    height: "30px",
                    borderRadius: "5px",
                    marginBottom: "20px",
                    marginLeft: '5px',
                }}
                >
                    <option value="wave1"> Wave 1 </option>
                    <option value="wave2"> Wave 2 </option>
                    <option value="wave3"> Wave 3 </option>
                </select>
            </label>
            <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "20px",
            }}
            >
            {europeanCountries.map((country, index) => (
                <div
                    key={country}
                    ref={(el) => (chartRefs.current[index] = el)}
                    style={{ 
                        border: "1px solid #ddd", 
                        padding: "10px", 
                        borderRadius: "3px",
                        width: "auto",
                        height: "auto",
                        maxWidth: "250px",
                        maxHeight: "150px",
                    }}
                ></div>
            ))}
            </div>
        </div>
    );
}
    
export default MultiLineChart;
