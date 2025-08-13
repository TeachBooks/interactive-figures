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

    const pltFigure_left = mapper.preparePlotter('xy-1', [0.0135, 0.0165], [1315, 1789], true);
    const pltFigure_mid = mapper.preparePlotter('xy-2', [0, 1], [0, 1], true);
    let pltFigure_right = mapper.preparePlotter('xy-3', [0, 1], [0, 1], true);

    let cop = null; // will hold EmpiricalCopula

    document.getElementById("csvFile").addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            const text = event.target.result;

            // Parse CSV
            const data = parseCSV(text);
            console.log("CSV Data:", data);

            // Convert to format for scatterPlot
            const scatterData = data.map(d => ({
                x: parseFloat(d[0]),
                y: parseFloat(d[1])
            }));

            // Create EmpiricalCopula from CSV
            cop = new EmpiricalCopula(
                scatterData.map(d => d.x),
                scatterData.map(d => d.y)
            );

            // Plot initial scatter
            scatterPlot(pltFigure_left, scatterData, 0.5, "red", true);
            scatterPlot(pltFigure_mid, cop.x_unit.map((x, i) => ({ x, y: cop.y_unit[i] })), 0.5, "green", true);

            // Attach slider listener now that cop is ready
            const sliderMeanX1 = document.getElementById("meanX1");
            sliderMeanX1.addEventListener("input", (e) => {
                const alpha = parseFloat(e.target.value); // alpha 0-1
                let { interpolated, minX, minY, maxX, maxY } = cop.interpolateData(alpha);
                scatterPlot(mapper.updateAxes('xy-3', [minX, maxX], [minY, maxY]), interpolated, 0.5, "blue", true);
            });
        };
        reader.readAsText(file);
    });

    // Simple CSV parser (assumes no header)
function parseCSV(str) {
    return str
        .trim()
        .split("\n")
        .map(line => line.split(",").map(cell => parseFloat(cell))); // <-- parse numbers
}
})();