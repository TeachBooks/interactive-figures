// myLibrary.js
{/* <html>
    <script src="https://d3js.org/d3.v7.min.js"></script>
</html> */}

function gaussianRandom(mean = 0, stdev = 0.1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // 
    return z * stdev + mean;
    // return 
}

function standard_Gaussian_pdf(mean=0, std=0.1) {
    var x = linspace(-3, 3, 201);
    // Create a dummy variable
    var result = [];
    normalize = math.dotDivide(
        1,
        math.sqrt(
            math.dotMultiply(
                math.dotMultiply(
                    2,
                    math.PI),
                math.pow(
                    std,
                    2))));

    var i;
    for (i = 0; i < x.length; i++) {
        // Evaluate the first element of the Gaussian mixture
        expon = math.exp(
            -math.dotDivide(
                math.pow(
                    x[i] - mean,
                    2),
                math.dotMultiply(
                    2,
                    math.pow(
                        std,
                        2))))
        temp = math.dotMultiply(
            normalize,
            expon)
        result.push(temp)
    }
    return result
}

function x_axis_limit(x_orig, x_sample) {
    // I get x + width, convert to location of x axis
    x0 = x_orig.x
    x1 = x0 + x_orig.width

    middle_point = x_orig.width / 2

    // map x_sample to values between x0 and x1
    x = x0 + x_sample * (x1 - x0)

    return x
}
function y_axis_limit(y_orig, y_sample) {
    // I get x + width, convert to location of x axis
    y0 = y_orig.y
    y1 = y0 + y_orig.height

    middle_point = y_orig.height / 2

    // map x_sample to values between x0 and x1
    y = y0 + y_sample * (y1 - y0)

    return y
}


class MudeSCI {
    constructor(image_link) {
        this.image = d3.svg(image_link); // read the template
    }
    // Simple stuff to get axes
    get x_axis() {
        return this.readpathx;
    }
    readpathx() {
        return d3.select('path#x');
    }
    get y_axis() {
        return this.readpathy;
    }
    readpathy() {
        return d3.select('path#y');
    }
    get whole_svg(){
        return this.readwholesvg;
    }
    readwholesvg(){
        return d3.select('svg');
    }
    get path_g(){
        return this.g_paths;
    }
    g_paths(){
        return d3.select('g');
    }
    // Create plot function
    line_plot(data, image, x_axis, y_axis) {
        // x-axis...
        var x = linspace(-3, 3, 201); // TODO!: think how to approach this... one quick example I have in mind now is: var x = linspace(min_x, max_x, data.length)
        // Remove lines before running the loop
        d3.selectAll(".line").remove()
        var i=0;
        for (i = 0; i < data.length-1; i++) {
            image.append('line')
                .attr("x1", x_axis_limit(x_axis.node().getBBox(), x[i]))
                .attr("y1", y_axis_limit(y_axis.node().getBBox(), data[i]))
                .attr("x2", x_axis_limit(x_axis.node().getBBox(), x[(i + 1)]))
                .attr("y2", y_axis_limit(y_axis.node().getBBox(), data[(i + 1)]))
                .style("stroke", "red")
                .style("stroke-width", height * 0.001) //TODO!: dynamic height adjustment
                .attr("id", "line")
                .attr("class", "line")
                .lower()
        }
    }


    // Add slider beneath the image

    get slider_data(){
        return this.create_slider();
    }
    create_slider(whole_svg, svg_g,x_axis,y_axis, x_loc, y_loc, fn) {
        // const xScale_inverse_left = d3.scaleLinear().domain(window_left_x).range([x_limits[0], x_limits[1]])

        // Increase image size :)

        whole_svg.style('height', whole_svg.node().height.baseVal.value+10) //I am able to increase height.. need to call this func when adding sliders, TODO: needs better approach
        // add the slider

        
        svg_g.append("circle") // probably must add index to circle
            .attr("cx", x_axis_limit(x_axis.node().getBBox(), x_loc)) //big TODO here
            .attr("cy", y_axis_limit(y_axis.node().getBBox(), y_loc)) //big TODO here
            .attr("r", whole_svg.node().height.baseVal.value * 0.01) // circle size either depends on the actual window of the website.. or SVG... TODO!: dynamic circle radius adjustment
            .attr("fill", "#8c000f")
            .call(d3.drag() // call specific function when circle is dragged
                .on("drag", function (event) {
                    

                    // Get the movement and the current object
                    var current = d3.select(this);

                    // Convert event.x between given range...

                    // By default, limit to the boundary of the image

                    // if (event.x < whole_svg)


                    // x_axis_limit(x_axis.node().getBBox(), x_loc) // this would be the 0
                    // whole_svg.node().height.baseVal.value

                    // TODO TASK~:
                    // 1. Select range in which the output works
                    // 2. Limit the circle to certain area/range
                    // 3. 

                    // // Limit movex, if necessary
                    // if (movex < window_left_x[0]) {
                    //    movex = window_left_x[0]
                    // } else if (movex > window_left_x[1]) {
                    //    movex = window_left_x[1]
                    // }

                    // Update drag handle position
                    current.style("cx", event.x)

                    if (event.x > 0) {
                        fn(event.x) // Attach this directly to a function???
                        // Yield or return the reading. TODO!!!!
                        // 
                    }


                }));
    }
}
