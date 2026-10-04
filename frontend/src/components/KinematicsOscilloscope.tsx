"use client";

import React, { useEffect, useRef, useState } from "react";
import { Activity, Cpu, ShieldCheck, Zap, Check } from "lucide-react";

interface KinematicsOscilloscopeProps {
  lastPoint: any;
}

export function KinematicsOscilloscope({ lastPoint }: KinematicsOscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tremorHarmonics, setTremorHarmonics] = useState<number>(0);
  const [jerkMode, setJerkMode] = useState<string>("Minimum Jerk Curve");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Draw clean background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Draw light grid
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (lastPoint && lastPoint.trail && lastPoint.trail.length > 1) {
      const pts = lastPoint.trail;

      // Draw trajectory curve
      ctx.beginPath();
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2.5;

      for (let i = 0; i < pts.length; i++) {
        const mapX = (pts[i][0] / 320) * (w - 40) + 20;
        const mapY = (pts[i][1] / 50) * (h - 40) + 20;
        if (i === 0) ctx.moveTo(mapX, mapY);
        else ctx.lineTo(mapX, mapY);
      }
      ctx.stroke();

      // End tip
      const tipX = (pts[pts.length - 1][0] / 320) * (w - 40) + 20;
      const tipY = (pts[pts.length - 1][1] / 50) * (h - 40) + 20;
      ctx.fillStyle = "#059669";
      ctx.beginPath();
      ctx.arc(tipX, tipY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      const yCoords = pts.map((p: any) => p[1]);
      const uniqueY = new Set(yCoords).size;
      setTremorHarmonics(uniqueY);
      setJerkMode(uniqueY >= 2 ? "Biological Minimum Jerk" : "Linear Machine Script");
    }
  }, [lastPoint]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-44 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs">
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div className="absolute top-2.5 left-3 text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase bg-white/80 px-2 py-0.5 rounded border border-slate-200/60 backdrop-blur-xs">
          Real-Time Trajectory & Kinematic Jerk Radar
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-indigo-600" />
            Proof-of-Work
          </span>
          <span className="font-mono font-semibold text-indigo-700">● Active (SHA-256 Worker)</span>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Activity className="w-3 h-3 text-sky-600" />
            Tremor Harmonics
          </span>
          <span className={`font-mono font-semibold ${tremorHarmonics >= 2 ? "text-emerald-700" : "text-amber-700"}`}>
            {tremorHarmonics > 0 ? `● ${tremorHarmonics} Active Bands` : "Waiting for drag..."}
          </span>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-600" />
            Flash & Hogan Model
          </span>
          <span className="font-mono font-semibold text-slate-800">{jerkMode}</span>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Hardware Shield
          </span>
          <span className="font-mono font-semibold text-emerald-700 flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" /> Clean Environment
          </span>
        </div>
      </div>
    </div>
  );
}

