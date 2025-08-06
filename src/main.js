import { SVGTemplate } from "./core/SVGTemplate.js";
import { ElementMapper } from "./core/ElementMapper.js";
import { NeuralNetworkRenderer } from "./interactions/NeuralNetworkRender.js";
import { NeuralNetwork } from "./interactions/NeuralNetwork.js";
import { scatterPlot, scatterPoint } from "./interactions/ScatterPlot.js";
import { linePlot } from "./interactions/LinePlot.js";

(async function () {
  const template = new SVGTemplate("./templates/neural_net.svg");
  await template.load();
  template.attachTo("app");

  const mapper = new ElementMapper(template.svgElement);
  mapper.buildMap();
  // creating a quick dataset
  // Parameters
  const numPoints = 100;    // Number of data points
  const step = (2 * Math.PI) / numPoints; // Step size for x values
  const amplitude = 1;      // Sine wave amplitude
  const frequency = 3;      // Sine wave frequency

  // Generate dataset
  const dataset = [];
  for (let i = 0; i < numPoints; i++) {
    const x = i * step;
    const y = amplitude * Math.sin(frequency * x);
    dataset.push({ x: [x], y: [y] }); // <-- Wrap in arrays
  }

  let layers = [1, 20, 20, 1]; // initial config
  const target = mapper.get("NN");
  const nnRenderer = new NeuralNetworkRenderer(target, 0.8, 0.4);

  // Initial render
  nnRenderer.render(layers);
  // Update dynamically on slider change
  const slider1 = document.getElementById("meanX1");
  slider1.addEventListener("input", (e) => {
    layers[1] = parseInt(e.target.value);
    nnRenderer.render(layers);
  });

  const slider2 = document.getElementById("meanX2");
  slider2.addEventListener("input", (e) => {
    layers[2] = parseInt(e.target.value);
    nnRenderer.render(layers);
  });

  // scatterPlot(mapper.preparePlotter('Input-data', [0, 10], [0, 10]), dataset, 0.5);
  const input_window = mapper.preparePlotter('Input-data', [0, 10], [0, 10], true);
  linePlot(input_window, dataset, 'red', 0.5);
  // scatterPlot

  const model = new NeuralNetwork([1, 20, 20, 1], 'tanh'); // 1 input, 4 hidden, 1 output

  const res_window = mapper.preparePlotter('Results', [0, 4000], [0, 1], true);
  // console.log(dataset.at(-1).y);
  let rmse = [];
  function trainFrame(epoch = 0) {
    const batchSize = 100;
    for (let i = 0; i < dataset.length; i += batchSize) {
      const batch = dataset.slice(i, i + batchSize);
      // rmse.push(model.trainBatch(batch, 0.1));
      rmse.push({ x: [epoch], y: [model.trainBatch(batch, 0.1)] });
    }

    // Predictions after each epoch
    const predictions = dataset.map(d => {
      const { activations } = model.forward(d.x);
      return { x: d.x[0], y: activations.at(-1)[0] };
    });

    scatterPlot(input_window, predictions, 0.2, 'blue', true);
    scatterPoint(res_window, rmse.at(-1), 0.2, 'green', true);
    // const rmse = model.trainStep(dataset, 0.1);
    document.getElementById("RMSEValue").textContent = rmse.at(-1).y[0].toFixed(2);

    if (epoch < 4000) {
      requestAnimationFrame(() => trainFrame(epoch + 1));
    }
    // console.log('epoch:', epoch, 'RMSE size:', rmse.length, 'last RMSE:', rmse.at(-1).y[0].toFixed(2));
  }
  trainFrame();

})();
