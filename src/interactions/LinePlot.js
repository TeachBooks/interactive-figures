export function linePlot(plotter, data, stroke = "red", width = 1) {
    const { targetElement, xScale, yScale } = plotter;

    // Remove existing line if any (optional)
    const oldLine = targetElement.querySelector("path.line-plot");
    if (oldLine) oldLine.remove();

    // Build the path string
    const d = data.map((p, i) => {
        const x = xScale(p.x);
        const y = yScale(p.y);
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');

    // Create SVG path element
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("stroke", stroke);
    path.setAttribute("stroke-width", width);
    path.setAttribute("fill", "none");
    path.classList.add("line-plot");

    targetElement.appendChild(path);
}
