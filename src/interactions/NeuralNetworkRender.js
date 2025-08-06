export class NeuralNetworkRenderer {
  constructor(targetElement, nodeSize = 5, lineWidth = 1) {
    this.targetElement = targetElement;
    this.nodeSize = nodeSize;
    this.lineWidth = lineWidth;

    const bbox = targetElement.getBBox();
    this.width = bbox.width;
    this.height = bbox.height;
    this.x0 = bbox.x;
    this.y0 = bbox.y;

    this.svgParent = targetElement.ownerSVGElement;

    // Hide original path (optional)
    this.targetElement.style.display = "none";

    // Create a group for rendering the network
    this.group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.group.classList.add("nn-group");
    this.svgParent.appendChild(this.group);
  }

  render(layersConfig) {
    // Clear previous network
    this.group.innerHTML = "";

    const layerGap = this.width / (layersConfig.length - 1);
    const nodeGap = Math.min(this.height / Math.max(...layersConfig), 50);

    layersConfig.forEach((nodes, layerIndex) => {
      const x = this.x0 + layerIndex * layerGap;
      const totalHeight = (nodes - 1) * nodeGap;
      const startY = this.y0 + (this.height - totalHeight) / 2;

      for (let i = 0; i < nodes; i++) {
        const y = startY + i * nodeGap;
        // Draw connections from previous layer
        if (layerIndex > 0) {
          const prevNodes = layersConfig[layerIndex - 1];
          const prevTotalHeight = (prevNodes - 1) * nodeGap;
          const prevStartY = this.y0 + (this.height - prevTotalHeight) / 2;

          for (let j = 0; j < prevNodes; j++) {
            const prevY = prevStartY + j * nodeGap;
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x - layerGap);
            line.setAttribute("y1", prevY);
            line.setAttribute("x2", x);
            line.setAttribute("y2", y);
            line.setAttribute("stroke", "#999");
            line.setAttribute("stroke-width", this.lineWidth);
            this.group.appendChild(line);
          }
        }

        // Draw node
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", this.nodeSize);
        circle.setAttribute("fill", "#4cafef");
        this.group.appendChild(circle);

      }
    });
  }

  clear() {
    this.group.innerHTML = "";
  }
}
