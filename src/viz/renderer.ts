import type { VizState } from "./types";

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private dpr = window.devicePixelRatio || 1;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D not supported");
    this.ctx = ctx;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.floor(rect.width * this.dpr);
    this.canvas.height = Math.floor(rect.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  draw(state: VizState) {
    const { ctx } = this;
    const { arr, active, sorted } = state;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    const n = arr.length;
    const barWidth = w / n;
    const max = Math.max(...arr);

    for (let i = 0; i < n; i++) {
      const val = arr[i];
      const barHeight = (val / max) * (h * 0.95);
      const x = i * barWidth;
      const y = h - barHeight;

      // pick color state
      let color = "#334155"; // slate-700 base
      if (sorted.has(i)) color = "#16a34a";  // green-600
      if (i === active.i || i === active.j) color = "#1C72B9"; // brand

      ctx.fillStyle = color;
      ctx.fillRect(x + 1, y, Math.max(1, barWidth - 2), barHeight);
    }
  }
}
