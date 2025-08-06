export class ElementMapper {
  constructor(svgElement) {
    this.svgElement = svgElement;
    this.elements = new Map();
  }

  buildMap() {
    this.svgElement.querySelectorAll("*").forEach(el => {
      if (el.hasAttribute("inkscape:label")) {
        const label = el.getAttribute("inkscape:label");
        this.elements.set(label, el); // Use label as key instead of id
      }
      else if (el.hasAttribute("id")) {
        const id = el.getAttribute("id");
        this.elements.set(id, el); // Fallback to id if label is not present
      }
    });
  }

  get(label) {
    return this.elements.get(label);
  }
  preparePlotter(label, xDomain, yDomain, axes = false, yTicks = 5, xTicks = 5) {
    const targetElement = this.get(label);
    const bbox = targetElement.getBBox();
    const width = bbox.width;
    const height = bbox.height;

    const xScale = d3.scaleLinear()
      .domain(xDomain)
      .range([bbox.x, bbox.x + width]);

    const yScale = d3.scaleLinear()
      .domain(yDomain)
      .range([bbox.y + height, bbox.y]);


    if (axes === true) {
      // Remove old axes if present
      const oldAxes = targetElement.querySelector(".axes");
      if (oldAxes) oldAxes.remove();

      // Scale tick size and font size
      const tickSize = Math.min(width, height) * 0.05; // 5% of min dimension
      const fontSize = Math.min(width, height) * 0.1; // 10% of min dimension

      // Create group for axes
      const axesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      axesGroup.classList.add("axes");
      targetElement.appendChild(axesGroup);

      const yStep = (yDomain[1] - yDomain[0]) / yTicks;
      const xStep = (xDomain[1] - xDomain[0]) / xTicks;

      // Y-axis ticks & labels
      for (let i = 0; i <= yTicks; i++) {
        const val = yDomain[0] + i * yStep;
        const x = xScale(0);
        const y = yScale(val);

        // Tick line
        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tick.setAttribute("x1", x - tickSize);
        tick.setAttribute("y1", y);
        tick.setAttribute("x2", x + tickSize);
        tick.setAttribute("y2", y);
        tick.setAttribute("stroke", "black");
        tick.setAttribute("stroke-width", tickSize / 2);
        axesGroup.appendChild(tick);

        // Label
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.textContent = val.toFixed(1);
        label.setAttribute("x", x - tickSize * 3);
        label.setAttribute("y", y + fontSize / 3);
        label.setAttribute("font-size", fontSize);
        label.setAttribute("text-anchor", "end");
        axesGroup.appendChild(label);
      }

      // X-axis ticks & labels
      for (let i = 0; i <= xTicks; i++) {
        const val = xDomain[0] + i * xStep;
        const x = xScale(val);
        const y = yScale(0);

        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tick.setAttribute("x1", x);
        tick.setAttribute("y1", y - tickSize);
        tick.setAttribute("x2", x);
        tick.setAttribute("y2", y + tickSize);
        tick.setAttribute("stroke", "black");
        tick.setAttribute("stroke-width", tickSize / 2);
        axesGroup.appendChild(tick);

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.textContent = val.toFixed(1);
        label.setAttribute("x", x);
        label.setAttribute("y", y + tickSize * 4);
        label.setAttribute("font-size", fontSize);
        label.setAttribute("text-anchor", "middle");
        axesGroup.appendChild(label);
      }
    }

    return { targetElement, xScale, yScale };
  }
}