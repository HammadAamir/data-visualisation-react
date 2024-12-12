import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const EuropeEmissionsChart = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    // Load the CSV data
    d3.csv(process.env.PUBLIC_URL + "/co-emissions-per-capita.csv").then((data) => {
      // List of European countries (can be extended)
      const europeanCountries = [
        'Germany', 'France', 'United Kingdom', 'Italy', 'Spain',
        'Netherlands', 'Poland', 'Sweden', 'Norway', 'Finland',
        'Denmark', 'Portugal', 'Greece', 'Ireland', 'Austria',
        'Belgium', 'Switzerland', 'Czechia'
      ];

      // Filter data for European countries
      const filteredData = data
        .filter((d) => europeanCountries.includes(d['Entity']))
        .map((d) => ({
          country: d['Entity'],
          year: +d['Year'],
          emissions: +d['Annual_CO2_emissions_(per_capita)'],
        }));

      // Group data by country
      const groupedData = d3.group(filteredData, (d) => d.country);

      // Set dimensions and margins
      const width = 800;
      const height = 500;
      const margin = { top: 20, right: 50, bottom: 50, left: 70 };

      // Clear any previous content
      d3.select(svgRef.current).selectAll('*').remove();

      // Create the SVG container
      const svg = d3
        .select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Define scales
      const x = d3
        .scaleLinear()
        .domain(d3.extent(filteredData, (d) => d.year))
        .range([0, width]);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(filteredData, (d) => d.emissions)])
        .nice()
        .range([height, 0]);

      // Add X-axis
      svg
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')));

      // Add Y-axis
      svg.append('g').call(d3.axisLeft(y));

      // Add labels
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .text('Year');

      svg
        .append('text')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 15)
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .text('CO₂ Emissions per Capita (tons)');

      // Define line generator
      const line = d3
        .line()
        .x((d) => x(d.year))
        .y((d) => y(d.emissions));

      // Draw lines for each country
      const color = d3.scaleOrdinal(d3.schemeCategory10);

      groupedData.forEach((values, country) => {
        svg
          .append('path')
          .datum(values)
          .attr('fill', 'none')
          .attr('stroke', color(country))
          .attr('stroke-width', 2)
          .attr('d', line)
          .attr('opacity', 0)
          .transition()
          .duration(1000)
          .delay(Math.random() * 1000) // Staggered animation
          .attr('opacity', 1);
      });

      // Add legend
      const legend = svg.append('g').attr('transform', `translate(20, 0)`);

      let legendIndex = 0;
      groupedData.forEach((_, country) => {
        legend
          .append('rect')
          .attr('x', -5)
          .attr('y', legendIndex * 20)
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', color(country));

        legend
          .append('text')
          .attr('x', 15)
          .attr('y', legendIndex * 20 + 9)
          .text(country)
          .attr('font-size', '10px')
          .attr('alignment-baseline', 'middle');

        legendIndex++;
      });
    });
  }, []);

  return (
    <div>
      <h2>CO₂ Emissions per Capita in European Countries Over Time</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default EuropeEmissionsChart;
