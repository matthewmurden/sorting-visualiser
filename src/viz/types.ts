export type Step =
  | { type: "compare"; i: number; j: number }
  | { type: "write"; i: number; value: number }
  | { type: "markSorted"; i: number }
  | { type: "done" };

export type Instrumentation = {
  comparisons: number;
  writes: number;
  startTime: number;
  endTime?: number;
};

export type VizState = {
  arr: number[];
  active: { i?: number; j?: number };
  sorted: Set<number>;
};
