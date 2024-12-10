// Global state object
const state = {
    params: {
        meanX1: 0,
        meanX2: 0,
        stdX1: 1,
        stdX2: 1,
        correlation: 0
    },
    graphs: {},
    scales: {},
    texts: {}
};

// Load and start
d3.xml("https://raw.githubusercontent.com/TeachBooks/interactive-figures/refs/heads/main/Images/usable_example.svg")
    .then(initializeVisualization)
    .catch(error => console.error("Error loading SVG:", error));

// Initialize visualization
function initializeVisualization(data) {
    const svg = setupSVG(data);
    setupGraphs(svg);
    setupScales();
    setupStatTexts(svg);
    setupEventListeners();
    updatePlots();
}

// SVG Setup Functions
function setupSVG(data) {
    const importedSVG = data.documentElement;
    const currentViewBox = importedSVG.getAttribute("viewBox").split(" ").map(Number);
    const newViewBox = [
        currentViewBox[0] - 10,
        currentViewBox[1],
        currentViewBox[2] + 10,
        currentViewBox[3]
    ];
    importedSVG.setAttribute("viewBox", newViewBox.join(" "));
    d3.select("#my_datavisualization").node().appendChild(importedSVG);
    return importedSVG;
}

function setupGraphs(svg) {
    const firstGraph = d3.select(svg).select("#layer2")
        .attr("transform", "translate(-22,-130)");
    const secondGraph = d3.select(svg).select("#layer1")
        .attr("transform", "translate(-18,-130)");

    state.graphs = { firstGraph, secondGraph };
    addLegends(firstGraph, secondGraph);
}

function setupScales() {
    const { firstGraph, secondGraph } = state.graphs;

    // First graph scales
    const firstGraphPath = firstGraph.select("path");
    const firstBBox = firstGraphPath.node().getBBox();
    const firstXScale = d3.scaleLinear()
        .domain([-5, 5])
        .range([firstBBox.x, firstBBox.x + firstBBox.width]);
    const firstYScale = d3.scaleLinear()
        .domain([-5, 5])
        .range([firstBBox.y + firstBBox.height, firstBBox.y]);

    // Second graph scales
    const xPath = secondGraph.select("#x");
    const yPath = secondGraph.select("#y");
    const xBBox = xPath.node().getBBox();
    const yBBox = yPath.node().getBBox();
    const secondXScale = d3.scaleLinear()
        .domain([-5, 5])
        .range([yBBox.x, xBBox.x + xBBox.width]);
    const secondYScale = d3.scaleLinear()
        .domain([-5, 5])
        .range([xBBox.y, yBBox.y]);

    state.scales = { firstXScale, firstYScale, secondXScale, secondYScale };

    // Add axis ticks using the computed scales
    addAxisTicks(firstGraph, firstXScale, firstYScale,
        firstGraphPath.node().getBBox().x,
        firstGraphPath.node().getBBox().y + firstGraphPath.node().getBBox().height);
    addAxisTicks(secondGraph, secondXScale, secondYScale,
        yPath.node().getBBox().x, xBBox.y);
}

function setupStatTexts(svg) {
    const textGroup = d3.select(svg).select("#layer4");
    textGroup.selectAll(".stat-value").remove();

    state.texts = {
        mean: textGroup.append("text")
            .attr("class", "stat-value")
            .attr("x", 86.6)
            .attr("y", 131.6)
            .style("font-size", "2.11667px")
            .style("fill", "black"),
        sigma1: textGroup.append("text")
            .attr("class", "stat-value")
            .attr("x", 90)
            .attr("y", 135.5)
            .style("font-size", "2.11667px")
            .style("fill", "black"),
        sigma2: textGroup.append("text")
            .attr("class", "stat-value")
            .attr("x", 90)
            .attr("y", 139.5)
            .style("font-size", "2.11667px")
            .style("fill", "black")
    };
}

// Update Functions
function updateGraphLabels() {
    const { firstGraph, secondGraph } = state.graphs;
    const xAxisLabel = document.getElementById("xAxisLabel").value;
    const yAxisLabel = document.getElementById("yAxisLabel").value;

    // Update titles
    firstGraph.select(".graph-title").text(document.getElementById("leftGraphTitle").value);
    secondGraph.select(".graph-title").text(document.getElementById("rightGraphTitle").value);

    // Update X-axis labels
    [firstGraph, secondGraph].forEach(graph => {
        graph.selectAll(".axis-label")
            .filter(function() {
                const transform = this.getAttribute("transform");
                return !transform || transform === "null";
            })
            .text(xAxisLabel);

        graph.selectAll(".axis-label")
            .filter(function() {
                const transform = this.getAttribute("transform");
                return transform && transform.includes("rotate");
            })
            .text(yAxisLabel);
    });
}

