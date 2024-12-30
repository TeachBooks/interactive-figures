// Configuration object for the visualization
const CONFIG = {
    defaultParams: {
        meanX1: 0,
        meanX2: 0,
        stdX1: 1,
        stdX2: 1,
        correlation: 0
    },
    contourLevels: [0.002, 0.005, 0.01, 0.02, 0.03, 0.04],
    numPoints: 100,
    tickValues: [-4, -2, 0, 2, 4],
    colors: {
        contour: d3.interpolateYlOrRd
    }
};

// Distribution class to handle probability calculations
class Distribution {
    static bivariateNormal(x1, x2, params) {
        const dx1 = x1 - params.meanX1;
        const dx2 = x2 - params.meanX2;
        const s1_2 = params.stdX1 * params.stdX1;
        const s2_2 = params.stdX2 * params.stdX2;
        const rho = params.correlation;

        const z = (dx1*dx1/s1_2 + dx2*dx2/s2_2 - 2*rho*dx1*dx2/(params.stdX1*params.stdX2))/(1-rho*rho);
        return Math.exp(-z/2) / (4 * Math.PI * params.stdX1 * params.stdX2 * Math.sqrt(1-rho*rho));
    }

    static generatePoints(params, numPoints = CONFIG.numPoints) {
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            const u1 = Math.random();
            const u2 = Math.random();
            const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
            const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
            const x1 = params.meanX1 + params.stdX1 * z0;
            const x2 = params.meanX2 + params.stdX2 * (params.correlation * z0 + Math.sqrt(1 - params.correlation ** 2) * z1);
            points.push({ x1, x2 });
        }
        return points;
    }
}

// Visualization class to handle the SVG setup and updates
class Visualization {
    constructor() {
        this.state = {
            params: {...CONFIG.defaultParams},
            graphs: {},
            scales: {},
            texts: {},
            currentDistribution: 'bivariateNormal',
            currentVisualization: 'contourScatter',
            pendingDistribution: 'bivariateNormal',
            pendingVisualization: 'contourScatter'
        };
    }

    async initialize() {
        try {
            const data = await d3.xml("https://raw.githubusercontent.com/TeachBooks/interactive-figures/refs/heads/main/Images/usable_example.svg");
            const svg = this.setupSVG(data);
            this.setupGraphs(svg);
            this.setupScales();
            this.setupStatTexts(svg);
            this.setupEventListeners();
            this.updatePlots();
        } catch (error) {
            console.error("Error loading SVG:", error);
        }
    }

