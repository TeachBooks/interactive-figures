export class SVGTemplate {
  constructor(filePath) {
    this.filePath = filePath;
    this.svgElement = null;
  }

  async load() {
    const response = await fetch(this.filePath);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "image/svg+xml");
    this.svgElement = doc.documentElement;
  }

  attachTo(containerId) {
    document.getElementById(containerId).appendChild(this.svgElement);
  }

  getElementById(id) {
    return this.svgElement.querySelector(`#${id}`);
  }
}