function updateStatistics(stats) {
    const { mean, sigma1, sigma2 } = state.texts;

    // Update SVG text elements
    mean.text(`${stats.meanX1.toFixed(2)}, ${stats.meanX2.toFixed(2)}`);
    sigma1.text(stats.stdX1.toFixed(2));
    sigma2.text(stats.stdX2.toFixed(2));

    // Update HTML elements
    document.getElementById('meanValue').textContent = `${stats.meanX1.toFixed(2)}, ${stats.meanX2.toFixed(2)}`;
    document.getElementById('stdX1Value').textContent = stats.stdX1.toFixed(2);
    document.getElementById('stdX2Value').textContent = stats.stdX2.toFixed(2);

    // Update covariance matrix elements
    const sigmaX1Sq = Math.pow(stats.stdX1, 2);
    const sigmaX2Sq = Math.pow(stats.stdX2, 2);
    const covX1X2 = stats.correlation * stats.stdX1 * stats.stdX2;

    d3.select("#text2048").text(sigmaX1Sq.toFixed(2));
    d3.select("#text2052").text(sigmaX2Sq.toFixed(2));
    d3.select("#text2056").text(covX1X2.toFixed(2));
    d3.select("#text2060").text(covX1X2.toFixed(2));
}

function updatePlots() {
    const { firstGraph, secondGraph } = state.graphs;
    const { firstXScale, firstYScale, secondXScale, secondYScale } = state.scales;

    // Clear previous elements
    firstGraph.selectAll(".contour-element").remove();
    secondGraph.selectAll(".sample-point").remove();

    // Ensure labels stay on top
    [firstGraph, secondGraph].forEach(graph => {
        graph.selectAll(".graph-title, .tick, .tick-label").raise();
    });

    // Generate and draw contours
    const contourPaths = generateContours(state.params, firstXScale, firstYScale);
    const colorScale = d3.scaleSequential()
        .domain([0, contourPaths.length-1])
        .interpolator(d3.interpolateYlOrRd);

    // Draw contours
    contourPaths.forEach((path, i) => {
        const lineGenerator = d3.line()
            .x(d => firstXScale(d.x1))
            .y(d => firstYScale(d.x2))
            .curve(d3.curveCatmullRomClosed);

        firstGraph.append("path")
            .attr("class", "contour-element")
            .attr("d", lineGenerator(path.points))
            .attr("fill", colorScale(i))
            .attr("stroke", "none")
            .attr("fill-opacity", 0.2);
    });

    // Generate and draw points
    const points = generateGaussianPoints(
        state.params.meanX1, state.params.meanX2,
        state.params.stdX1, state.params.stdX2,
        state.params.correlation
    );

    secondGraph.selectAll("circle.sample-point")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "sample-point")
        .attr("cx", d => secondXScale(d.x1))
        .attr("cy", d => secondYScale(d.x2))
        .attr("r", 0.3)
        .attr("fill", "rgba(0, 0, 0, 0.5)");

    // Update statistics
    const stats = calculateStatistics(points);
    updateStatistics(stats);
}

// Event Handlers
function setupEventListeners() {
    // Apply button listener
    document.getElementById("applySettings").addEventListener("click", updateGraphLabels);

    // Slider listeners
    const sliders = ["meanX1", "meanX2", "stdX1", "stdX2", "correlation"];
    sliders.forEach(id => {
        d3.select(`#${id}`).on("input", function() {
            state.params[id] = +this.value;
            updatePlots();
        });
    });
}


// -----------------------------------------------------------------------------

// Statistical Functions
function bivariateNormalDensity(x1, x2, params) {
    const dx1 = x1 - params.meanX1;
    const dx2 = x2 - params.meanX2;
    const s1_2 = params.stdX1 * params.stdX1;
    const s2_2 = params.stdX2 * params.stdX2;
    const rho = params.correlation;

    const z = (dx1*dx1/s1_2 + dx2*dx2/s2_2 - 2*rho*dx1*dx2/(params.stdX1*params.stdX2))/(1-rho*rho);
    return Math.exp(-z/2) / (4 * Math.PI * params.stdX1 * params.stdX2 * Math.sqrt(1-rho*rho));
}

function generateGaussianPoints(meanX1, meanX2, stdX1, stdX2, correlation, numPoints = 100) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
        const x1 = meanX1 + stdX1 * z0;
        const x2 = meanX2 + stdX2 * (correlation * z0 + Math.sqrt(1 - correlation ** 2) * z1);
        points.push({ x1, x2 });
    }
    return points;
}

