import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const WorldMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    const width = 960;
    const height = 600;

    const svg = d3.select(mapRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const projection = d3.geoNaturalEarth1()
      .scale(180)
      .translate([width / 2 - 50, height / 2]);

    const path = d3.geoPath()
      .projection(projection);

    d3.json(process.env.PUBLIC_URL + "/countries-110m.json")
      .then(function(world) {
        d3.csv(process.env.PUBLIC_URL + "/co-emissions-per-capita.csv")
          .then(function(data) {
            const countries = topojson.feature(world, world.objects.countries).features;

            // Join the emission data to the GeoJSON features
            countries.forEach(country => {
              const countryData = data.find(d => d.Entity === country.properties.name);
              console.log(countryData)
              console.log(countryData ? countryData['Annual_CO2_emissions_(per_capita)'] * 100 : 0)
              country.properties.emissions = countryData ? countryData['Annual_CO2_emissions_(per_capita)'] * 100 : 0;
            });

            // Create a color scale
            const colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, d3.max(countries, d => d.properties.emissions)]);

            // Tooltip
            const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip-donut")
            .style("opacity", 0);

            svg.selectAll("path")
              .data(countries)
              .enter()
              .append("path")
              .attr("d", path)
              .attr("fill", d => colorScale(d.properties.emissions))
              .attr("stroke", "#fff")
              .attr("stroke-width", 0.5)
              .on("mouseover", function(event, d) {
                tooltip.transition()
                  .duration(200)
                  .style("opacity", 1);
                tooltip.html(`
                  <strong>${d.properties.name}</strong><br/>
                  CO2 Emissions: ${d.properties.emissions}
                `)
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 10) + "px");
              })
              .on("mouseout", function() {
                tooltip.transition()
                  .duration(500)
                  .style("opacity", 0);
              });
          });
      });
  }, []);

  return (
    <div ref={mapRef}></div>
  );
};
export default WorldMap;