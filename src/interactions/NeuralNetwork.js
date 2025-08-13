export class NeuralNetwork {
  constructor(layers, activation = 'sigmoid') {
    this.layers = layers;
    this.weights = [];
    this.biases = [];

    for (let i = 1; i < layers.length; i++) {
      this.weights.push(
        Array.from({ length: layers[i] }, () =>
          Array.from({ length: layers[i - 1] }, () => Math.random() * 2 - 1)
        )
      );
      this.biases.push(Array.from({ length: layers[i] }, () => Math.random() * 2 - 1));
    }

    this.activation = activation;
  }

  activate(x) {
    return this.activation === 'tanh' ? Math.tanh(x) : 1 / (1 + Math.exp(-x));
  }

  derivative(x) {
    if (this.activation === 'tanh') {
      const t = Math.tanh(x);
      return 1 - t * t;
    }
    const s = 1 / (1 + Math.exp(-x));
    return s * (1 - s);
  }

  forward(input) {
    let a = input;
    const activations = [a];
    const zs = [];

    for (let i = 0; i < this.weights.length; i++) {
      const z = this.weights[i].map((w, j) =>
        w.reduce((sum, weight, k) => sum + weight * a[k], this.biases[i][j])
      );
      zs.push(z);
      a = z.map(this.activate.bind(this));
      activations.push(a);
    }
    // console.log("Activations:", activations);

    return { activations, zs };
  }

  trainBatch(batch, lr) {
    // Initialize accumulators for gradients
    const weightGrads = this.weights.map(w => w.map(row => row.map(() => 0)));
    const biasGrads = this.biases.map(b => b.map(() => 0));
    let batchError = 0;

    batch.forEach(({ x, y }) => {
      const { activations, zs } = this.forward(x);

      // Compute error for RMSE
      const errors = activations.at(-1).map((a, i) => a - y[i]);
      batchError += errors.reduce((sum, e) => sum + e * e, 0);
      // Compute deltas for last layer
      let delta = activations.at(-1).map((a, i) => (a - y[i]) * this.derivative(zs.at(-1)[i]));
      const deltas = [delta];

      // Backpropagate
      for (let l = this.weights.length - 2; l >= 0; l--) {
        const wNext = this.weights[l + 1];
        delta = this.weights[l].map((_, j) =>
          wNext.reduce((sum, row, k) => sum + row[j] * deltas[0][k], 0) * this.derivative(zs[l][j])
        );
        deltas.unshift(delta);
      }

      // Accumulate gradients
      deltas.forEach((d, l) => {
        d.forEach((dj, j) => {
          biasGrads[l][j] += dj;
          activations[l].forEach((a, k) => {
            weightGrads[l][j][k] += dj * a;
          });
        });
      });
    });

    // Apply averaged gradients
    const batchSize = batch.length;
    for (let l = 0; l < this.weights.length; l++) {
      for (let j = 0; j < this.weights[l].length; j++) {
        this.biases[l][j] -= (lr / batchSize) * biasGrads[l][j];
        for (let k = 0; k < this.weights[l][j].length; k++) {
          this.weights[l][j][k] -= (lr / batchSize) * weightGrads[l][j][k];
        }
      }
    }
    return Math.sqrt(batchError / batchSize); // RMSE for this batch
  }
  updateLayers(newLayers) {
    this.layers = newLayers;
    this.weights = [];
    this.biases = [];

    for (let i = 1; i < newLayers.length; i++) {
      this.weights.push(
        Array.from({ length: newLayers[i] }, () =>
          Array.from({ length: newLayers[i - 1] }, () => Math.random() * 2 - 1)
        )
      );
      this.biases.push(Array.from({ length: newLayers[i] }, () => Math.random() * 2 - 1));
    }
  }
}
