import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const geometry = new THREE.SphereGeometry();
  const texture = new THREE.TextureLoader().load("earth.jpg");
  const meshMaterial = new THREE.MeshStandardMaterial({ map: texture });
  const planet = new THREE.Mesh(geometry, meshMaterial);
  const controls = new OrbitControls(camera, renderer.domElement);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
  const ambientLight = new THREE.AmbientLight(0x404040);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      containerRef.current?.appendChild(renderer.domElement);

      // Camera distance from planet
      camera.position.z = 5;

      // Add inertia
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Lock camera rotation to the y axis
      controls.minPolarAngle = Math.PI / 2;
      controls.maxPolarAngle = Math.PI / 2;

      // Planet inclination
      planet.rotation.x = 0.23;

      // Enable shadows
      planet.castShadow = true;
      planet.receiveShadow = true;
      dirLight.castShadow = true;

      // Add light
      dirLight.position.set(50, 0, 30);
      scene.add(dirLight);
      scene.add(ambientLight);
      scene.add(planet);

      animate();

      window.addEventListener('resize', handleResize);
      // Clean up the event listener when the component is unmounted
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  };

  const animate = () => {
    planet.rotation.y += 0.001;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
  };

  return (
    <div ref={containerRef} />
  );
};

export default ThreeScene;