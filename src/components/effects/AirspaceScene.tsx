"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  type Group,
  Line as ThreeLine,
  LineBasicMaterial,
  MathUtils,
  Vector3,
  type Vector3Tuple,
} from "three";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AirspaceSceneProps {
  className?: string;
  density?: "hero" | "compact";
}

function FlightLane({
  points,
  color,
  speed,
}: {
  points: Vector3Tuple[];
  color: string;
  speed: number;
}) {
  const geometry = useMemo(() => {
    const curve = new CatmullRomCurve3(points.map((point) => new Vector3(...point)));
    return new BufferGeometry().setFromPoints(curve.getPoints(80));
  }, [points]);

  const lineObject = useMemo(
    () => new ThreeLine(geometry, new LineBasicMaterial({ color, transparent: true, opacity: 0.35 })),
    [color, geometry],
  );
  const markerRef = useRef<Group>(null);
  const curveData = useMemo(() => {
    return new CatmullRomCurve3(points.map((point) => new Vector3(...point)));
  }, [points]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      if (Array.isArray(lineObject.material)) {
        lineObject.material.forEach((m) => m.dispose());
      } else {
        lineObject.material.dispose();
      }
    };
  }, [geometry, lineObject]);

  useFrame(({ clock }) => {
    if (!markerRef.current) return;
    const t = (clock.elapsedTime * speed) % 1;
    const current = curveData.getPoint(t);
    markerRef.current.position.copy(current);
  });

  return (
    <group>
      <primitive object={lineObject} />
      <group ref={markerRef}>
        <mesh>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh scale={1.9}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.1} />
        </mesh>
      </group>
    </group>
  );
}

function Atmosphere({ count, compact }: { count: number; compact: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        position: [
          MathUtils.randFloatSpread(compact ? 7 : 11),
          MathUtils.randFloatSpread(compact ? 4.5 : 6.5),
          MathUtils.randFloat(-3, 2),
        ] as Vector3Tuple,
        scale: MathUtils.randFloat(0.012, compact ? 0.04 : 0.05),
        hue: index % 3,
      })),
    [compact, count],
  );

  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.07) * 0.1;
    groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.18) * 0.1;
  });

  const colors = useMemo(() => [new Color("#6cb3ff"), new Color("#c8a96e"), new Color("#7cc9ff")], []);

  return (
    <group ref={groupRef}>
      {particles.map((particle, index) => (
        <mesh key={index} position={particle.position} scale={particle.scale}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={colors[particle.hue]} transparent opacity={particle.hue === 1 ? 0.5 : 0.35} />
        </mesh>
      ))}

      <mesh position={[0, 0, -2]} rotation={[0.5, 0.2, 0]}>
        <torusGeometry args={[compact ? 2.4 : 3.1, 0.02, 16, 120]} />
          <meshBasicMaterial color="#4a90d9" transparent opacity={0.16} />
      </mesh>
      <mesh position={[0.8, -0.1, -2.2]} rotation={[0.8, 0.3, 0.5]}>
        <torusGeometry args={[compact ? 1.6 : 2.2, 0.02, 16, 120]} />
          <meshBasicMaterial color="#c8a96e" transparent opacity={0.14} />
      </mesh>
    </group>
  );
}

export default function AirspaceScene({ className, density = "hero" }: AirspaceSceneProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isSupported, setIsSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsSupported(Boolean(window.WebGLRenderingContext));
      setIsMobile(window.innerWidth < 768);
    };
    const frame = window.requestAnimationFrame(update);
    window.addEventListener("resize", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!isSupported || shouldReduceMotion) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          "bg-[radial-gradient(circle_at_18%_24%,rgba(74,144,217,0.22),transparent_28%),radial-gradient(circle_at_78%_16%,rgba(200,169,110,0.18),transparent_24%),radial-gradient(circle_at_50%_88%,rgba(124,201,255,0.14),transparent_30%)]",
          className,
        )}
      />
    );
  }

  const compact = density === "compact" || isMobile;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 42 }}
        dpr={compact ? [0.7, 1] : [1, 1.5]}
        performance={{ min: 0.5, max: 1, debounce: 200 }}
      >
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#030814", 5, 11]} />
        <ambientLight intensity={0.7} />
        <pointLight position={[2, 3, 4]} intensity={10} color="#6cb3ff" />
        <pointLight position={[-3, -1, 2]} intensity={6} color="#c8a96e" />
        <Atmosphere count={compact ? 52 : 120} compact={compact} />
        <FlightLane color="#6cb3ff" speed={0.035} points={[[-3.2, 1.1, -1.4], [-1.5, 1.8, -1.6], [1.1, 0.4, -1.4], [3.3, 1.4, -1.8]]} />
        <FlightLane color="#c8a96e" speed={0.024} points={[[-3.4, -0.8, -1.8], [-1.2, 0.3, -1.2], [1.5, -1.1, -1.4], [3.4, -0.1, -1.8]]} />
        <FlightLane color="#7cc9ff" speed={0.03} points={[[-2.6, -1.7, -1.4], [-0.8, -0.4, -1], [1.2, -0.8, -1.1], [2.8, -1.8, -1.6]]} />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,6,19,0.24)_70%,rgba(2,6,19,0.58)_100%)]" />
    </div>
  );
}
