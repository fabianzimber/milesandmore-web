"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  CatmullRomCurve3,
  type Group,
  type InstancedMesh,
  MathUtils,
  Object3D,
  TubeGeometry,
  Vector3,
} from "three";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const CITY_PAIRS: [number, number, number, number][] = [
  [50.03, 8.57, 40.64, -73.78],   // FRA → JFK
  [1.35, 103.99, -33.94, 151.17], // SIN → SYD
  [51.47, -0.46, 25.25, 55.36],   // LHR → DXB
  [35.76, 140.39, 33.94, -118.41],// NRT → LAX
  [48.35, 11.79, 22.31, 113.91],  // MUC → HKG
  [41.98, -87.9, 51.47, -0.46],   // ORD → LHR
  [-23.43, -46.47, 40.49, -3.57], // GRU → MAD
  [55.97, 37.41, 25.08, 121.23],  // SVO → TPE
  [47.26, 11.34, 37.62, -122.38], // INN → SFO
  [59.65, 17.93, 35.55, 139.78],  // ARN → HND
];

function latLonToVec3(lat: number, lon: number, radius: number): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function GlobeParticles({ count, radius }: { count: number; radius: number }) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const positions = useMemo(() => {
    const pos: Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const lat = MathUtils.randFloat(-90, 90);
      const lon = MathUtils.randFloat(-180, 180);
      const noise = MathUtils.randFloat(-0.02, 0.02);
      pos.push(latLonToVec3(lat, lon, radius + noise));
    }
    return pos;
  }, [count, radius]);

  useEffect(() => {
    if (!meshRef.current) return;
    positions.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.scale.setScalar(MathUtils.randFloat(0.6, 1.2));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, dummy]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.elapsedTime * 0.03;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.012, 6, 6]} />
      <meshBasicMaterial color="#F0EDE8" transparent opacity={0.35} />
    </instancedMesh>
  );
}

function FlightArc({
  from,
  to,
  color,
  speed,
}: {
  from: [number, number];
  to: [number, number];
  color: string;
  speed: number;
}) {
  const radius = 2;
  const markerRef = useRef<Group>(null);

  const { curve, tubeGeometry } = useMemo(() => {
    const start = latLonToVec3(from[0], from[1], radius);
    const end = latLonToVec3(to[0], to[1], radius);
    const mid = start
      .clone()
      .add(end)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(radius * 1.35);

    const c = new CatmullRomCurve3([start, mid, end]);
    const tube = new TubeGeometry(c, 64, 0.006, 8, false);
    return { curve: c, tubeGeometry: tube };
  }, [from, to]);

  useFrame(({ clock }) => {
    if (!markerRef.current) return;
    const t = (clock.elapsedTime * speed) % 1;
    const point = curve.getPoint(t);
    markerRef.current.position.copy(point);
  });

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      </mesh>
      <group ref={markerRef}>
        <mesh>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial
            color={color}
            toneMapped={false}
          />
        </mesh>
        <mesh scale={2.5}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.08} />
        </mesh>
      </group>
    </group>
  );
}

function GlobeScene({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<Group>(null);
  const particleCount = isMobile ? 1500 : 4000;
  const arcCount = isMobile ? 4 : 10;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.elapsedTime * 0.04;
    groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.02) * 0.05 + 0.15;
  });

  return (
    <group ref={groupRef}>
      <GlobeParticles count={particleCount} radius={2} />

      {CITY_PAIRS.slice(0, arcCount).map((pair, i) => (
        <FlightArc
          key={i}
          from={[pair[0], pair[1]]}
          to={[pair[2], pair[3]]}
          color={i % 3 === 0 ? "#C8A96E" : i % 3 === 1 ? "#4A90D9" : "#6BA5E7"}
          speed={0.06 + i * 0.008}
        />
      ))}

      {/* Wireframe sphere outline */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#F0EDE8" wireframe transparent opacity={0.03} />
      </mesh>
    </group>
  );
}

export default function HeroGlobe({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const [isSupported, setIsSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsSupported(Boolean(window.WebGLRenderingContext));
    setIsMobile(window.innerWidth < 768);

    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!isSupported || shouldReduceMotion) {
    return (
      <div
        className={cn(
          "absolute inset-0 overflow-hidden",
          "bg-[radial-gradient(circle_at_50%_50%,rgba(74,144,217,0.12),transparent_50%),radial-gradient(circle_at_30%_40%,rgba(200,169,110,0.08),transparent_40%)]",
          className,
        )}
      />
    );
  }

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 40 }}
        dpr={isMobile ? [0.7, 1] : [1, 1.5]}
        performance={{ min: 0.5, max: 1, debounce: 200 }}
      >
        <color attach="background" args={["#050510"]} />
        <fog attach="fog" args={["#050510", 5, 12]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 5]} intensity={8} color="#C8A96E" />
        <pointLight position={[-4, -2, 3]} intensity={5} color="#4A90D9" />
        <GlobeScene isMobile={isMobile} />
      </Canvas>
      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(5,5,16,0.6)_70%,rgba(5,5,16,0.9)_100%)]" />
    </div>
  );
}
