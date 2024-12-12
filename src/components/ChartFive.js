import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CO2Heatmap = ({ year }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    // Load the CSV data
    d3.csv(process.env.PUBLIC_URL + '/co2-fossil-plus-land-use.csv').then((data) => {
      // Filter data for the specified year and calculate total emissions
      const filteredData = data
        .filter((d) => +d['Year'] === year)
        .map((d) => ({
          entity: d['Entity'],
          fossilEmissions: +d['Annual_CO₂_emissions'],
          landUseEmissions: +d['Annual_CO₂_emissions_from_land-use_change'],
          totalEmissions: +d['Annual_CO₂_emissions'] + +d['Annual_CO₂_emissions_from_land-use_change'],
        }))
        .sort((a, b) => b.totalEmissions - a.totalEmissions)
        .slice(0, 10);

      // Set dimensions and margins for the heatmap
      const width = 600;
      const height = 400;
      const margin = { top: 50, right: 30, bottom: 40, left: 100 };

      // Clear any previous SVG content
      d3.select(svgRef.current).selectAll('*').remove();

      // Create the SVG container
      const svg = d3
        .select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Define scales for the x-axis (emission type) and y-axis (countries)
      const x = d3
        .scaleBand()
        .domain(['Fossil Fuel Emissions', 'Land-Use Change Emissions'])
        .range([0, width])
        .padding(0.05);

      const y = d3
        .scaleBand()
        .domain(filteredData.map((d) => d.entity))
        .range([0, height])
        .padding(0.05);

      // Define color scale for the heatmap
      const colorScale = d3
        .scaleSequential(d3.interpolateOrRd)
        .domain([0, d3.max(filteredData, (d) => Math.max(d.fossilEmissions, d.landUseEmissions))]);

      // Add x-axis
      svg
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

      // Add y-axis
      svg.append('g').call(d3.axisLeft(y));

      // Create the heatmap cells
      svg
        .selectAll('rect')
        .data(filteredData.flatMap((d) => [
          { entity: d.entity, type: 'Fossil Fuel Emissions', value: d.fossilEmissions },
          { entity: d.entity, type: 'Land-Use Change Emissions', value: d.landUseEmissions },
        ]))
        .enter()
        .append('rect')
        .attr('x', (d) => x(d.type))
        .attr('y', (d) => y(d.entity))
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .attr('fill', (d) => colorScale(d.value));
    });
  }, [year]);

  return (
    <div>
      <h2>CO₂ Emissions Heatmap (Top 10 Countries) - {year}</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default CO2Heatmap;
