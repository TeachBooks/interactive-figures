// Select elements
const learningRateInput = document.getElementById("learningRate");
const iterationsInput = document.getElementById("iterations");
const degreeInput = document.getElementById("degree");
const startButton = document.getElementById("startButton");

// Update UI display
learningRateInput.addEventListener("input", updateUI);
iterationsInput.addEventListener("input", updateUI);
degreeInput.addEventListener("input", updateUI);

function updateUI() {
    document.getElementById("lrValue").innerText = learningRateInput.value;
    document.getElementById("iterValue").innerText = iterationsInput.value;
    document.getElementById("degreeValue").innerText = degreeInput.value;
}

// Generate normalized data
let data = d3.range(30).map(() => ({ x: (Math.random() * 10 - 5) / 5, y: Math.random() * 10 }));

// Polynomial function
function polynomial(coeffs, x) {
    return coeffs.reduce((sum, coeff, i) => sum + coeff * Math.pow(x, i), 0);
}

// Set up the plot
const width = 750, height = 500, margin = 60;
const xScale = d3.scaleLinear().domain([-1, 1]).range([margin, width - margin]);
const yScale = d3.scaleLinear().domain([0, 10]).range([height - margin, margin]);

d3.select("#dataPlot").selectAll("*").remove(); // Remove existing SVG before re-adding

const svg = d3.select("#dataPlot")
    .append("svg")
    .attr("width", width + 80)
    .attr("height", height + 80)
    .append("g")
    .attr("transform", `translate(40,20)`);

// Add axes
const xAxis = d3.axisBottom(xScale).ticks(10);
const yAxis = d3.axisLeft(yScale).ticks(10);

svg.append("g").attr("transform", `translate(0,${height - margin})`).call(xAxis);
svg.append("g").attr("transform", `translate(${margin},0)`).call(yAxis);

// Add labels
svg.append("text").attr("x", width / 2).attr("y", height - 10).style("text-anchor", "middle").text("X Values");
svg.append("text").attr("transform", "rotate(-90)").attr("y", 40).attr("x", -height / 2).attr("dy", "-25px").style("text-anchor", "middle").text("Y Values");

// Title
svg.append("text").attr("x", width / 2).attr("y", 0).attr("text-anchor", "middle").style("font-size", "18px").style("font-weight", "bold").text("Polynomial Regression with Gradient Descent");

// Data points
const circles = svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 4)
    .attr("fill", "blue");

// Train function
async function trainModel() {
    let degree = parseInt(degreeInput.value);
    let baseLearningRate = Math.min(parseFloat(learningRateInput.value), 0.1);
    let iterations = parseInt(iterationsInput.value);
    let learningRate = baseLearningRate;

    let coeffs = new Array(degree + 1).fill(0).map(() => Math.random() * 0.5 - 0.25); // Small centered values

    for (let iter = 0; iter < iterations; iter++) {
        let gradients = new Array(degree + 1).fill(0);
        let prevCoeffs = [...coeffs];

        // Compute gradients
        data.forEach(point => {
            let pred = polynomial(coeffs, point.x);
            let error = pred - point.y;
            gradients = gradients.map((grad, i) => grad + (2 / data.length) * error * Math.pow(point.x, i));
        });

        // Clip gradients
        let maxGrad = Math.max(...gradients.map(Math.abs));
        if (maxGrad > 1) {
            gradients = gradients.map(g => g / maxGrad);
        }

        // Update coefficients
        coeffs = coeffs.map((c, i) => c - learningRate * gradients[i]);

        // Clip coefficients
        coeffs = coeffs.map(c => Math.max(-1, Math.min(1, c)));

        // Reduce learning rate dynamically
        learningRate = baseLearningRate / (1 + iter / (iterations / 10));

        updatePlot(coeffs);
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

// Update plot
function updatePlot(coeffs) {
    const lineGenerator = d3.line()
        .x(d => xScale(d))
        .y(d => yScale(Math.max(0, Math.min(10, polynomial(coeffs, d)))));

    let regressionLine = svg.selectAll(".regression-line").data([coeffs]);

    regressionLine
        .join(
            enter => enter.append("path")
                .attr("class", "regression-line")
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 2)
                .style("opacity", 1)
                .attr("d", lineGenerator(d3.range(-1, 1, 0.05))),
            update => update.transition().duration(300).ease(d3.easeLinear).attr("d", lineGenerator(d3.range(-1, 1, 0.05))),
            exit => exit.remove()
        );
}

// Attach start button event
startButton.addEventListener("click", trainModel);
