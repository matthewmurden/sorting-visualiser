import type { Step, VizState, Instrumentation } from "./types";
import { CanvasRenderer } from "./renderer";

export class Player {
  private renderer: CanvasRenderer;
  private steps: Generator<Step> | null = null;
  private playing = false;
  private speedMs = 40; // lower = faster
  private rafId = 0;

  private state: VizState;
  private onDone: () => void;

  public instrumentation: Instrumentation = {
    comparisons: 0,
    writes: 0,
    startTime: 0,
  };

  constructor(canvas: HTMLCanvasElement, state: VizState, onDone: () => void) {
    this.state = state;
    this.onDone = onDone;

    this.renderer = new CanvasRenderer(canvas);
    this.renderer.draw(state);
  }

  setSpeed(multiplier: number) {
    // multiplier: 0.25 .. 3.0
    const base = 60;
    this.speedMs = base / multiplier;
  }

  setSteps(gen: Generator<Step>) {
    this.steps = gen;
    this.instrumentation = { comparisons: 0, writes: 0, startTime: performance.now() };
  }

  togglePlay() {
    this.playing = !this.playing;
    if (this.playing) this.loop();
    else cancelAnimationFrame(this.rafId);
  }

  stepOnce() {
    if (!this.steps) return;
    const res = this.steps.next();
    this.apply(res.value);
    if (res.done || res.value?.type === "done") {
      this.finish();
    }
  }

  private finish() {
    this.playing = false;
    this.instrumentation.endTime = performance.now();
    cancelAnimationFrame(this.rafId);
    this.onDone();
  }

  private lastTick = 0;

  private loop = (t = 0) => {
    this.rafId = requestAnimationFrame(this.loop);
    if (!this.playing || !this.steps) return;

    if (t - this.lastTick < this.speedMs) return;
    this.lastTick = t;

    const res = this.steps.next();
    this.apply(res.value);
    if (res.done || res.value?.type === "done") {
      this.finish();
    }
  };

  private apply(step?: Step) {
    if (!step) return;
    switch (step.type) {
      case "compare":
        this.state.active = { i: step.i, j: step.j };
        this.instrumentation.comparisons++;
        break;
      case "write":
        this.state.arr[step.i] = step.value;
        this.state.active = { i: step.i };
        this.instrumentation.writes++;
        break;
      case "markSorted":
        this.state.sorted.add(step.i);
        break;
      case "done":
        // no-op
        break;
    }
    this.renderer.draw(this.state);
  }
}
