import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

const AlluvialDiagram = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    // Data for the alluvial diagram
    const data = {
      nodes: [
        { name: "Stage A" },
        { name: "Stage B" },
        { name: "Stage C" },
        { name: "Stage D" },
      ],
      links: [
        { source: 0, target: 1, value: 50 },
        { source: 0, target: 2, value: 30 },
        { source: 1, target: 3, value: 70 },
        { source: 2, target: 3, value: 10 },
      ],
    };

    // Dimensions
    const width = 600;
    const height = 400;

    // Clear previous SVG content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create a Sankey generator
    const sankeyGenerator = sankey()
      .nodeWidth(20)
      .nodePadding(10)
      .extent([
        [0, 0],
        [width, height],
      ]);

    // Prepare Sankey data
    const sankeyData = sankeyGenerator({
      nodes: data.nodes.map((d) => ({ ...d })),
      links: data.links.map((d) => ({ ...d })),
    });

    const { nodes, links } = sankeyData;

    // Draw links
    svg
      .append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', '#888')
      .attr('stroke-width', (d) => Math.max(1, d.width))
      .attr('opacity', 0.7);

    // Draw nodes
    svg
      .append('g')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('fill', '#69b3a2')
      .attr('stroke', '#000');

    // Add node labels
    svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', (d) => d.x0 - 6)
      .attr('y', (d) => (d.y1 + d.y0) / 2)
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'middle')
      .text((d) => d.name)
      .style('font-size', '12px')
      .style('fill', 'black');
  }, []);

  return (
    <div>
      <h2>Simple Alluvial Diagram</h2>
      <svg ref={svgRef} width="600" height="400"></svg>
    </div>
  );
};

export default AlluvialDiagram;
