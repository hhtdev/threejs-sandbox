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
  const planetRingGeometry = new THREE.TorusGeometry(2, 0.01, 10, 128);
  const starBackgroundGeometry = new THREE.SphereGeometry(90, 128, 128);
  const node1 = new THREE.SphereGeometry(0.1, 32, 32).translate(2 * Math.cos(planetRingGeometry.parameters.arc / 3), 2 * Math.sin(planetRingGeometry.parameters.arc / 3), 0);
  const node2 = new THREE.SphereGeometry(0.1, 32, 32).translate(2 * Math.cos(planetRingGeometry.parameters.arc / 3 * 2), 2 * Math.sin(planetRingGeometry.parameters.arc / 3 * 2), 0);
  const node3 = new THREE.SphereGeometry(0.1, 32, 32).translate(2 * Math.cos(planetRingGeometry.parameters.arc / 3 * 3), 2 * Math.sin(planetRingGeometry.parameters.arc / 3 * 3), 0);

  const earthTexture = new THREE.TextureLoader().load("earth.jpg");
  const earthCloudsTexture = new THREE.TextureLoader().load("earth-clouds.png");
  const starsTexture = new THREE.TextureLoader().load("8k-stars-milky-way.jpg");
  const materialEarth = new THREE.MeshStandardMaterial({ map: earthTexture, depthTest: true });
  const materialClouds = new THREE.MeshStandardMaterial({ map: earthCloudsTexture, transparent: true, depthTest: false });
  const materialAtmosphere = new THREE.MeshStandardMaterial({ color: 0x00b3ff, emissive: 0x00b3ff, transparent: true, opacity: 0.1 });
  const materialEarthRing = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: false });
  const materialStars = new THREE.MeshBasicMaterial({ map: starsTexture, side: THREE.BackSide });
  const materialNode1 = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: false });
  const materialNode2 = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: false });
  const materialNode3 = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: false });

  const earthMesh = new THREE.Mesh(planetGeometry, materialEarth);
  const earthCloudsMesh = new THREE.Mesh(planetGeometry, materialClouds);
  const earthAtmosphereMesh = new THREE.Mesh(planetAtmosphereGeometry, materialAtmosphere);
  const earthRingMesh = new THREE.Mesh(planetRingGeometry, materialEarthRing);
  const node1Mesh = new THREE.Mesh(node1, materialNode1);
  const node2Mesh = new THREE.Mesh(node2, materialNode2);
  const node3Mesh = new THREE.Mesh(node3, materialNode3);
  const starBackgroundMesh = new THREE.Mesh(starBackgroundGeometry, materialStars);

  const controls = new OrbitControls(camera, renderer.domElement);
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

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

      // Lock panning
      controls.enablePan = false;

      // Lock camera rotation to the y axis
      // controls.minPolarAngle = Math.PI / 2;
      // controls.maxPolarAngle = Math.PI / 2;

      //Lock camera distance
      // controls.minDistance = 5;
      // controls.maxDistance = 5;

      //Planet mesh render order
      earthMesh.renderOrder = 0;
      earthCloudsMesh.renderOrder = 1;

      // Planet inclination
      earthMesh.rotation.x = 0.23;
      earthCloudsMesh.rotation.x = 0.23;

      // Renames nodes and change inclination plan
      //TODO: Refacto to use dynamic names instead of instantiating 3 nodes
      node1Mesh.castShadow = true;
      node2Mesh.castShadow = true;
      node3Mesh.castShadow = true;
      node1Mesh.rotation.x = 90;
      node1Mesh.rotation.y = 0.40;
      node2Mesh.rotation.x = 90;
      node2Mesh.rotation.y = 0.40;
      node3Mesh.rotation.x = 90;
      node3Mesh.rotation.y = 0.40;

      // Planet Ring inclination
      earthRingMesh.rotation.x = 90;
      earthRingMesh.rotation.y = 0.40;

      //Milky way inclination
      starBackgroundMesh.rotation.x = 60.2;

      // Enable shadows
      earthMesh.castShadow = true;
      earthCloudsMesh.castShadow = true;
      earthMesh.receiveShadow = true;
      earthCloudsMesh.receiveShadow = true;
      earthRingMesh.receiveShadow = true;
      node1Mesh.receiveShadow = true;
      node2Mesh.receiveShadow = true;
      node3Mesh.receiveShadow = true;
      dirLight.castShadow = true;

      // Add light
      dirLight.position.set(50, 0, 30);

      // Name objects
      earthMesh.name = 'earth';
      earthCloudsMesh.name = 'earthClouds';
      earthAtmosphereMesh.name = 'earthAtmosphere';
      earthRingMesh.name = 'earthRing';
      node1Mesh.name = 'node1';
      node2Mesh.name = 'node2';
      node3Mesh.name = 'node3';

      //Add objects to scene
      scene.add(dirLight);
      scene.add(ambientLight);
      scene.add(earthMesh);
      scene.add(earthCloudsMesh);
      scene.add(earthAtmosphereMesh);
      scene.add(earthRingMesh);
      scene.add(node1Mesh);
      scene.add(node2Mesh);
      scene.add(node3Mesh);
      scene.add(starBackgroundMesh);

      animate();

      let previousObject = '';
      window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        //Ignore stars background mesh
        const sceneChildrensWithoutStars = scene.children.filter(child => child !== starBackgroundMesh);
        const intersects = raycaster.intersectObjects(sceneChildrensWithoutStars);

        if (intersects.length <= 0) {
          updateMeshHoverEmissiveColor(previousObject, false, previousObject === 'earthAtmosphere' ? 0x00b3ff : 0xffffff);
          previousObject = '';
        } else if (intersects[0].object.name !== previousObject) {
          updateMeshHoverEmissiveColor(previousObject, false, previousObject === 'earthAtmosphere' ? 0x00b3ff : 0xffffff);
          updateMeshHoverEmissiveColor(intersects[0].object.name, true, 0xffffff);
          previousObject = intersects[0].object.name;
        } else {
          updateMeshHoverEmissiveColor(intersects[0].object.name, true, 0xffffff);
          previousObject = intersects[0].object.name;
        }
      });

      window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
          if (intersects[0].object.name === 'node1') {
            console.log('Node 1 clicked');
          }
        }
      });

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

  const updateMeshHoverEmissiveColor = (meshName: string, emissive: boolean, color: number) => {
    switch (meshName) {
      case 'earthAtmosphere':
        earthAtmosphereMesh.material.color.setHex(color);
        earthAtmosphereMesh.material.emissive.setHex(color);
        earthAtmosphereMesh.material.emissive = emissive ? new THREE.Color(0x00b3ff) : new THREE.Color(0x000000);
        break;
      case 'earthRing':
        //TODO: Add emissive gradient (maybe) ?
        earthRingMesh.material.color.setHex(color);
        break;
      //TODO: Refacto to use dynamic names instead of having 3 cases
      //TODO: Add progressive emissive color using the distance between the mouse and the node
      case 'node1':
        node1Mesh.material.color.setHex(color);
        node1Mesh.material.emissive.setHex(color);
        node1Mesh.material.emissive = emissive ? new THREE.Color(0xffffff) : new THREE.Color(0x000000);
        break;
      case 'node2':
        node2Mesh.material.color.setHex(color);
        node2Mesh.material.emissive.setHex(color);
        node2Mesh.material.emissive = emissive ? new THREE.Color(0xffffff) : new THREE.Color(0x000000);
        break;
      case 'node3':
        node3Mesh.material.color.setHex(color);
        node3Mesh.material.emissive.setHex(color);
        node3Mesh.material.emissive = emissive ? new THREE.Color(0xffffff) : new THREE.Color(0x000000);
        break;
      default:
        break;
    }
  };

  const animate = () => {
    earthMesh.rotation.y += 0.001;
    earthCloudsMesh.rotation.y += 0.0017;
    //TODO: Refacto to use dynamic names instead of calling 3 nodes
    node1Mesh.rotation.z += 0.0005;
    node2Mesh.rotation.z += 0.0005;
    node3Mesh.rotation.z += 0.0005;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
  };

  return (
    <div ref={containerRef} />
  );
};

export default ThreeScene;