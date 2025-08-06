export function scatterPlot(plotter, points, r = 1, fill = "blue", clearOld = true) {
  const { targetElement, xScale, yScale } = plotter;

  if (clearOld) {
    const circles = targetElement.querySelectorAll("circle");
    circles.forEach(circle => circle.remove());
  }

  points.forEach(pt => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", xScale(pt.x));
    circle.setAttribute("cy", yScale(pt.y));
    circle.setAttribute("r", r);
    circle.setAttribute("fill", fill);
    targetElement.appendChild(circle);
  });
}
export function scatterPoint(plotter, point, r = 1, fill = "blue") { // Function to add a single point to the scatter plot..
  // becomes laggy otherwise if you try to plot thousands of points many times
  const { targetElement, xScale, yScale } = plotter;

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", xScale(point.x));
  circle.setAttribute("cy", yScale(point.y));
  circle.setAttribute("r", r);
  circle.setAttribute("fill", fill);
  targetElement.appendChild(circle);
}