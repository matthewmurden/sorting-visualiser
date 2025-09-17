import { useEffect, useRef, useState } from "react";
import { Player } from "./viz/player";
import { mergeSort } from "./algorithms/merge";
import type { VizState } from "./viz/types";
import { randomArray } from "./utils/randomArray";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [size, setSize] = useState(64);
  const [speed, setSpeed] = useState(1.0); // 0.25..3
  const [state, setState] = useState<VizState>(() => ({
    arr: randomArray(64),
    active: {},
    sorted: new Set(),
  }));
  const [stats, setStats] = useState({ comparisons: 0, writes: 0, ms: 0 });

  // init player
  useEffect(() => {
    if (!canvasRef.current) return;
    const p = new Player(canvasRef.current, state, () => {
      const { comparisons, writes, startTime, endTime } = p.instrumentation;
      setStats({
        comparisons,
        writes,
        ms: Math.max(0, (endTime ?? performance.now()) - startTime),
      });
    });
    p.setSpeed(speed);
    setPlayer(p);
  }, [canvasRef]);

  // keep speed in sync
  useEffect(() => {
    player?.setSpeed(speed);
  }, [speed, player]);

  function regenerate() {
    const arr = randomArray(size);
    const fresh: VizState = { arr, active: {}, sorted: new Set() };
    setState(fresh);
    if (player) {
      // Recreate player bound to new state
      const p = new Player(canvasRef.current!, fresh, () => {
        const { comparisons, writes, startTime, endTime } = p.instrumentation;
        setStats({
          comparisons,
          writes,
          ms: Math.max(0, (endTime ?? performance.now()) - startTime),
        });
      });
      p.setSpeed(speed);
      setPlayer(p);
    }
    setStats({ comparisons: 0, writes: 0, ms: 0 });
  }

  function runMerge() {
    if (!player) return;
    const gen = mergeSort([...state.arr]);
    player.setSteps(gen);
    player.togglePlay();
  }

  function stepOnce() {
    player?.stepOnce();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold">
          Sorting Visualiser <span className="text-brand">Merge Sort</span>
        </h1>
        <p className="text-sm text-brandMuted">
          React + TypeScript · Canvas · step-emitting algorithm
        </p>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Controls */}
        <div className="grid gap-3 sm:grid-cols-3 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={runMerge}
              className="px-3 py-2 rounded-lg bg-brand hover:opacity-90 transition"
            >
              Play / Pause
            </button>
            <button
              onClick={stepOnce}
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition"
            >
              Step
            </button>
            <button
              onClick={regenerate}
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition"
            >
              New Array
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-brandMuted w-24">Size: {size}</label>
            <input
              type="range"
              min={8}
              max={150}
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              onMouseUp={regenerate}
              onTouchEnd={regenerate}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-brandMuted w-24">
              Speed: {speed.toFixed(2)}×
            </label>
            <input
              type="range"
              min={0.25}
              max={3}
              step={0.05}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Comparisons" value={stats.comparisons.toString()} />
          <Stat label="Writes" value={stats.writes.toString()} />
          <Stat label="Elapsed (ms)" value={stats.ms.toFixed(1)} />
        </div>

        {/* Canvas */}
        <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800">
          <div className="aspect-[16/9] w-full">
            <canvas ref={canvasRef} className="w-full h-full block rounded-lg" />
          </div>
        </div>

        {/* Complexity card */}
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <h2 className="font-semibold">Merge Sort</h2>
          <ul className="text-sm text-brandMuted list-disc ml-5 mt-1">
            <li>Time: O(n log n) worst/avg/best</li>
            <li>Space: O(n)</li>
            <li>Stable: Yes</li>
            <li>In-place: No</li>
          </ul>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto p-4 text-xs text-zinc-500">
        Built with React + TypeScript + Tailwind. Visuals use Canvas.
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <div className="text-brandMuted text-xs">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
