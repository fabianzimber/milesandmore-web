"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdaptiveDpr, Line } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from "@react-three/postprocessing";
import { Canvas, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import {
  CatmullRomCurve3,
  Group,
  InstancedMesh,
  Matrix4,
  Object3D,
  Vector2,
  Vector3,
} from "three";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface HeroGlobeProps {
  className?: string;
}

interface RouteDefinition {
  start: [number, number];
  end: [number, number];
  color: string;
  speed: number;
}

const ROUTES: RouteDefinition[] = [
  { start: [50.1109, 8.6821], end: [40.6413, -73.7781], color: "#c8a96e", speed: 0.05 },
  { start: [1.3644, 103.9915], end: [-33.8688, 151.2093], color: "#6cb3ff", speed: 0.035 },
  { start: [35.5494, 139.7798], end: [51.47, -0.4543], color: "#7cc9ff", speed: 0.04 },
  { start: [25.2532, 55.3657], end: [48.3538, 11.7861], color: "#c8a96e", speed: 0.046 },
  { start: [52.3086, 4.7639], end: [40.4983, -3.5676], color: "#5aa2f0", speed: 0.038 },
  { start: [19.4361, -99.0719], end: [4.7016, -74.1469], color: "#d4bc8a", speed: 0.05 },
  { start: [37.6213, -122.379], end: [21.3245, -157.9251], color: "#7cc9ff", speed: 0.03 },
  { start: [55.9726, 37.4146], end: [25.7959, -80.287], color: "#c8a96e", speed: 0.036 },
];

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;

  return new Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function GlobeParticles({ count, radius }: { count: number; radius: number }) {
  const meshRef = useRef<InstancedMesh>(null);
  const matrix = useMemo(() => new Matrix4(), []);
  const dummy = useMemo(() => new Object3D(), []);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const lat = gsap.utils.random(-80, 80);
        const lon = gsap.utils.random(-180, 180);
        const scale = gsap.utils.random(0.008, 0.024);
        return {
          position: latLonToVector3(lat, lon, radius + gsap.utils.random(-0.03, 0.03)),
          scale,
        };
      }),
    [count, radius],
  );

  useEffect(() => {
    if (!meshRef.current) {
      return;
    }

    particles.forEach((particle, index) => {
      dummy.position.copy(particle.position);
      dummy.scale.setScalar(particle.scale);
      dummy.updateMatrix();
      matrix.copy(dummy.matrix);
      meshRef.current?.setMatrixAt(index, matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [dummy, matrix, particles]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#d5dde8" transparent opacity={0.7} />
    </instancedMesh>
  );
}

function RouteArc({ route }: { route: RouteDefinition }) {
  const markerRef = useRef<Group>(null);
  const curve = useMemo(() => {
    const start = latLonToVector3(route.start[0], route.start[1], 1.72);
    const end = latLonToVector3(route.end[0], route.end[1], 1.72);
    const mid = start
      .clone()
      .add(end)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(2.18);

    return new CatmullRomCurve3([start, mid, end]);
  }, [route]);

  const points = useMemo(() => curve.getPoints(60), [curve]);

  useFrame(({ clock }) => {
    if (!markerRef.current) {
      return;
    }

    const point = curve.getPoint((clock.elapsedTime * route.speed) % 1);
    markerRef.current.position.copy(point);
  });

  return (
    <group>
      <Line points={points} color={route.color} lineWidth={1.2} transparent opacity={0.55} />
      <group ref={markerRef}>
        <mesh>
          <sphereGeometry args={[0.032, 12, 12]} />
          <meshBasicMaterial color={route.color} />
        </mesh>
        <mesh scale={1.9}>
          <sphereGeometry args={[0.032, 12, 12]} />
          <meshBasicMaterial color={route.color} transparent opacity={0.12} />
        </mesh>
      </group>
    </group>
  );
}

function GlobeScene({ mobile }: { mobile: boolean }) {
  const rootRef = useRef<Group>(null);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(rootRef.current!.rotation, {
        x: 0.42,
        y: 0.48,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "+=900",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  useFrame((_, delta) => {
    if (!rootRef.current) {
      return;
    }

    rootRef.current.rotation.y += delta * 0.09;
  });

  const activeRoutes = mobile ? ROUTES.slice(0, 4) : ROUTES;

  return (
    <group ref={rootRef}>
      <mesh>
        <sphereGeometry args={[1.68, 48, 48]} />
        <meshBasicMaterial color="#08111f" transparent opacity={0.95} />
      </mesh>
      <mesh scale={1.02}>
        <sphereGeometry args={[1.68, 48, 48]} />
        <meshBasicMaterial color="#4a90d9" transparent opacity={0.06} wireframe />
      </mesh>
      <GlobeParticles count={mobile ? 1500 : 3400} radius={1.72} />
      {activeRoutes.map((route, index) => (
        <RouteArc key={`${route.start.join("-")}-${route.end.join("-")}-${index}`} route={route} />
      ))}
    </group>
  );
}

export default function HeroGlobe({ className }: HeroGlobeProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsReady(Boolean(window.WebGLRenderingContext));
      setIsMobile(window.innerWidth < 768);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!isReady || shouldReduceMotion) {
    return (
      <div
        className={cn(
          "absolute inset-0 overflow-hidden",
          "bg-[radial-gradient(circle_at_50%_50%,rgba(74,144,217,0.18),transparent_18%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.12),transparent_30%),radial-gradient(circle_at_50%_50%,rgba(200,169,110,0.12),transparent_46%)]",
          className,
        )}
      >
        <div className="absolute inset-[16%] rounded-full border border-white/8" />
        <div className="absolute inset-[23%] rounded-full border border-white/6" />
      </div>
    );
  }

  return (
    <div className={cn("absolute inset-0", className)}>
      <Canvas
        dpr={isMobile ? [0.7, 1] : [1, 1.5]}
        camera={{ position: [0, 0, 5.1], fov: 38 }}
        gl={{ alpha: true, antialias: !isMobile }}
      >
        <color attach="background" args={["#050510"]} />
        <ambientLight intensity={1.2} />
        <pointLight position={[3, 3, 4]} intensity={18} color="#6cb3ff" />
        <pointLight position={[-4, -2, 2]} intensity={12} color="#c8a96e" />
        <AdaptiveDpr pixelated />
        <GlobeScene mobile={isMobile} />
        {!isMobile ? (
          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={0.8} intensity={1.1} />
            <ChromaticAberration offset={new Vector2(0.0012, 0.0012)} />
            <Vignette darkness={0.72} offset={0.2} />
            <Noise opacity={0.03} />
          </EffectComposer>
        ) : null}
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_18%,rgba(5,5,16,0.1)_55%,rgba(5,5,16,0.5)_100%)]" />
    </div>
  );
}
