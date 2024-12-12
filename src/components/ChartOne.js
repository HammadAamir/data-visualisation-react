import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Define chart dimensions
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };

    // Clear any existing SVG content
    d3.select(chartRef.current).selectAll("*").remove();

    // Create an SVG element in the chartRef container
    const svg = d3
      .select(chartRef.current)
      .attr("width", width)
      .attr("height", height);

    // Load and process the CSV data
    d3.csv(process.env.PUBLIC_URL + "/co-emissions-per-capita.csv").then((data) => {
      // Filter and sort data to get the top 10 countries by emissions in the latest year
      const filteredData = data
        .filter((d) => d["Year"] === "2019") // Filter for the year 2019 or latest year available
        .sort((a, b) => +b["Annual_CO2_emissions_(per_capita)"] - +a["Annual_CO2_emissions_(per_capita)"])
        .slice(0, 10);

      // Create scales for x and y axes
      const x = d3
        .scaleBand()
        .domain(filteredData.map((d) => d["Entity"]))
        .range([margin.left, width - margin.right])
        .padding(0.1);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(filteredData, (d) => +d["Annual_CO2_emissions_(per_capita)"]) || 0])
        .nice()
        .range([height - margin.bottom, margin.top]);

      // Tooltip
      const div = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip-donut")
        .style("opacity", 0);

      // Add X axis to the chart
      svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

      // Add Y axis to the chart
      svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(10));

      // Add bars
      svg
        .selectAll(".bar")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d["Entity"]) || 0)
        .attr("y", (d) => y(+d["Annual_CO2_emissions_(per_capita)"]))
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - margin.bottom - y(+d["Annual_CO2_emissions_(per_capita)"]))
        .attr("fill", "steelblue")
        .on("mouseover", function (event, d) {
          div.transition().duration(50).style("opacity", 1);
          div
            .html(
              `<b>${d["Annual_CO2_emissions_(per_capita)"]}</b><p>${d.Entity}</p>`
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 15 + "px");

          d3.select(this)
            .style("transform", "scale(1.02,1.02)")
            .style("transform-origin", "50% 50%")
            .transition()
            .duration(200)
            .style("fill", "purple");
        })
        .on("mouseout", function () {
          d3.select(this)
            .style("transform", "scale(1,1)")
            .style("transform-origin", "50% 50%")
            .transition()
            .duration(500)
            .style("fill", "steelblue");

          div.transition().duration(100).style("opacity", 0);
        });

      // Add chart title
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Top 10 Countries by CO₂ Emissions per Capita (2019)");
    });
  }, []);

  return <svg ref={chartRef}></svg>;
};

export default BarChart;
