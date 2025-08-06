import { SVGTemplate } from "./core/SVGTemplate.js";
import { ElementMapper } from "./core/ElementMapper.js";
import { NeuralNetworkRenderer } from "./interactions/NeuralNetworkRender.js";
import { NeuralNetwork } from "./interactions/NeuralNetwork.js";
import { scatterPlot } from "./interactions/ScatterPlot.js";
import { Gaussian } from "./interactions/Gaussian.js";

(async function () {
  const template = new SVGTemplate("./templates/usable_example.svg");
  await template.load();
  template.attachTo("app");

  const mapper = new ElementMapper(template.svgElement);
  mapper.buildMap();


  const plotter = mapper.preparePlotter('xy-1', [-6, 6], [-6, 6]);
  const xy_scatter = mapper.preparePlotter('xy-2', [-6, 6], [-6, 6]);

  // Create Gaussian
  const g = new Gaussian([0, 0], [[1, 0], [0, 1]]);
  scatterPlot(xy_scatter, g.sample(100), 0.5, "blue", true);

  // Draw contours
  g.drawContours(plotter, [1, 2, 3]);

  const slider1 = document.getElementById("meanX1");
  slider1.addEventListener("input", (e) => {
    const a = parseFloat(e.target.value); // new variance for x-axis
    const [[var1, cov1], [cov2, var2]] = g.cov; // current values
    g.update([a, g.mu[1]], [[var1, cov1], [cov2, var2]]);
    g.drawContours(plotter, [1, 2, 3]);
    scatterPlot(xy_scatter, g.sample(100), 0.5, "blue", true);
  });

  const slider2 = document.getElementById("var1");
  slider2.addEventListener("input", (e) => {
    const a = parseFloat(e.target.value); // new variance for y-axis
    console.log("Variance slider2:", a);
    const [[var1, cov1], [cov2, var2]] = g.cov; // current values
    g.update(g.mu, [[a, cov1], [cov2, var2]]);
    g.drawContours(plotter, [1, 2, 3]);
    scatterPlot(xy_scatter, g.sample(100), 0.5, "blue", true);
  });

  const slider3 = document.getElementById("var2");
  slider3.addEventListener("input", (e) => {
    const a = parseFloat(e.target.value); // new covariance
    console.log("Covariance slider3:", a);
    const [[var1, cov1], [cov2, var2]] = g.cov; // current values
    const [mx, my] = g.mu; // current means
    g.update([mx, my], [[var1, cov1], [cov2, a]]);
    g.drawContours(plotter, [1, 2, 3]);
    scatterPlot(xy_scatter, g.sample(100), 0.5, "blue", true);
  });

  const slider4 = document.getElementById("stdX2");
  slider4.addEventListener("input", (e) => {
    const a = parseFloat(e.target.value); // new covariance
    console.log("Covariance slider4:", a);
    const [[var1, cov1], [cov2, var2]] = g.cov; // current values
    const [mx, my] = g.mu; // current means
    g.update([mx, my], [[var1, a], [a, var2]]);
    g.drawContours(plotter, [1, 2, 3]);
    scatterPlot(xy_scatter, g.sample(100), 0.5, "blue", true);
  });
})();
