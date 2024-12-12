import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RaceBarChart = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    d3.csv(process.env.PUBLIC_URL + '/co-emissions-per-capita.csv').then((data) => {
      const parsedData = data.map((d) => ({
        country: d['Entity'],
        year: +d['Year'],
        emissions: +d['Annual_CO2_emissions_(per_capita)'],
      }));

      const dataByYear = d3.group(parsedData, (d) => d.year);

      const width = 900;
      const height = 500;
      const margin = { top: 30, right: 10, bottom: 10, left: 50 };

      d3.select(svgRef.current).selectAll('*').remove();

      const svg = d3
        .select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3.scaleLinear().range([0, width]);
      const y = d3.scaleBand().range([0, height]).padding(0.1);
      const color = d3.scaleOrdinal(d3.schemeTableau10);

      const xAxis = svg.append('g').attr('transform', `translate(0,${height})`);
      const yAxis = svg.append('g');

      // Add text element for the year
      const yearText = svg
        .append('text')
        .attr('class', 'year-label')
        .attr('x', width / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '24px')
        .attr('font-weight', 'bold');

      const updateChart = (year) => {
        const yearData = dataByYear.get(year) || [];
        const topEmitters = yearData
          .filter((d) => !isNaN(d.emissions))
          .sort((a, b) => b.emissions - a.emissions)
          .slice(0, 10);

        x.domain([0, d3.max(topEmitters, (d) => d.emissions)]);
        y.domain(topEmitters.map((d) => d.country));

        xAxis.transition().call(d3.axisBottom(x));
        yAxis.transition().call(d3.axisLeft(y));

        const bars = svg.selectAll('.bar').data(topEmitters, (d) => d.country);

        bars
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', 0)
          .attr('y', (d) => y(d.country))
          .attr('height', y.bandwidth())
          .attr('width', 0)
          .attr('fill', (d) => color(d.country))
          .transition()
          .duration(500)
          .attr('width', (d) => x(d.emissions));

        bars
          .transition()
          .duration(500)
          .attr('y', (d) => y(d.country))
          .attr('height', y.bandwidth())
          .attr('width', (d) => x(d.emissions))
          .attr('fill', (d) => color(d.country));

        bars.exit().transition().duration(500).attr('width', 0).remove();

        svg
          .selectAll('.label')
          .data(topEmitters, (d) => d.country)
          .join(
            (enter) =>
              enter
                .append('text')
                .attr('class', 'label')
                .attr('x', (d) => x(d.emissions) + 5)
                .attr('y', (d) => y(d.country) + y.bandwidth() / 2)
                .attr('dy', '.35em')
                .text((d) => d.emissions.toFixed(2)),
            (update) =>
              update
                .transition()
                .duration(500)
                .attr('x', (d) => x(d.emissions) + 5)
                .attr('y', (d) => y(d.country) + y.bandwidth() / 2)
                .text((d) => d.emissions.toFixed(2)),
            (exit) => exit.remove()
          );

        // Update the year label
        yearText.text(`Year: ${year}`);
      };

      const years = Array.from(dataByYear.keys()).sort((a, b) => a - b);
      let yearIndex = 0;

      const interval = setInterval(() => {
        updateChart(years[yearIndex]);
        yearIndex = (yearIndex + 1) % years.length;
      }, 1000);

      return () => clearInterval(interval);
    });
  }, []);

  return (
    <div>
      <h2>Top CO₂ Emitters Over Time</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RaceBarChart;
