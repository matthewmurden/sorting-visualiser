import type { Step } from "../viz/types";

function* merge(
  arr: number[],
  l: number,
  m: number,
  r: number
): Generator<Step> {
  const left = arr.slice(l, m + 1);
  const right = arr.slice(m + 1, r + 1);

  let i = 0, j = 0, k = l;

  while (i < left.length && j < right.length) {
    yield { type: "compare", i: l + i, j: m + 1 + j };
    if (left[i] <= right[j]) {
      arr[k] = left[i];
      yield { type: "write", i: k, value: arr[k] };
      i++; k++;
    } else {
      arr[k] = right[j];
      yield { type: "write", i: k, value: arr[k] };
      j++; k++;
    }
  }
  while (i < left.length) {
    arr[k] = left[i];
    yield { type: "write", i: k, value: arr[k] };
    i++; k++;
  }
  while (j < right.length) {
    arr[k] = right[j];
    yield { type: "write", i: k, value: arr[k] };
    j++; k++;
  }
}

function* mergeSortRange(
  arr: number[],
  l: number,
  r: number
): Generator<Step> {
  if (l >= r) {
    yield { type: "markSorted", i: l };
    return;
  }
  const m = Math.floor((l + r) / 2);
  yield* mergeSortRange(arr, l, m);
  yield* mergeSortRange(arr, m + 1, r);
  yield* merge(arr, l, m, r);
  // Mark sorted for this segment (optional: just the ends)
  for (let i = l; i <= r; i++) {
    yield { type: "markSorted", i };
  }
}

export function* mergeSort(arr: number[]): Generator<Step> {
  const copy = arr.slice();
  yield* mergeSortRange(copy, 0, copy.length - 1);
  yield { type: "done" };
}
