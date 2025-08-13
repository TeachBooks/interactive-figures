import { SVGTemplate } from "./core/SVGTemplate.js";
import { ElementMapper } from "./core/ElementMapper.js";
import { NeuralNetworkRenderer } from "./interactions/NeuralNetworkRender.js";
import { NeuralNetwork } from "./interactions/NeuralNetwork.js";
import { scatterPlot } from "./interactions/ScatterPlot.js";
import { EmpiricalCopula } from "./interactions/EmpiricalCopula.js";
import { Gaussian } from "./interactions/Gaussian.js";

(async function () {
    const template = new SVGTemplate("./templates/quick_xy.svg");
    await template.load();
    template.attachTo("app");

    const mapper = new ElementMapper(template.svgElement);
    mapper.buildMap();

    // data
    const data = new Gaussian([0, 0], 0.95, 1, 1);

    const pltFigure_left = mapper.preparePlotter('xy-1', [-3, 3], [-3, 3], true);
    const pltFigure_mid = mapper.preparePlotter('xy-2', [0, 1], [0, 1], true);
    let pltFigure_right = mapper.preparePlotter('xy-3', [0, 1], [0, 1], true);

    const samples = data.sample(1000);
    const cop = new EmpiricalCopula(samples.map(s => s.x), samples.map(s => s.y));

    scatterPlot(pltFigure_left, samples, 0.5, "blue", true); // original data

    scatterPlot(pltFigure_mid, cop.x_unit.map((x, i) => ({ x, y: cop.y_unit[i] })), 0.5, "green", true); // empirical CDF transformed data

    let { interpolated, minX, minY, maxX, maxY } = cop.interpolateData(0); // Gaussian margins
    scatterPlot(pltFigure_right, interpolated, 0.5, "red", true);

    const sliderMeanX1 = document.getElementById("meanX1");
    sliderMeanX1.addEventListener("input", (e) => {
        const a = parseFloat(e.target.value); // new variance
        let { interpolated, minX, minY, maxX, maxY } = cop.interpolateData(a);
        // console.log('yes?',interpolated);
        // const bounds = jStat.normal.inv(1 - (1 - a) / 2, 0, 1);
        scatterPlot(mapper.updateAxes('xy-3', [minX, maxX], [minY, maxY]), interpolated, 0.5, "red", true);

    });
})();
