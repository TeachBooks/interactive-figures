export class Gaussian {
  constructor(mu = [0, 0], corr = 0.7, sigma_x = 1, sigma_y = 1) {
    this.mu = mu;
    this.cov = [
      [sigma_x * sigma_x, sigma_x * sigma_y * corr],
      [sigma_y * sigma_x * corr, sigma_y * sigma_y]
    ];
    this.sigma_x = sigma_x;
    this.sigma_y = sigma_y;
    this.corr = corr;
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

    // Cholesky decomposition Σ = L * L^T
    const l11 = Math.sqrt(a);
    const l21 = b / l11;
    const l22 = Math.sqrt(c - l21 * l21);

    const samples = [];
    for (let i = 0; i < n; i++) {
      // Standard normal samples z1, z2
      const u1 = Math.random();
      const u2 = Math.random();
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

      // Transform: x = μ + L * z
      const x = this.mu[0] + l11 * z1;
      const y = this.mu[1] + l21 * z1 + l22 * z2;

      samples.push({ x, y });
    }
    return samples;
  }


  transformSamples(samples) {
    const L = [
      [this.sigma_x, 0],
      [this.sigma_y * this.corr, this.sigma_y * Math.sqrt(1 - (this.corr * this.corr))]
    ];
    // Transform each sample and add mean shift
    return samples.map(({ x, y }) => {
      const tx = L[0][0] * x + L[0][1] * y + this.mu[0];
      const ty = L[1][0] * x + L[1][1] * y + this.mu[1];
      return { x: tx, y: ty };
    });
  }


  // Update parameters
  update(mu, sigma_x, sigma_y, corr) {
    this.mu = mu;
    this.sigma_x = sigma_x;
    this.sigma_y = sigma_y;
    this.corr = Math.min(0.9999999, Math.max(-0.9999999, corr));
    this.cov = [
      [sigma_x * sigma_x, sigma_x * sigma_y * this.corr],
      [sigma_y * sigma_x * this.corr, sigma_y * sigma_y]
    ];
  }
}