function calculateStatistics(points) {
    const meanX1 = d3.mean(points, d => d.x1);
    const meanX2 = d3.mean(points, d => d.x2);
    const stdX1 = Math.sqrt(d3.variance(points, d => d.x1));
    const stdX2 = Math.sqrt(d3.variance(points, d => d.x2));

    const meanDiffX1 = points.map(d => d.x1 - meanX1);
    const meanDiffX2 = points.map(d => d.x2 - meanX2);
    const correlation = d3.sum(meanDiffX1.map((d, i) => d * meanDiffX2[i])) /
                     (Math.sqrt(d3.sum(meanDiffX1.map(d => d * d)) *
                              d3.sum(meanDiffX2.map(d => d * d))));

    return { meanX1, meanX2, stdX1, stdX2, correlation };
}

function generateContours(params, xScale, yScale) {
    const contourLevels = [0.002, 0.005, 0.01, 0.02, 0.03, 0.04];
    const paths = [];

    for (let level of contourLevels) {
        const contourPoints = [];
        for (let angle = 0; angle < 2*Math.PI; angle += 2*Math.PI/100) {
            let r = 0;
            let dr = 0.2;
            let maxIter = 100;

            while (maxIter-- > 0) {
                const x1 = params.meanX1 + r * Math.cos(angle);
                const x2 = params.meanX2 + r * Math.sin(angle);
                const density = bivariateNormalDensity(x1, x2, params);

                if (Math.abs(density - level) < 0.0001) break;

                if (density > level) {
                    r += dr;
                } else {
                    r -= dr;
                    dr /= 2;
                }
            }

            contourPoints.push({
                x1: params.meanX1 + r * Math.cos(angle),
                x2: params.meanX2 + r * Math.sin(angle)
            });
        }
        paths.push({level, points: contourPoints});
    }
    return paths;
}

// Also need to add these helper functions
function addLegends(firstGraph, secondGraph) {
    firstGraph.append("text")
        .attr("class", "graph-title")
        .attr("x", 26)
        .attr("y", 129)
        .style("font-size", "2px")
        .style("fill", "black")
        .text("density contours");

    secondGraph.append("text")
        .attr("class", "graph-title")
        .attr("x", 56)
        .attr("y", 129)
        .style("font-size", "2px")
        .style("fill", "black")
        .text("samples");
}

function addAxisTicks(graph, xScale, yScale, xPos, yPos, isFirstGraph = false) {
    const tickValues = [-4, -2, 0, 2, 4];
    const yAxisPadding = isFirstGraph ? 3 : 0;
    const xLabelOffset = 2.5;

    // Add X-axis ticks
    tickValues.forEach(tick => {
        graph.append("line")
            .attr("class", "tick")
            .attr("x1", xScale(tick))
            .attr("y1", yPos)
            .attr("x2", xScale(tick))
            .attr("y2", yPos + 0.5)
            .attr("stroke", "black")
            .attr("stroke-width", "0.1");

        graph.append("text")
            .attr("class", "tick-label")
            .attr("x", xScale(tick))
            .attr("y", yPos + xLabelOffset)
            .attr("text-anchor", "middle")
            .style("font-size", "1.5px")
            .text(tick);
    });

    // Add Y-axis ticks
    tickValues.forEach(tick => {
        graph.append("line")
            .attr("class", "tick")
            .attr("x1", xPos - yAxisPadding)
            .attr("y1", yScale(tick))
            .attr("x2", xPos - yAxisPadding - 0.5)
            .attr("y2", yScale(tick))
            .attr("stroke", "black")
            .attr("stroke-width", "0.1");

        graph.append("text")
            .attr("class", "tick-label")
            .attr("x", xPos - yAxisPadding - 1)
            .attr("y", yScale(tick))
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .style("font-size", "1.5px")
            .text(tick);
    });

    // Add axis labels
    graph.append("text")
        .attr("class", "axis-label")
        .attr("x", xScale(0))
        .attr("y", yPos + 5)
        .attr("text-anchor", "middle")
        .style("font-size", "2px")
        .text("X1");

    graph.append("text")
        .attr("class", "axis-label")
        .attr("x", xPos - yAxisPadding - (isFirstGraph ? 6 : 4))
        .attr("y", yScale(0))
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90 ${xPos - yAxisPadding - (isFirstGraph ? 6 : 4)} ${yScale(0)})`)
        .style("font-size", "2px")
        .text("X2");

    graph.selectAll(".axis-label").raise();
}