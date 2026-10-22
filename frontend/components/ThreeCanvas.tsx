'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let isVisible = true;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Create particle network
    const particleCount = 75;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    const radius = 55;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * radius * 2;
      positions[i3 + 1] = (Math.random() - 0.5) * radius * 1.4;
      positions[i3 + 2] = (Math.random() - 0.5) * radius;

      velocities.push({
        x: (Math.random() - 0.5) * 0.08,
        y: (Math.random() - 0.5) * 0.08,
        z: (Math.random() - 0.5) * 0.05,
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Points material (glowing soft dots)
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x6366f1, // indigo
      size: 3.2,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, pointsMaterial);
    scene.add(points);

    // Line network geometry
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
    });

    const maxConnections = 220;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Central geometric wireframe polyhedron (representing software architecture)
    const coreGeometry = new THREE.IcosahedronGeometry(14, 1);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // cyan
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    coreMesh.position.set(22, 0, -10);
    scene.add(coreMesh);

    // Mouse interaction with smooth damping
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 12;
      targetY = y * 12;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Handle visibility with IntersectionObserver to conserve battery & CPU
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = clock.getDelta();

      // Smooth mouse follow
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      camera.position.x = mouseX;
      camera.position.y = mouseY;
      camera.lookAt(0, 0, 0);

      // Rotate core mesh
      coreMesh.rotation.x += delta * 0.15;
      coreMesh.rotation.y += delta * 0.22;

      // Update particle positions
      const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
      const currentPos = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        currentPos[i3] += velocities[i].x;
        currentPos[i3 + 1] += velocities[i].y;
        currentPos[i3 + 2] += velocities[i].z;

        // Boundary bounce
        if (Math.abs(currentPos[i3]) > radius) velocities[i].x *= -1;
        if (Math.abs(currentPos[i3 + 1]) > radius * 0.7) velocities[i].y *= -1;
        if (Math.abs(currentPos[i3 + 2]) > radius * 0.5) velocities[i].z *= -1;
      }
      posAttr.needsUpdate = true;

      // Update dynamic lines between close particles
      let lineVertexIndex = 0;
      const linePosAttr = lineGeometry.getAttribute('position') as THREE.BufferAttribute;
      const lineArray = linePosAttr.array as Float32Array;
      const connectionDistance = 24;

      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = currentPos[i * 3] - currentPos[j * 3];
          const dy = currentPos[i * 3 + 1] - currentPos[j * 3 + 1];
          const dz = currentPos[i * 3 + 2] - currentPos[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectionDistance && lineVertexIndex < maxConnections) {
            lineArray[lineVertexIndex * 6] = currentPos[i * 3];
            lineArray[lineVertexIndex * 6 + 1] = currentPos[i * 3 + 1];
            lineArray[lineVertexIndex * 6 + 2] = currentPos[i * 3 + 2];
            lineArray[lineVertexIndex * 6 + 3] = currentPos[j * 3];
            lineArray[lineVertexIndex * 6 + 4] = currentPos[j * 3 + 1];
            lineArray[lineVertexIndex * 6 + 5] = currentPos[j * 3 + 2];
            lineVertexIndex++;
          }
        }
      }

      lineGeometry.setDrawRange(0, lineVertexIndex * 2);
      linePosAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);

      geometry.dispose();
      pointsMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-75 dark:opacity-90"
      aria-hidden="true"
    />
  );
}
