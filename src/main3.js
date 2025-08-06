import { SVGTemplate } from "./core/SVGTemplate.js";
import { ElementMapper } from "./core/ElementMapper.js";
import { NeuralNetworkRenderer } from "./interactions/NeuralNetworkRender.js";
import { NeuralNetwork } from "./interactions/NeuralNetwork.js";
import { scatterPlot } from "./interactions/ScatterPlot.js";
import { Gaussian } from "./interactions/Gaussian.js";

(async function () {
  const template = new SVGTemplate("./templates/quick_plot.svg");
  await template.load();
  template.attachTo("app");

  const mapper = new ElementMapper(template.svgElement);
  mapper.buildMap();

  // data
  const dataset = [];
  const numPoints = 100;    // Number of data points
  for (let i = 0; i < numPoints; i++) {
    dataset.push({ x: [Math.random()], y: [Math.random()] }); // <-- Wrap in arrays
  }

  //                                   xy = name of the object in the SVG
  //                                   [0, 1] = x-axis range (length of the actual object doesn't matter)
  //                                   -x to +x.... same with y-axis
  //                                   [0, 1] = y-axis range (length of the actual object doesn't matter)
  const pltFigure = mapper.preparePlotter('xy', [0, 1], [0, 1]);
  // Create scatter plot
  scatterPlot(pltFigure, dataset, 0.5);
  //                     x and y data, 0.5 = size of the points

  const button = mapper.get('button');
  button.addEventListener('click', () => {
    console.log("Button clicked!");
  });

  //   const slider1 = document.getElementById("meanX1");
  // slider1.addEventListener("input", (e) => {
  //   const a = parseFloat(e.target.value); // new variance for x-axis
  //   const [[var1, cov1], [cov2, var2]] = g.cov; // current values
  //   g.update([a, g.mu[1]], [[var1, cov1], [cov2, var2]]);
  //   g.drawContours(plotter, [1, 2, 3]);
  // });

})();
