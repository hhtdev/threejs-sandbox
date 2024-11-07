import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  const geometry = new THREE.BoxGeometry();
  const meshMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, meshMaterial);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current?.appendChild(renderer.domElement);
      camera.position.z = 5;

      scene.add(cube);

      const controls = new OrbitControls(camera, renderer.domElement);

      animate();

      controls.addEventListener('change', () => renderer.render(scene, camera));


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
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  return (
    <div ref={containerRef} />
  );
};
export default ThreeScene;