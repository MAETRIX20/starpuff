/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { PetConfig, PetType } from "../types";
import { playSound } from "./AudioSynth";
import { Compass, ShieldAlert, Sparkles, Trophy, MapPin } from "lucide-react";

interface NebulaGateCanvasProps {
  userPet: PetConfig | null;
  onLoggedEvent: (log: string) => void;
  onGrantCoins: (amount: number) => void;
  isTaskAlreadyCompleted: boolean;
  onTaskCompleted: () => void;
}

interface Landmark {
  name: string;
  x: number;
  y: number;
  color: string;
  icon: string;
  chineseDesc: string;
}

interface ExplorerPet {
  name: string;
  type: PetType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  primaryColor: string;
  size: number;
  targetLandmark: Landmark | null;
  restingTimer: number;
  isUser: boolean;
}

const LANDMARKS: Landmark[] = [
  { name: "玫瑰星云公园", x: 120, y: 100, color: "#ff85a1", icon: "🌸", chineseDesc: "拥有梦幻的散逸粉尘滑草场" },
  { name: "彗尾跑道", x: 550, y: 120, color: "#4cc9f0", icon: "☄️", chineseDesc: "彗星加速粒子流冲浪滑坡" },
  { name: "织女星小镇", x: 330, y: 70, color: "#f72585", icon: "✨", chineseDesc: "松软像素团堆积的安眠小镇" },
  { name: "双子座沙滩", x: 100, y: 310, color: "#ffd166", icon: "🏖️", chineseDesc: "双星投影潮汐，暖流抚摸足尖" },
  { name: "猎户座森林", x: 580, y: 320, color: "#06d6a0", icon: "🌲", chineseDesc: "发光像素菌群与极光参天树" },
  { name: "仙女座喷泉", x: 340, y: 340, color: "#7209b7", icon: "⛲", chineseDesc: "星尘结晶流泉冲天而起" },
  { name: "银河图书馆", x: 340, y: 210, color: "#3a86c8", icon: "🪐", chineseDesc: "藏着宇宙之歌和星盘纪念卡片" }
];

const BACKEND_BOTS: Array<Omit<ExplorerPet, "x" | "y" | "vx" | "vy" | "targetLandmark" | "restingTimer" | "isUser">> = [
  { name: "斑斑", type: "狗", primaryColor: "#e07a5f", size: 10 },
  { name: "喵小九", type: "猫", primaryColor: "#ffd166", size: 9 },
  { name: "流星兔", type: "兔", primaryColor: "#a2d2ff", size: 9 },
  { name: "闪电青鸟", type: "鸟", primaryColor: "#560bad", size: 8 },
  { name: "波波熊", type: "其他", primaryColor: "#80ed99", size: 11 },
  { name: "千两小狗", type: "狗", primaryColor: "#f4f1de", size: 10 }
];