    setupSVG(data) {
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

    setupGraphs(svg) {
        const firstGraph = d3.select(svg).select("#layer2")
            .attr("transform", "translate(-22,-130)");
        const secondGraph = d3.select(svg).select("#layer1")
            .attr("transform", "translate(-18,-130)");

        this.state.graphs = {firstGraph, secondGraph};
        this.addGraphTitles(firstGraph, secondGraph);
    }

    setupScales() {
        const {firstGraph, secondGraph} = this.state.graphs;

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

        this.state.scales = {firstXScale, firstYScale, secondXScale, secondYScale};
        this.addAxisTicks(firstGraph, firstXScale, firstYScale,
            firstGraphPath.node().getBBox().x,
            firstGraphPath.node().getBBox().y + firstGraphPath.node().getBBox().height, true);
        this.addAxisTicks(secondGraph, secondXScale, secondYScale,
            yPath.node().getBBox().x, xBBox.y);
    }

    setupStatTexts(svg) {
        const textGroup = d3.select(svg).select("#layer4");
        textGroup.selectAll(".stat-value").remove();

        this.state.texts = {
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

    updateGraphLabels() {
        const { firstGraph, secondGraph } = this.state.graphs;
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

    updateStatistics(stats) {
        const { mean, sigma1, sigma2 } = this.state.texts;

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

    updatePlots() {
        const { firstGraph, secondGraph } = this.state.graphs;
        const { firstXScale, firstYScale, secondXScale, secondYScale } = this.state.scales;

        // Clear previous elements
        firstGraph.selectAll(".contour-element").remove();
        secondGraph.selectAll(".sample-point").remove();

        // Ensure labels stay on top
        [firstGraph, secondGraph].forEach(graph => {
            graph.selectAll(".graph-title, .tick, .tick-label").raise();
        });

        // Generate and draw contours
        const contourPaths = this.generateContours(this.state.params);
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
        const points = Distribution.generatePoints(this.state.params);

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
        const stats = this.calculateStatistics(points);
        this.updateStatistics(stats);
    }

    setupEventListeners() {
        // Apply button listener
        document.getElementById("applySettings").addEventListener("click", () => {
            // Update labels
            this.updateGraphLabels();

            // Apply pending distribution and visualization changes
            this.state.currentDistribution = this.state.pendingDistribution;
            this.state.currentVisualization = this.state.pendingVisualization;

            // Update visibility and plots
            this.updateVisibility();
        });


        // Distribution type listener
        document.getElementById("distributionType").addEventListener("change", (event) => {
            this.state.pendingDistribution = event.target.value;
        });

        // Visualization type listener
        document.getElementById("visualizationType").addEventListener("change", (event) => {
            this.state.pendingVisualization = event.target.value;
        });

        // Slider listeners
        const sliders = ["meanX1", "meanX2", "stdX1", "stdX2", "correlation"];
        sliders.forEach(id => {
            d3.select(`#${id}`).on("input", (event) => {
                this.state.params[id] = +event.target.value;
                if (this.shouldShowBivariateNormal()) {
                    this.updatePlots();
                }
            });
        });
    }

    shouldShowBivariateNormal() {
        return this.state.currentDistribution === 'bivariateNormal' &&
               this.state.currentVisualization === 'contourScatter';
    }

    updateVisibility() {
        const { firstGraph, secondGraph } = this.state.graphs;
        const shouldShow = this.shouldShowBivariateNormal();

        // Show/hide the graphs
        firstGraph.style("display", shouldShow ? "block" : "none");
        secondGraph.style("display", shouldShow ? "block" : "none");

        // Show/hide the sliders based on distribution type
        const sliderContainer = document.querySelector('.controls-container');
        sliderContainer.style.display = shouldShow ? "flex" : "none";

        // Hide statistics text elements when not showing bivariate normal
        const { mean, sigma1, sigma2 } = this.state.texts;
        [mean, sigma1, sigma2].forEach(text => {
            text.style("display", shouldShow ? "block" : "none");
        });

        // Hide covariance matrix elements and frame
        const elementsToHide = [
            // Matrix values
            "#text2048", "#text2052", "#text2056", "#text2060",
            // Matrix frame
            "#rect2046", "#path1862", "#path1862-5", "#text1994",
            // Labels
            "#text1222", "#text1222-7", "#text1222-2",
            // Inkscape elements
            "[inkscape\\:current-layer]",
            "sodipodi\\:namedview"
        ];

        elementsToHide.forEach(selector => {
            d3.selectAll(selector).style("display", shouldShow ? "block" : "none");
        });

        // Show a message if the graphs are hidden
        const vizContainer = d3.select("#my_datavisualization");
        const messageId = "alternate-visualization-message";

        // Remove existing message if it exists
        vizContainer.select(`#${messageId}`).remove();

        if (!shouldShow) {
            vizContainer.append("div")
                .attr("id", messageId)
                .style("position", "absolute")
                .style("top", "50%")
                .style("left", "50%")
                .style("transform", "translate(-50%, -50%)")
                .style("text-align", "center")
                .style("font-size", "16px")
                .style("color", "#666")
        }

        // Update the plots if showing bivariate normal
        if (shouldShow) {
            this.updatePlots();
        }
    }

    calculateStatistics(points) {
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

    generateContours(params) {
        const paths = [];

        for (let level of CONFIG.contourLevels) {
            const contourPoints = [];
            for (let angle = 0; angle < 2*Math.PI; angle += 2*Math.PI/100) {
                let r = 0;
                let dr = 0.2;
                let maxIter = 100;

                while (maxIter-- > 0) {
                    const x1 = params.meanX1 + r * Math.cos(angle);
                    const x2 = params.meanX2 + r * Math.sin(angle);
                    const density = Distribution.bivariateNormal(x1, x2, params);

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

    addGraphTitles(firstGraph, secondGraph) {
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

    addAxisTicks(graph, xScale, yScale, xPos, yPos, isFirstGraph = false) {
        const yAxisPadding = isFirstGraph ? 3 : 0;
        const xLabelOffset = 2.5;

        // Add X-axis ticks
        CONFIG.tickValues.forEach(tick => {
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
        CONFIG.tickValues.forEach(tick => {
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
}

// Initialize the visualization
const viz = new Visualization();
viz.initialize();