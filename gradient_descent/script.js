// Select elements
const learningRateInput = document.getElementById("learningRate");
const iterationsInput = document.getElementById("iterations");
const degreeInput = document.getElementById("degree");
const startButton = document.getElementById("startButton");

// Update text values dynamically
learningRateInput.addEventListener("input", updateUI);
iterationsInput.addEventListener("input", updateUI);
degreeInput.addEventListener("input", updateUI);

function updateUI() {
    document.getElementById("lrValue").innerText = learningRateInput.value;
    document.getElementById("iterValue").innerText = iterationsInput.value;
    document.getElementById("degreeValue").innerText = degreeInput.value;
}

// Attach training function ONLY to button click
startButton.addEventListener("click", trainModel);

// Generate 30 biased data points with a quadratic trend

// let rawData = d3.range(30).map(() => {
//     let x = Math.random() * 10;  // X in range [0,10]
//     let noise = (Math.random() - 0.5) * 3; // Random noise to make it realistic
//     let y = 0.5 * Math.pow(x, 2) - 2 * x + 3 + noise; // Quadratic pattern
//     return { x, y };
// });

let rawData = d3.range(30).map(() => {
    let x = Math.random() * 10 - 5; // X in range [-5,5] for better oscillations
    let noise = (Math.random() - 0.5) * 0.5; // Small noise to prevent overfitting
    let y = Math.sin(2 * x) + 0.3 * Math.pow(x, 2) - 0.5 * x + noise; // Oscillating pattern
    return { x, y };
});


// let rawData = d3.range(30).map(() => {
//     let x = Math.random() * 10;  // X in range [0,10]
//     let noise = (Math.random() - 0.5) * 3; // Random noise to make it realistic
//     let y = 0.5 * Math.pow(x, 3) - 2 * Math.pow(x, 2) + 3 * x + 5 + noise; // Cubic pattern
//     return { x, y };
// });


// Normalize the data
const xMean = d3.mean(rawData, d => d.x);
const xStd = d3.deviation(rawData, d => d.x);
const yMean = d3.mean(rawData, d => d.y);
const yStd = d3.deviation(rawData, d => d.y);

let data = rawData.map(d => ({
    x: Math.max(-1, Math.min(1, (d.x - xMean) / xStd)), // Clamp X within [-1,1]
    y: Math.max(-1.4, Math.min(1.4, (d.y - yMean) / yStd)) // Clamp Y within [-1.4,1.4]
}));

// Polynomial function to compute values
function polynomial(coeffs, x) {
    return coeffs.reduce((sum, coeff, i) => sum + coeff * Math.pow(x, i), 0);
}

// Set up the plot
const width = 750, height = 500, margin = 60;
const xScale = d3.scaleLinear().domain([-1, 1]).range([margin, width - margin]);
const yScale = d3.scaleLinear().domain([-1.4, 1.4]).range([height - margin, margin]);

// Ensure only one SVG exists
d3.select("#dataPlot").selectAll("*").remove();

const svg = d3.select("#dataPlot")
    .append("svg")
    .attr("width", width + 80)
    .attr("height", height + 80)
    .append("g")
    .attr("transform", `translate(40,20)`);

// Add axes
const xAxis = d3.axisBottom(xScale).ticks(10);
const yAxis = d3.axisLeft(yScale).ticks(10);

svg.append("g")
    .attr("transform", `translate(0,${height - margin})`)
    .call(xAxis);

svg.append("g")
    .attr("transform", `translate(${margin},0)`)
    .call(yAxis);

// Add axis labels
svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .style("text-anchor", "middle")
    .text("Normalized X Values");

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 40)
    .attr("x", -height / 2)
    .attr("dy", "-25px")
    .style("text-anchor", "middle")
    .text("Y Values");

// Add graph title
svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Polynomial Regression with Gradient Descent");


// Add data points
const circles = svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 4)
    .attr("fill", "blue");

async function trainModel() {
    document.getElementById("statusMessage").innerText = "Iterating...";

    // Clear previous regression lines before starting
    svg.selectAll(".regression-step").remove();

    let degree = parseInt(degreeInput.value);
    let baseLearningRate = Math.min(parseFloat(learningRateInput.value), 0.1);
    let iterations = parseInt(iterationsInput.value);
    let learningRate = baseLearningRate;

    let coeffs = new Array(degree + 1).fill(0).map(() => Math.random() * 0.2 - 0.1);

    for (let iter = 0; iter < iterations; iter++) {
        let gradients = new Array(degree + 1).fill(0);

        data.forEach(point => {
            let pred = polynomial(coeffs, point.x);
            let error = pred - point.y;
            gradients = gradients.map((grad, i) => grad + (2 / data.length) * error * Math.pow(point.x, i));
        });

        // Update coefficients
        coeffs = coeffs.map((c, i) => c - learningRate * gradients[i]);

        // Adjust learning rate dynamically
        learningRate = baseLearningRate / (1 + iter / (iterations / 5));

        // Prevent extreme coefficient values
        coeffs = coeffs.map(c => Math.max(-3, Math.min(3, c)));

        // Update visualization with step tracking
        updatePlot(coeffs, iter, iterations);

        await new Promise(resolve => setTimeout(resolve, 10));
    }

    document.getElementById("statusMessage").innerText = "Done!";
}




// Function to update the plot
function updatePlot(coeffs, iteration, maxIterations) {
    const xRange = d3.range(-1, 1, 0.05); // Ensure X stays in [-1,1]

    const lineGenerator = d3.line()
        .x(d => xScale(Math.max(-1, Math.min(1, d)))) // Clamp X within [-1,1]
        .y(d => yScale(polynomial(coeffs, d))); // Y is already constrained in training

    let opacityScale = d3.scaleLinear()
        .domain([0, maxIterations]) // Map iterations to opacity
        .range([0.1, 1]); // Older steps become more transparent

    // Append new regression line for each step
    svg.append("path")
        .attr("class", "regression-step")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .style("opacity", opacityScale(iteration)) // Newer steps are more visible
        .attr("d", lineGenerator(xRange));
}


// Add legend container OUTSIDE the XY graph but inside the grey box
const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 120}, ${height / 2 - 220})`); // Center vertically

// Add legend background box
legend.append("rect")
    .attr("x", -10)
    .attr("y", -10)
    .attr("width", 165)
    .attr("height", 70)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("rx", 5)
    .attr("ry", 5)
    .style("opacity", 0.8); // Slight transparency

// Legend for data points (first item)
legend.append("circle")
    .attr("cx", 10)
    .attr("cy", 15)
    .attr("r", 5)
    .style("fill", "blue");

legend.append("text")
    .attr("x", 30)
    .attr("y", 18)
    .style("font-size", "14px")
    .text("Data Points");

// Legend for regression line (second item, below the first)
legend.append("line")
    .attr("x1", 5)
    .attr("y1", 40)
    .attr("x2", 25)
    .attr("y2", 40)
    .attr("stroke", "red")
    .attr("stroke-width", 2);

legend.append("text")
    .attr("x", 30)
    .attr("y", 43)
    .style("font-size", "14px")
    .text("Regression Curve");


// Attach start button event listener
startButton.addEventListener("click", trainModel);
