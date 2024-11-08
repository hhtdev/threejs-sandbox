import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
  const planetAtmosphereGeometry = new THREE.SphereGeometry(1.01, 64, 64);
  const starBackgroundGeometry = new THREE.SphereGeometry(90, 128, 128);
  const earthTexture = new THREE.TextureLoader().load("earth.jpg");
  const earthCloudsTexture = new THREE.TextureLoader().load("earth-clouds.png");
  const starsTexture = new THREE.TextureLoader().load("8k-stars-milky-way.jpg");
  const materialEarth = new THREE.MeshStandardMaterial({ map: earthTexture, depthTest: true });
  const materialClouds = new THREE.MeshStandardMaterial({ map: earthCloudsTexture, transparent: true, depthTest: false });
  const materialAtmosphere = new THREE.MeshStandardMaterial({ color: 0x00b3ff, emissive: 0x00b3ff, transparent: true, opacity: 0.1 });
  const materialStars = new THREE.MeshBasicMaterial({ map: starsTexture, side: THREE.BackSide });
  const earthMesh = new THREE.Mesh(planetGeometry, materialEarth);
  const earthCloudsMesh = new THREE.Mesh(planetGeometry, materialClouds);
  const earthAtmosphereMesh = new THREE.Mesh(planetAtmosphereGeometry, materialAtmosphere);
  const starBackgroundMesh = new THREE.Mesh(starBackgroundGeometry, materialStars);
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

      //Lock camera distance
      // controls.minDistance = 5;
      // controls.maxDistance = 5;

      //Planet mesh render order
      earthMesh.renderOrder = 0;
      earthCloudsMesh.renderOrder = 1;

      // Planet inclination
      earthMesh.rotation.x = 0.23;
      earthCloudsMesh.rotation.x = 0.23;

      //Milky way inclination
      starBackgroundMesh.rotation.x = 60.2;

      // Enable shadows
      earthMesh.castShadow = true;
      earthCloudsMesh.castShadow = true;
      earthMesh.receiveShadow = true;
      earthCloudsMesh.receiveShadow = true;
      dirLight.castShadow = true;

      // Add light
      dirLight.position.set(50, 0, 30);

      //Add objects to scene
      scene.add(dirLight);
      scene.add(ambientLight);
      scene.add(earthMesh);
      scene.add(earthCloudsMesh);
      scene.add(earthAtmosphereMesh);
      scene.add(starBackgroundMesh);

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
    earthMesh.rotation.y += 0.001;
    earthCloudsMesh.rotation.y += 0.002;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
  };

  return (
    <div ref={containerRef} />
  );
};

export default ThreeScene;