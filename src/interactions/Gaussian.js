export class Gaussian {
  constructor(mu = [0, 0], cov = [[1, 0], [0, 1]]) {
    this.mu = mu;
    this.cov = cov;
    this.lastContours = []; // store drawn ellipses for cleanup
  }

  // Probability density function
  pdf(x, y) {
    const [mx, my] = this.mu;
    const [[a, b], [_, c]] = this.cov;
    const det = a * c - b * b;
    const invA = c / det;
    const invB = -b / det;
    const invC = a / det;
    const dx = x - mx;
    const dy = y - my;
    const exponent = -0.5 * (invA * dx * dx + 2 * invB * dx * dy + invC * dy * dy);
    return (1 / (2 * Math.PI * Math.sqrt(det))) * Math.exp(exponent);
  }

  // Draw contour ellipses
  drawContours(plotter, levels = [1, 2, 3], stroke = "red", strokeWidth = 0.1) {
    const { targetElement, xScale, yScale } = plotter;

    // Remove previous contours if any
    this.lastContours.forEach(el => el.remove());
    this.lastContours = [];

    const [[a, b], [_, c]] = this.cov;

    // Eigen decomposition for ellipse axes
    const trace = a + c;
    const det = a * c - b * b;
    const lambda1 = trace / 2 + Math.sqrt((trace * trace) / 4 - det);
    const lambda2 = trace / 2 - Math.sqrt((trace * trace) / 4 - det);
    const angle = 0.5 * Math.atan2(2 * b, a - c);

    const centerX = xScale(this.mu[0]);
    const centerY = yScale(this.mu[1]);

    levels.forEach(k => {
      const rx = Math.sqrt(lambda1) * k * (xScale(1) - xScale(0));
      const ry = Math.sqrt(lambda2) * k * (yScale(0) - yScale(1));

      const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
      ellipse.setAttribute("cx", centerX);
      ellipse.setAttribute("cy", centerY);
      ellipse.setAttribute("rx", rx);
      ellipse.setAttribute("ry", ry);
      ellipse.setAttribute("stroke", stroke);
      ellipse.setAttribute("stroke-width", strokeWidth);
      ellipse.setAttribute("fill", "none");
      ellipse.setAttribute("transform", `rotate(${angle * -180 / Math.PI}, ${centerX}, ${centerY})`);

      targetElement.appendChild(ellipse);
      this.lastContours.push(ellipse);
    });
  }

  // Generate samples
  sample(n = 100) {
    const [[a, b], [_, c]] = this.cov;

    // Cholesky decomposition of covariance matrix
    // L = [[l11, 0], [l21, l22]]
    const l11 = Math.sqrt(a);
    const l21 = b / l11;
    const l22 = Math.sqrt(c - l21 * l21);

    const samples = [];
    for (let i = 0; i < n; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

      // Apply linear transform: x = μ + L * z
      const x = (this.mu[0] + l11 * z1);
      const y = (this.mu[1] + l21 * z1 + l22 * z2);

      samples.push({ x, y });
    }
    return samples;
  }


  // Update parameters
  update(mu, cov) {
    this.mu = mu;
    this.cov = cov;
  }
}
