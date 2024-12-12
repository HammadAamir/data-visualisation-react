import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CountryEmissionsChart = ({ country }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    // Load the CSV data
    d3.csv(process.env.PUBLIC_URL + "/co-emissions-per-capita.csv").then((data) => {
      // Filter data for the selected country and years 2012 to 2022
      const filteredData = data
        .filter((d) => d['Entity'] === country && +d['Year'] >= 2012 && +d['Year'] <= 2022)
        .map((d) => ({
          year: d['Year'],
          emissions: +d['Annual_CO2_emissions_(per_capita)'],
        }));

      // Set dimensions and margins for the chart
      const width = 800;
      const height = 400;
      const margin = { top: 20, right: 30, bottom: 40, left: 60 };

      // Create scales for x and y axes
      const x = d3
        .scaleBand()
        .domain(filteredData.map((d) => d.year))
        .range([0, width])
        .padding(0.1);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(filteredData, (d) => d.emissions)])
        .range([height, 0]);

      // Clear any previous SVG content if it exists
      d3.select(svgRef.current).selectAll('*').remove();

      // Create the SVG container
      const svg = d3
        .select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Add X-axis
      svg
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

      // Add Y-axis
      svg.append('g').call(d3.axisLeft(y));

      // Create bars for the chart
      svg
        .selectAll('rect')
        .data(filteredData)
        .enter()
        .append('rect')
        .attr('x', (d) => x(d.year))
        .attr('y', (d) => y(d.emissions))
        .attr('width', x.bandwidth())
        .attr('height', (d) => height - y(d.emissions))
        .attr('fill', '#4285F4');
    });
  }, [country]);

  return (
    <div>
      <h2>CO₂ Emissions per Capita in {country} (2012-2022)</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default CountryEmissionsChart;
