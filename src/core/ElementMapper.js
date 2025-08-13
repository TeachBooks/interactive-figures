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
preparePlotter(label, xDomain, yDomain, axes = false) {
  const targetElement = this.get(label);

  // Store physical bbox once
  if (!targetElement._plotBBox) {
    const bbox = targetElement.getBBox();
    targetElement._plotBBox = {
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height
    };
  }

  const { x, y, width, height } = targetElement._plotBBox;

  const xScale = d3.scaleLinear()
    .domain(xDomain)
    .range([x, x + width]);

  const yScale = d3.scaleLinear()
    .domain(yDomain)
    .range([y + height, y]);

  if (axes) {
    this.drawAxes(label, xDomain, yDomain);
  }

  return { targetElement, xScale, yScale, width, height, bbox: targetElement._plotBBox };
}

drawAxes(label, xDomain, yDomain, yTicks = 5, xTicks = 5) {
  const targetElement = this.get(label);
  const { x, y, width, height } = targetElement._plotBBox;

  const xScale = d3.scaleLinear().domain(xDomain).range([x, x + width]);
  const yScale = d3.scaleLinear().domain(yDomain).range([y + height, y]);

  // Remove old axes
  const oldAxes = targetElement.querySelector(".axes");
  if (oldAxes) oldAxes.remove();

  const tickSize = Math.min(width, height) * 0.05;
  const fontSize = Math.min(width, height) * 0.1;

  const axesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  axesGroup.classList.add("axes");
  targetElement.appendChild(axesGroup);

  // Y-axis ticks
  const yStep = (yDomain[1] - yDomain[0]) / yTicks;
  for (let i = 0; i <= yTicks; i++) {
    const val = yDomain[0] + i * yStep;
    const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    tick.setAttribute("x1", xScale(xDomain[0]) - tickSize);
    tick.setAttribute("y1", yScale(val));
    tick.setAttribute("x2", xScale(xDomain[0]) + tickSize);
    tick.setAttribute("y2", yScale(val));
    tick.setAttribute("stroke", "black");
    tick.setAttribute("stroke-width", tickSize / 2);
    axesGroup.appendChild(tick);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.textContent = val.toFixed(1);
    label.setAttribute("x", xScale(xDomain[0]) - tickSize * 3);
    label.setAttribute("y", yScale(val) + fontSize / 3);
    label.setAttribute("font-size", fontSize);
    label.setAttribute("text-anchor", "end");
    axesGroup.appendChild(label);
  }

  // X-axis ticks
  const xStep = (xDomain[1] - xDomain[0]) / xTicks;
  for (let i = 0; i <= xTicks; i++) {
    const val = xDomain[0] + i * xStep;
    const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    tick.setAttribute("x1", xScale(val));
    tick.setAttribute("y1", yScale(yDomain[0]) - tickSize);
    tick.setAttribute("x2", xScale(val));
    tick.setAttribute("y2", yScale(yDomain[0]) + tickSize);
    tick.setAttribute("stroke", "black");
    tick.setAttribute("stroke-width", tickSize / 2);
    axesGroup.appendChild(tick);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.textContent = val.toFixed(1);
    label.setAttribute("x", xScale(val));
    label.setAttribute("y", yScale(yDomain[0]) + tickSize * 4);
    label.setAttribute("font-size", fontSize);
    label.setAttribute("text-anchor", "middle");
    axesGroup.appendChild(label);
  }
}

updateAxes(label, xDomain, yDomain, yTicks = 5, xTicks = 5) {
  this.drawAxes(label, xDomain, yDomain, yTicks, xTicks);

  const targetElement = this.get(label);
  const { x, y, width, height } = targetElement._plotBBox;

  const xScale = d3.scaleLinear().domain(xDomain).range([x, x + width]);
  const yScale = d3.scaleLinear().domain(yDomain).range([y + height, y]);

  return { targetElement, xScale, yScale };
}

}