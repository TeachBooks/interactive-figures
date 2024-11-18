// Initial parameters for Gaussian distribution
let params = {
   meanX1: 0,
   meanX2: 0,
   stdX1: 1,
   stdX2: 1,
   correlation: 0
};

// Add legend for first graph (density contours)
function addLegends(firstGraph, secondGraph) {
// Add legend for first graph (density contours)
const firstLegend = firstGraph.append("text")
    .attr("class", "graph-title")
    .attr("x", 26)
    .attr("y", 129)
    .style("font-size", "2px")
    .style("fill", "black")
    .text("density contours");

// Add legend for second graph (samples)
const secondLegend = secondGraph.append("text")
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

    tickValues.forEach(tick => {
        // Add tick mark
        graph.append("line")
            .attr("class", "tick")
            .attr("x1", xScale(tick))
            .attr("y1", yPos)
            .attr("x2", xScale(tick))
            .attr("y2", yPos + 0.5)
            .attr("stroke", "black")
            .attr("stroke-width", "0.1");

        // Add tick label
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
        // Add tick mark
        graph.append("line")
            .attr("class", "tick")
            .attr("x1", xPos - yAxisPadding)
            .attr("y1", yScale(tick))
            .attr("x2", xPos - yAxisPadding - 0.5)
            .attr("y2", yScale(tick))
            .attr("stroke", "black")
            .attr("stroke-width", "0.1");

        // Add tick label
        graph.append("text")
            .attr("class", "tick-label")
            .attr("x", xPos - yAxisPadding - 1)
            .attr("y", yScale(tick))
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .style("font-size", "1.5px")
            .text(tick);
    });

    // Add X-axis label (X₁)
    graph.append("text")
        .attr("class", "axis-label")
        .attr("x", xScale(0))  // Center of x-axis
        .attr("y", yPos + 5)   // Below the axis
        .attr("text-anchor", "middle")
        .style("font-size", "2px")
        .text("X1");

    // Add Y-axis label (X₂)
    graph.append("text")
        .attr("class", "axis-label")
        .attr("x", xPos - yAxisPadding - (isFirstGraph ? 6 : 4))  // Adjust position based on graph
        .attr("y", yScale(0))  // Center of y-axis
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90 ${xPos - yAxisPadding - (isFirstGraph ? 6 : 4)} ${yScale(0)})`)
        .style("font-size", "2px")
        .text("X2");

    // Make sure labels are on top
    graph.selectAll(".axis-label").raise();
}

// Load the SVG with two xy graphs directly with D3
d3.xml("https://raw.githubusercontent.com/TeachBooks/interactive-figures/refs/heads/main/Images/usable_example.svg").then(data => {
    const importedSVG = data.documentElement;


    // Get current viewBox values
    const currentViewBox = importedSVG.getAttribute("viewBox").split(" ").map(Number);

    const newViewBox = [
        currentViewBox[0] - 10,
        currentViewBox[1],
        currentViewBox[2] + 10,
        currentViewBox[3]
    ];

    importedSVG.setAttribute("viewBox", newViewBox.join(" "));

    d3.select("#my_datavisualization").node().appendChild(importedSVG);

    // Create D3 selections for both graph groups
    const firstGraph = d3.select(importedSVG).select("#layer2"); // First xy graph
    firstGraph.attr("transform", "translate(-22,-130)");
    const secondGraph = d3.select(importedSVG).select("#layer1"); // Second xy graph
    secondGraph.attr("transform", "translate(-18,-130)");

    addLegends(firstGraph, secondGraph);

    // Calculate the transformation values for first graph
    const firstGraphPath = firstGraph.select("path");
    const firstBBox = firstGraphPath.node().getBBox();
    const firstXScale = d3.scaleLinear().domain([-5, 5]).range([firstBBox.x, firstBBox.x + firstBBox.width]);
    const firstYScale = d3.scaleLinear().domain([-5, 5]).range([firstBBox.y + firstBBox.height, firstBBox.y]);

    // Calculate the transformation values for second graph
    const secondGraphPaths = secondGraph.selectAll("path");
    const xPath = secondGraph.select("#x");
    const yPath = secondGraph.select("#y");

    // Get the bounding boxes for x and y paths
    const xBBox = xPath.node().getBBox();
    const yBBox = yPath.node().getBBox();

    // Create scales using the actual coordinates from the paths
    const secondXScale = d3.scaleLinear()
      .domain([-5, 5])
      .range([yBBox.x, xBBox.x + xBBox.width]);

    const secondYScale = d3.scaleLinear()
      .domain([-5, 5])
      .range([xBBox.y, yBBox.y]);

    // Ensure the text container exists
    const textGroup = d3.select(importedSVG).select("#layer4");

    // Create or select mean and sigma display elements
    textGroup.selectAll(".stat-value").remove();  // Remove old values if they exist

    // Get base positions for ticks from the paths
    const firstGraphBase = firstGraphPath.node().getBBox();
    const secondGraphBase = yPath.node().getBBox();

    // Add ticks to both graphs
    addAxisTicks(firstGraph, firstXScale, firstYScale,
                firstGraphBase.x, firstGraphBase.y + firstGraphBase.height);
    addAxisTicks(secondGraph, secondXScale, secondYScale,
                secondGraphBase.x, xBBox.y);

    const meanText = textGroup.append("text")
        .attr("class", "stat-value")
        .attr("x", 86.6)
        .attr("y", 131.6)
        .style("font-size", "2.11667px")
        .style("fill", "black");

    const sigma1Text = textGroup.append("text")
        .attr("class", "stat-value")
        .attr("x", 90)
        .attr("y", 135.5)
        .style("font-size", "2.11667px")
        .style("fill", "black");

    const sigma2Text = textGroup.append("text")
        .attr("class", "stat-value")
        .attr("x",90)
        .attr("y", 139.5)
        .style("font-size", "2.11667px")
        .style("fill", "black");

    // Function to calculate empirical statistics from points
    function calculateStatistics(points) {
        const meanX1 = d3.mean(points, d => d.x1);
        const meanX2 = d3.mean(points, d => d.x2);
        const stdX1 = Math.sqrt(d3.variance(points, d => d.x1));
        const stdX2 = Math.sqrt(d3.variance(points, d => d.x2));

        // Calculate empirical correlation
        const n = points.length;
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
        const margin = 3;

        // Create grid of points
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

    // Update the bivariateNormalDensity function to create wider spreads
    function bivariateNormalDensity(x1, x2, params) {
        const dx1 = x1 - params.meanX1;
        const dx2 = x2 - params.meanX2;
        const s1_2 = params.stdX1 * params.stdX1;
        const s2_2 = params.stdX2 * params.stdX2;
        const rho = params.correlation;

        const z = (dx1*dx1/s1_2 + dx2*dx2/s2_2 - 2*rho*dx1*dx2/(params.stdX1*params.stdX2))/(1-rho*rho);
        // Adjusted the denominator to create wider contours
        return Math.exp(-z/2) / (4 * Math.PI * params.stdX1 * params.stdX2 * Math.sqrt(1-rho*rho));
    }

    // Update the plot rendering function
    function updatePlots() {
        // Clear previous elements
        firstGraph.selectAll(".contour-element").remove();
        secondGraph.selectAll(".sample-point").remove();

        firstGraph.selectAll(".graph-title, .tick, .tick-label").raise();
        secondGraph.selectAll(".graph-title, .tick, .tick-label").raise();

        // Generate and draw contour paths
        const contourPaths = generateContours(params, firstXScale, firstYScale);

        // Create color scale for contours
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

        // Generate and draw sample points for the second graph
        const points = generateGaussianPoints(
            params.meanX1, params.meanX2,
            params.stdX1, params.stdX2,
            params.correlation
        );

        // Draw sample points
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
        meanText.text(`${stats.meanX1.toFixed(2)}, ${stats.meanX2.toFixed(2)}`);
        sigma1Text.text(`${stats.stdX1.toFixed(2)}`);
        sigma2Text.text(`${stats.stdX2.toFixed(2)}`);

        const sigmaX1Sq = Math.pow(stats.stdX1, 2);
        const sigmaX2Sq = Math.pow(stats.stdX2, 2);
        const covX1X2 = stats.correlation * stats.stdX1 * stats.stdX2;

        d3.select("#text2048").text(sigmaX1Sq.toFixed(2));
        d3.select("#text2052").text(sigmaX2Sq.toFixed(2));
        d3.select("#text2056").text(covX1X2.toFixed(2));
        d3.select("#text2060").text(covX1X2.toFixed(2));
    }

   // Initial render
   updatePlots();

   // Add event listeners for sliders
   d3.select("#meanX1").on("input", function() {
      params.meanX1 = +this.value;
      updatePlots();
   });
   d3.select("#meanX2").on("input", function() {
      params.meanX2 = +this.value;
      updatePlots();
   });
   d3.select("#stdX1").on("input", function() {
      params.stdX1 = +this.value;
      updatePlots();
   });
   d3.select("#stdX2").on("input", function() {
      params.stdX2 = +this.value;
      updatePlots();
   });
   d3.select("#correlation").on("input", function() {
      params.correlation = +this.value;
      updatePlots();
   });
});

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