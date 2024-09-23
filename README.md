# Introduction

This 'mini' project is meant to simplify the usage of [d3](https://d3js.org/). It is a JS library, which uses low-level approach to visualize data. It utilises [Scalable Vector Graphics (SVG)](https://developer.mozilla.org/en-US/docs/Web/SVG) which is also an XML-based markup language, and theoretically has infinite precision (since it utilises vectors). Compared to classical image formats, SVG looks amazing :).

# The why and how

This project has been inspired by amazing interactive figures ![interactive-figure](/Images/bivariate_interactive_image.png) [Reference: Max Ramgraber](https://www.maxramgraber.com/interactive/Gaussian-parameters). This d3 JavaScript library allows for amazing customization and interactivness, which even [Tensorflow playground](https://playground.tensorflow.org/) utilises it.

## Drawback of d3

The library is not very beginner friendly. It requires to setup (draw) the actual axes first, before even considering plotting anything. A lot of d3 examples can be found in [observablehq](https://observablehq.com/@d3/gallery), and for a [simple scatter plot](https://observablehq.com/@d3/connected-scatterplot), half of the code is just setting up the axes:

```
  const svg = d3.create("svg")  
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(xAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("y2", marginTop + marginBottom - height)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", width)
          .attr("y", marginBottom - 4)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text(xLabel));

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(yAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text(yLabel));

```

## How to make it better?

This 'mini' project idea is to abstract d3 code, as well as create static templates in [Inkscape](https://inkscape.org/), making it more intuitive to start off with d3. Taking as an example the figure above, the template would be created in Inkscape with layer and object names corresponding to the axes and input fields
![template-image](/Images/inkscape-static_template.png)

Therefore, instead of creating the SVG template with code, we can instead interact with the template made in Inkscape.

![d3-interaction](/Images/d3_select_axis.png)

## Goals

- Create a methodology to easily modify template images instead of writing a lot of code just to define the axes
- Abstract d3 code for most commonly used 'objects', e.g. sliders, buttons, input fields (as seen with the covariance matrix)
- Standardizing the image e.g.: ![image-standard](/Images/image_standards.png)
- Consider quiz-based interactive images, e.g.: user interactively changes values, in which the values can be used in a quiz as an answer

# Current state: Proof of concept development

- [x] Insert SVG image to a web page.
- [x] Select specific path element from the SVG
- [x] Update the SVG element attribute
- [ ] Create a very simple scatter or line plot utilising the template

# Useful documentation

- [manipulating-svg-using-d3js (amphinicy)](https://www.amphinicy.com/blog/post/manipulating-svg-using-d3js-library)
- [official d3-js documentation](https://d3js.org/d3-selection/modifying)
- [manipulating svg (observablehq)](https://observablehq.com/@mbostock/manipulating-svg-files)