export default function NebulaGateCanvas({
  userPet,
  onLoggedEvent,
  onGrantCoins,
  isTaskAlreadyCompleted,
  onTaskCompleted
}: NebulaGateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // 30 seconds adventure tracking
  const [adventureSeconds, setAdventureSeconds] = useState(0);
  const [adventureDone, setAdventureDone] = useState(isTaskAlreadyCompleted);
  const timerRef = useRef<any>(null);

  // List of active participants
  const petsRef = useRef<ExplorerPet[]>([]);

  // Logs stored in internal component to scroll nicely
  const [internalLogs, setInternalLogs] = useState<string[]>([
    "★ 成功打开星云之门，AI宠物已启程自主漂流觅星...",
  ]);

  const addLog = (text: string) => {
    const formatted = `[${new Date().toLocaleTimeString()}] ${text}`;
    setInternalLogs(prev => [formatted, ...prev].slice(0, 30));
    onLoggedEvent(text);
  };

  // Start 30s quest timer
  useEffect(() => {
    if (adventureDone) return;
    
    timerRef.current = setInterval(() => {
      setAdventureSeconds(prev => {
        if (prev >= 29) {
          clearInterval(timerRef.current);
          setAdventureDone(true);
          onGrantCoins(20);
          onTaskCompleted();
          playSound("success");
          addLog("★ 星云大宇宙航行漫步满30秒！领取每日停留任务奖 +20 星尘币！🏆");
          return 30;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [adventureDone]);

  // Setup initial pet list
  useEffect(() => {
    const list: ExplorerPet[] = [];

    // User pet
    if (userPet) {
      list.push({
        name: userPet.name,
        type: userPet.type,
        x: 100 + Math.random() * 400,
        y: 100 + Math.random() * 200,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        primaryColor: userPet.primaryColor,
        size: 11,
        targetLandmark: null,
        restingTimer: 0,
        isUser: true
      });
    } else {
      // Default dummy pet
      list.push({
        name: "小萌宠(未升星)",
        type: "狗",
        x: 200,
        y: 150,
        vx: 0.8,
        vy: -0.5,
        primaryColor: "#ff7096",
        size: 10,
        targetLandmark: null,
        restingTimer: 0,
        isUser: true
      });
    }

    // Bots
    BACKEND_BOTS.forEach(bot => {
      list.push({
        ...bot,
        x: 50 + Math.random() * 600,
        y: 50 + Math.random() * 320,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        targetLandmark: null,
        restingTimer: 0,
        isUser: false
      });
    });

    petsRef.current = list;
    addLog(`✨ 星云守望者已集结完毕。当前世界共 ${list.length} 只宠物正在同屏漫游。`);
  }, [userPet]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const collisionCooldowns: Record<string, number> = {};

    const updateMap = () => {
      ctx.fillStyle = "#060312";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw faint space grid
      ctx.strokeStyle = "rgba(123, 97, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw beautiful astronomical orbit ripples
      ctx.strokeStyle = "rgba(123, 97, 255, 0.04)";
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 140, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 240, 0, Math.PI * 2);
      ctx.stroke();

      // V2.0 Upgrade: Draw beautiful 3D rotating stardust galactic vortex arm core in the center
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const totalSpiralGrains = 180;
      for (let j = 0; j < totalSpiralGrains; j++) {
        const spiralProgress = j / totalSpiralGrains;
        const angleOffset = frame * 0.012;
        const rad = spiralProgress * 160 + Math.sin(frame * 0.003) * 8;
        const angle = spiralProgress * Math.PI * 7.5 + angleOffset;
        
        // 3D coordinate rotation simulation (flattened disc angle)
        const x3d = Math.cos(angle) * rad;
        const y3d = Math.sin(angle) * rad * 0.42; 
        const z3d = Math.sin(angle) * rad * 0.15;
        
        const scaleVal = 320 / (320 + z3d);
        const pX = centerX + x3d * scaleVal;
        const pY = centerY + y3d * scaleVal;
        
        // Hsla particle dust array
        ctx.fillStyle = `hsla(${(275 + j * 0.4) % 360}, 80%, 75%, ${0.45 * (1 - spiralProgress)})`;
        ctx.fillRect(pX - 1.2, pY - 1.2, 2.4 * scaleVal, 2.4 * scaleVal);
      }
      ctx.restore();

      // Draw 七大地标 (Seven Landmarks as 3D Floating Islands)
      LANDMARKS.forEach((land) => {
        const hoverOffset = Math.sin(frame * 0.045 + land.x * 0.05) * 5.5;
        const ly = land.y + hoverOffset;

        // 1. Soft pulsing glow
        ctx.save();
        ctx.beginPath();
        const pulse = 18 + Math.sin(frame * 0.04 + land.x) * 6;
        const radGrad = ctx.createRadialGradient(land.x, ly, 2, land.x, ly, pulse);
        radGrad.addColorStop(0, `${land.color}45`);
        radGrad.addColorStop(0.5, `${land.color}12`);
        radGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = radGrad;
        ctx.arc(land.x, ly, pulse, 0, Math.PI * 2);
        ctx.fill();

        // 2. 3D Isometric floating landmass under the landmark
        ctx.fillStyle = land.color;
        // Top surface
        ctx.beginPath();
        ctx.moveTo(land.x, ly - 7);
        ctx.lineTo(land.x - 14, ly);
        ctx.lineTo(land.x, ly + 7);
        ctx.lineTo(land.x + 14, ly);
        ctx.closePath();
        ctx.fill();

        // Left facet shadow
        ctx.fillStyle = "rgba(0,0,0,0.32)";
        ctx.beginPath();
        ctx.moveTo(land.x - 14, ly);
        ctx.lineTo(land.x, ly + 7);
        ctx.lineTo(land.x, ly + 15);
        ctx.lineTo(land.x - 14, ly + 8);
        ctx.closePath();
        ctx.fill();

        // Right facet shadow
        ctx.fillStyle = "rgba(0,0,0,0.16)";
        ctx.beginPath();
        ctx.moveTo(land.x + 14, ly);
        ctx.lineTo(land.x, ly + 7);
        ctx.lineTo(land.x, ly + 15);
        ctx.lineTo(land.x + 14, ly + 8);
        ctx.closePath();
        ctx.fill();

        // Little floating side structures for depth
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(land.x - 18, ly + 4, 2, 2);
        ctx.fillRect(land.x + 16, ly - 3, 1.5, 1.5);

        // Draw text banner above the island
        ctx.font = "bold 9px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
        ctx.shadowBlur = 4;
        ctx.fillText(`${land.icon} ${land.name}`, land.x, ly - 14);
        ctx.restore();
      });

      // Update and Draw Pets
      const pets = petsRef.current;
      pets.forEach((pet) => {
        // 1. Landmark gravity routing
        if (pet.restingTimer > 0) {
          pet.restingTimer--;
          // decelerate/linger
          pet.vx *= 0.85;
          pet.vy *= 0.85;

          // occasional mini jitter
          if (Math.random() < 0.08) {
            pet.vx = (Math.random() - 0.5) * 0.6;
            pet.vy = (Math.random() - 0.5) * 0.6;
          }

          if (pet.restingTimer === 0) {
            pet.targetLandmark = null;
          }
        } else {
          // Wander mode
          // random force
          pet.vx += (Math.random() - 0.5) * 0.28;
          pet.vy += (Math.random() - 0.5) * 0.28;

          // cap speeds
          const speed = Math.hypot(pet.vx, pet.vy);
          if (speed > 1.8) {
            pet.vx = (pet.vx / speed) * 1.8;
            pet.vy = (pet.vy / speed) * 1.8;
          }

          // No target? Roll dice to attract to a landmark
          if (!pet.targetLandmark && Math.random() < 0.004) {
            pet.targetLandmark = LANDMARKS[Math.floor(Math.random() * LANDMARKS.length)];
            if (pet.isUser) {
              addLog(`🧭 探索：【${pet.name}】被【${pet.targetLandmark.name}】那头的微光吸引，开始偏转滑翔...`);
            }
          }

          // Apply pull vector if there's a target
          if (pet.targetLandmark) {
            const dx = pet.targetLandmark.x - pet.x;
            const dy = pet.targetLandmark.y - pet.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 35) {
              // Arrived! Linger for 180-320 frames
              pet.restingTimer = 180 + Math.floor(Math.random() * 140);
              if (pet.isUser) {
                addLog(`📍 地标打卡：【${pet.name}】抵达了【${pet.targetLandmark.name}】！它在此停留嬉耍——(${pet.targetLandmark.chineseDesc})。`);
                playSound("success");
              }
            } else {
              // Gravitational acceleration
              pet.vx += (dx / dist) * 0.06;
              pet.vy += (dy / dist) * 0.06;
            }
          }
        }

        // Apply movement
        pet.x += pet.vx;
        pet.y += pet.vy;

        // Wall bouncy rules
        const rBound = 16;
        if (pet.x < rBound) { pet.x = rBound; pet.vx *= -1; }
        if (pet.x > canvas.width - rBound) { pet.x = canvas.width - rBound; pet.vx *= -1; }
        if (pet.y < rBound) { pet.y = rBound; pet.vy *= -1; }
        if (pet.y > canvas.height - rBound) { pet.y = canvas.height - rBound; pet.vy *= -1; }

        // Render Pet Core (with high fidelity organic 2.5D details and trails)
        ctx.save();
        
        // Render physical stardust emission trail behind each floating pet
        const trailLen = 8;
        const trailAngle = Math.atan2(pet.vy, pet.vx) + Math.PI;
        ctx.beginPath();
        const gradTrail = ctx.createLinearGradient(pet.x, pet.y, pet.x + Math.cos(trailAngle) * 20, pet.y + Math.sin(trailAngle) * 20);
        gradTrail.addColorStop(0, pet.primaryColor);
        gradTrail.addColorStop(1, "rgba(0,0,0,0)");
        ctx.strokeStyle = gradTrail;
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.moveTo(pet.x, pet.y);
        ctx.lineTo(pet.x + Math.cos(trailAngle) * 20, pet.y + Math.sin(trailAngle) * 20);
        ctx.stroke();

        // Breath scale pulse
        const breathScale = 1.0 + Math.sin(frame * 0.1 + pet.x) * 0.08;
        const radius = 8 * breathScale;

        // Shadow backing
        ctx.shadowColor = pet.primaryColor;
        ctx.shadowBlur = 10;
        
        // Main rounded shaded body core
        const bodyGrad = ctx.createRadialGradient(pet.x, pet.y, 1, pet.x, pet.y, radius);
        bodyGrad.addColorStop(0, "#ffffff");
        bodyGrad.addColorStop(0.4, pet.primaryColor);
        bodyGrad.addColorStop(1, "rgba(5, 3, 15, 0.9)");
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(pet.x, pet.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Reactive velocity-facing Ears
        ctx.shadowBlur = 0;
        const motionY = Math.sin(frame * 0.15 + pet.y) * 1.5;
        if (pet.type === "猫") {
          ctx.fillStyle = pet.primaryColor;
          ctx.beginPath();
          // Left Ear
          ctx.moveTo(pet.x - 6, pet.y - 2);
          ctx.lineTo(pet.x - 7, pet.y - 11 + motionY);
          ctx.lineTo(pet.x - 2, pet.y - 6);
          // Right Ear
          ctx.moveTo(pet.x + 6, pet.y - 2);
          ctx.lineTo(pet.x + 7, pet.y - 11 + motionY);
          ctx.lineTo(pet.x + 2, pet.y - 6);
          ctx.fill();
        } else if (pet.type === "兔") {
          ctx.fillStyle = pet.primaryColor;
          ctx.fillRect(pet.x - 4, pet.y - 14 + motionY * 0.8, 2.5, 8);
          ctx.fillRect(pet.x + 1.5, pet.y - 14 + motionY * 0.8, 2.5, 8);
        } else {
          // Dog floppy ears swaying base motion
          ctx.fillStyle = pet.primaryColor;
          ctx.fillRect(pet.x - 9, pet.y - 5, 2, 7 + motionY * 0.5);
          ctx.fillRect(pet.x + 7, pet.y - 5, 2, 7 + motionY * 0.5);
        }

        // Blinking and tracking Eyes
        const isBlinking = (frame + Math.round(pet.x)) % 140 < 5;
        if (!isBlinking) {
          ctx.fillStyle = "#ffffff";
          // Small highlights
          ctx.fillRect(pet.x - 3.5, pet.y - 3, 1.8, 2.5);
          ctx.fillRect(pet.x + 1.5, pet.y - 3, 1.8, 2.5);
          // Small pupils Gaze tracking direction
          ctx.fillStyle = "#000000";
          const dX = pet.vx !== 0 ? Math.sign(pet.vx) * 0.5 : 0;
          const dY = pet.vy !== 0 ? Math.sign(pet.vy) * 0.5 : 0;
          ctx.fillRect(pet.x - 3.5 + dX, pet.y - 2.5 + dY, 1, 1.5);
          ctx.fillRect(pet.x + 1.5 + dX, pet.y - 2.5 + dY, 1, 1.5);
        } else {
          // Closed eye slit lines
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pet.x - 4.5, pet.y - 2);
          ctx.lineTo(pet.x - 2.5, pet.y - 2);
          ctx.moveTo(pet.x + 1.5, pet.y - 2);
          ctx.lineTo(pet.x + 3.5, pet.y - 2);
          ctx.stroke();
        }

        // Soft fuzzy fur contour highlights
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(pet.x, pet.y, radius + 1, Math.PI * 0.75, Math.PI * 1.25);
        ctx.stroke();

        // Name tag label and details
        ctx.font = pet.isUser ? "bold 9px pixel" : "8px monospace";
        ctx.fillStyle = pet.isUser ? "#ffd166" : "rgba(255,255,255,0.7)";
        ctx.textAlign = "center";
        ctx.fillText(pet.name, pet.x, pet.y + 13);
        ctx.restore();
      });

      // 2. Pairwise Collision check
      for (let i = 0; i < pets.length; i++) {
        for (let j = i + 1; j < pets.length; j++) {
          const p1 = pets[i];
          const p2 = pets[j];

          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 26) {
            // Collision event! Check cooldown to avoid flooding logs
            const key = `${p1.name}-${p2.name}`;
            const cooldown = collisionCooldowns[key] || 0;

            if (frame > cooldown) {
              // Trigger cooldown for next 350 frames (~6 seconds)
              collisionCooldowns[key] = frame + 350;

              // Draw neon link beam
              ctx.save();
              ctx.beginPath();
              ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
              ctx.lineWidth = 2.5;
              ctx.setLineDash([2, 2]);
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.shadowColor = "#ffffff";
              ctx.shadowBlur = 10;
              ctx.stroke();

              // draw explosion particles
              ctx.beginPath();
              ctx.arc((p1.x+p2.x)/2, (p1.y+p2.y)/2, 15, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(255,255,255,0.2)";
              ctx.fill();
              ctx.restore();

              // Log narrative events if user is involved
              if (p1.isUser || p2.isUser) {
                const userGuy = p1.isUser ? p1 : p2;
                const otherGuy = p1.isUser ? p2 : p1;
                
                playSound("chime");
                
                const dialogues = [
                  `碰擦相遇！与【${otherGuy.name}】温柔地在星空轨道滑步交叠，星迹缠绕飘出了美妙音律。`,
                  `互撒温度！和【${otherGuy.name}】贴贴尾翼，分享了一撮星尘粒子，回忆亲密感加倍。`,
                  `并肩漫游！在星系交汇处与【${otherGuy.name}】对视微笑，好像一起听到了遥远主人的呢喃。`
                ];
                addLog(dialogues[Math.floor(Math.random() * dialogues.length)]);
              }
            }
          }
        }
      }

      frame++;
      animationRef.current = requestAnimationFrame(updateMap);
    };

    updateMap();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [userPet]);

  return (
    <div className="space-y-4" id="nebula-gate-explore-panel">
      
      {/* 30 seconds indicator */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Compass className="w-5 h-5 animate-spin-slow" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>探索进度：星云漫步停留 30s 挑战</span>
              {adventureDone && <Trophy className="w-4 h-4 text-yellow-400" />}
            </div>
            <p className="text-[10px] text-gray-400">
              在大世界看星寻星，触发宠物碰撞或停留事件，全自动记录于今日回忆日志
            </p>
          </div>
        </div>

        {/* Stay Progress */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="text-xs font-mono text-indigo-300 w-14 text-right">
            {adventureSeconds}s / 30s
          </div>
          <div className="relative w-full md:w-40 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-1000"
              style={{ width: `${(adventureSeconds / 30) * 100}%` }}
            />
          </div>
          <span className="text-[10px] p-1 bg-white/5 border border-white/5 rounded text-gray-400">
            {adventureDone ? "已奖" : "+20 币"}
          </span>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative flex justify-center">
        <canvas
          ref={canvasRef}
          width={700}
          height={430}
          className="w-full h-auto bg-[#060312] rounded-2xl border border-white/10 shadow-2xl"
          id="nebula-gate-universe-canvas"
        />

        {/* Canvas overlays */}
        <div className="absolute top-3 left-3 bg-black/60 border border-slate-800 rounded-lg p-2 text-[10px] text-amber-300 pointer-events-none select-none flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>大世界多端模拟：同屏漫游 6人</span>
        </div>
      </div>

      {/* Event Log Window */}
      <div className="bg-slate-950/70 border border-white/10 rounded-xl p-4 flex flex-col h-40">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <h4 className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            星云奇遇记 实时AI碰撞日志（星门事件）
          </h4>
          <span className="text-[8px] text-slate-500 font-mono">ASTROCADE COLLISION TRACKER</span>
        </div>
        <div className="overflow-y-auto flex-1 space-y-2 pr-1 custom-scrollbar text-xs">
          {internalLogs.map((log, idx) => (
            <div key={idx} className="font-mono text-gray-300 leading-relaxed border-b border-white/5 pb-1 last:border-0 pl-2 border-l-2 border-indigo-500/20">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
