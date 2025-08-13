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

  const meanText = mapper.get('text1222').textContent;
  const sigmaXText = mapper.get('text1222-2').textContent;
  const sigmaYText = mapper.get('text1222-7').textContent;

  const plotter = mapper.preparePlotter('xy-1', [-6, 6], [-6, 6], true);
  const xy_scatter = mapper.preparePlotter('xy-2', [-6, 6], [-6, 6], true);

  // Create Gaussian
  const g = new Gaussian([0, 0], 0.6, 1, 1);

  const samples = g.sample(1000);
  scatterPlot(xy_scatter, samples, 0.5, "blue", true);

  // Draw contours
  g.drawContours(plotter, [1, 2, 3]);

  const sliderMeanX1 = document.getElementById("meanX1");
  sliderMeanX1.addEventListener("input", (e) => {
    const a = parseFloat(e.target.value); // new variance
    g.update([a, g.mu[1]], g.sigma_x, g.sigma_y, g.corr);
    mapper.get('text1222').textContent = meanText + ` (${g.mu[0]}, ${g.mu[1]})`;
    g.drawContours(plotter, [1, 2, 3]);
    scatterPlot(xy_scatter, g.transformSamples(samples), 0.5, "blue", true);
  });

  const sliderMeanX2 = document.getElementById("meanX2");
  sliderMeanX2.addEventListener("input", (e) => {
    const a = parseFloat(e.target.value); // new variance
    g.update([g.mu[0], a], g.sigma_x, g.sigma_y, g.corr);
    mapper.get('text1222').textContent = meanText + ` (${g.mu[0]}, ${g.mu[1]})`;
    g.drawContours(plotter, [1, 2, 3]);
    scatterPlot(xy_scatter, g.transformSamples(samples), 0.5, "blue", true);
  });

  const sliderStdX1 = document.getElementById("stdX1");
  sliderStdX1.addEventListener("input", (e) => {
    const a = parseFloat(e.target.value); // new variance for y-axis
    g.update(g.mu, a, g.sigma_y, g.corr);
    mapper.get('text1222-7').textContent = sigmaXText + ` ${a}`;
    mapper.get('loc-00').textContent = a;
    g.drawContours(plotter, [1, 2, 3]);
    scatterPlot(xy_scatter, g.transformSamples(samples), 0.5, "blue", true);
  });

  const sliderStdX2 = document.getElementById("stdX2");
  sliderStdX2.addEventListener("input", (e) => {
    const a = parseFloat(e.target.value); // new variance for y-axis
    mapper.get('text1222-2').textContent = sigmaYText + ` ${a}`;
    g.update(g.mu, g.sigma_x, a, g.corr);
    mapper.get('loc-11').textContent = a;
    g.drawContours(plotter, [1, 2, 3]);
    scatterPlot(xy_scatter, g.transformSamples(samples), 0.5, "blue", true);
  });

  const corrSlider = document.getElementById("Correlation");
  corrSlider.addEventListener("input", (e) => {
    const a = parseFloat(e.target.value); // new correlation
    g.update(g.mu, g.sigma_x, g.sigma_y, a);
    const [[sigmax,sigma_xy], [sigma_yx,sigmay]] = g.cov;
    mapper.get('loc-01').textContent = sigma_xy.toFixed(2);
    mapper.get('loc-10').textContent = sigma_yx.toFixed(2);
    mapper.get('loc-00').textContent = sigmax.toFixed(2);
    mapper.get('loc-11').textContent = sigmay.toFixed(2);
    g.drawContours(plotter, [1, 2, 3]);
    scatterPlot(xy_scatter, g.transformSamples(samples), 0.5, "blue", true);
  });
})();
