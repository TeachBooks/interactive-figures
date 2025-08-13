import { SVGTemplate } from "./core/SVGTemplate.js";
import { ElementMapper } from "./core/ElementMapper.js";
import { NeuralNetworkRenderer } from "./interactions/NeuralNetworkRender.js";
import { NeuralNetwork } from "./interactions/NeuralNetwork.js";
import { clearScatterPlot, scatterPlot, scatterPoint } from "./interactions/ScatterPlot.js";
import { linePlot } from "./interactions/LinePlot.js";

(async function () {
  const template = new SVGTemplate("./templates/neural_net.svg");
  await template.load();
  template.attachTo("app");

  const mapper = new ElementMapper(template.svgElement);
  mapper.buildMap();
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
  const nnRenderer = new NeuralNetworkRenderer(target, 0.8, 0.2);
  let model = new NeuralNetwork(layers, 'tanh'); // 1 input, 20 neurons, 2 hidden layers, 1 output
  const res_window = mapper.preparePlotter('Results', [0, 4000], [0, 1], true);
  const input_window = mapper.preparePlotter('Input-data', [0, 8], [-2, 2], true);


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



  linePlot(input_window, dataset, 'black', 0.3);
  // scatterPlot
  let training = false;
  let trainingId;

  const button = document.getElementById("startTraining");
  button.addEventListener("click", () => {
    if (!training) {
      // Start training
      model.updateLayers(layers);
      training = true;
      button.textContent = "Stop Training";
      mapper.get('layer_info').textContent = `Layers: ${layers.join(', ')}`;
      clearScatterPlot(res_window);
      trainFrame();
    } else {
      // Stop training
      training = false;
      button.textContent = "Start Training";
      cancelAnimationFrame(trainingId);
    }
  });

  // console.log(dataset.at(-1).y);
  let rmse = [];
  function trainFrame(epoch = 0) {
    if (!training) return;
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
  }

})();