export class EmpiricalCopula {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        try {
            this.x_unit = this.empiricalCDFTransform(x);
            this.y_unit = this.empiricalCDFTransform(y);

            // Precompute Gaussian transformed margins
            this.gaussianX = this.x_unit.map(u => this.gaussianMargins(u));
            this.gaussianY = this.y_unit.map(v => this.gaussianMargins(v));
        } catch (error) {
            console.error("Error computing empirical CDF or Gaussian margins:", error);
            this.x_unit = [];
            this.y_unit = [];
            this.gaussianX = [];
            this.gaussianY = [];
        }
    }

    empiricalCDFTransform(samples) {
        const n = samples.length;
        const sorted = [...samples].sort((a, b) => a - b);

        return samples.map(x => {
            // Find first index where value >= x
            const rank = sorted.findIndex(v => v >= x);
            const i = (rank === -1 ? n : rank + 1);
            // Apply Blom's formula
            return (i - 3 / 8) / (n + 1 / 4);
        });
    }

    gaussianMargins(u) {
        return jStat.normal.inv(u, 0, 1);
    }

    interpolateData(alpha) {
        const n = this.x_unit.length;
        const interpolated = [];

        for (let i = 0; i < n; i++) {
            interpolated.push({
                x: (1 - alpha) * this.x_unit[i] + alpha * this.gaussianX[i],
                y: (1 - alpha) * this.y_unit[i] + alpha * this.gaussianY[i],
            });
        }
        const maxX = Math.max(...interpolated.map(d => d.x));
        const maxY = Math.max(...interpolated.map(d => d.y));
        const minX = Math.min(...interpolated.map(d => d.x));
        const minY = Math.min(...interpolated.map(d => d.y));
        // console.log("Max X:", maxX, "Max Y:", maxY);
        // console.log('what', interpolated);
        return {interpolated, minX, minY, maxX, maxY};
    }
}
