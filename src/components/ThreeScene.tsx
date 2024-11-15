import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';


const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
  const planetAtmosphereGeometry = new THREE.SphereGeometry(1.01, 64, 64);
  const starBackgroundGeometry = new THREE.SphereGeometry(90, 128, 128);
  const nodeBoxGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);


  const earthTexture = new THREE.TextureLoader().load("earth.jpg");
  const earthCloudsTexture = new THREE.TextureLoader().load("earth-clouds.png");
  const starsTexture = new THREE.TextureLoader().load("8k-stars-milky-way.jpg");
  const linkedinInTexture = new THREE.TextureLoader().load("linkedin.png");
  const githubTexture = new THREE.TextureLoader().load("github.png");
  const gmailTexture = new THREE.TextureLoader().load("gmail.png");
  const materialEarth = new THREE.MeshStandardMaterial({ map: earthTexture, depthTest: true });
  const materialClouds = new THREE.MeshStandardMaterial({ map: earthCloudsTexture, transparent: true, depthTest: false });
  const materialAtmosphere = new THREE.MeshStandardMaterial({ color: 0x00b3ff, emissive: 0x00b3ff, transparent: true, opacity: 0.1 });
  const materialStars = new THREE.MeshBasicMaterial({ map: starsTexture, side: THREE.BackSide });

  const earthMesh = new THREE.Mesh(planetGeometry, materialEarth);
  const earthCloudsMesh = new THREE.Mesh(planetGeometry, materialClouds);
  const earthAtmosphereMesh = new THREE.Mesh(planetAtmosphereGeometry, materialAtmosphere);
  const starBackgroundMesh = new THREE.Mesh(starBackgroundGeometry, materialStars);

  const linkedinMesh = new THREE.Mesh(nodeBoxGeometry, new THREE.MeshStandardMaterial({ map: linkedinInTexture, transparent: true }));
  linkedinMesh.scale.set(4, 4, 1); // Scale down the node
  linkedinMesh.position.set(4, 0, 0); //Mesh starting position
  const linkedinApogee = 5; // Radius along the X-axis (width)
  const linkedinPerigee = 4;  // Radius along the Z-axis (height)
  const linkedinverticalAmplitude = 0.3; // How high the object moves on the Y-axis
  const linkedinverticalFrequency = 0.5; // How quickly the vertical motion oscillates
  const linkedinTimeMultiplier = 0.5; // How quickly the object orbits around the planet

  const githubMesh = new THREE.Mesh(nodeBoxGeometry, new THREE.MeshStandardMaterial({ map: githubTexture, transparent: true }));
  githubMesh.scale.set(8, 8, 1);
  githubMesh.position.set(15, 0, 0);
  const githubApogee = 25;
  const githubPerigee = 15;
  const githubverticalAmplitude = 10;
  const githubverticalFrequency = 0.5;
  const githubTimeMultiplier = 0.9;

  const gmailMesh = new THREE.Mesh(nodeBoxGeometry, new THREE.MeshStandardMaterial({ map: gmailTexture, transparent: true }));
  gmailMesh.scale.set(3, 3, 1);
  gmailMesh.position.set(2.2, 0, 0);
  const gmailApogee = 8;
  const gmailPerigee = 6;
  const gmailverticalAmplitude = 2;
  const gmailverticalFrequency = 0.5;
  const gmailTimeMultiplier = 0.7;

  const controls = new OrbitControls(camera, renderer.domElement);
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
  const ambientLight = new THREE.AmbientLight(0x404040);

  //TODO: Change this to something like :
  /*
    Hey ! Je m'appelle Hugo ! Je suis développeur web, passionné par l'espace, les défis techniques et les petits chats !
  */
  const titre = 'Hey !';
  const content1 = 'fuck';
  const content2 = 'c\'est dur Three.js';
  const content3 = 'ALED !';

  let textMesh: THREE.Mesh | undefined;

  const handleResize = React.useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }, [camera, renderer]);

  const updateMeshHoverEmissiveColor = React.useCallback((meshName: string, emissive: boolean, color: number) => {
    switch (meshName) {
      case 'earthAtmosphere':
        earthAtmosphereMesh.material.color.setHex(color);
        earthAtmosphereMesh.material.emissive.setHex(color);
        earthAtmosphereMesh.material.emissive = emissive ? new THREE.Color(0x00b3ff) : new THREE.Color(0x000000);
        break;
      //TODO: Refacto to use dynamic names instead of having 3 cases
      //TODO: Add progressive emissive color using the distance between the mouse and the node
      case 'linkedinNode':
        linkedinMesh.material.color.setHex(color);
        linkedinMesh.material.emissive.setHex(color);
        linkedinMesh.material.emissive = emissive ? new THREE.Color(0xffffff) : new THREE.Color(0x000000);
        break;
      case 'githubNode':
        githubMesh.material.color.setHex(color);
        githubMesh.material.emissive.setHex(color);
        githubMesh.material.emissive = emissive ? new THREE.Color(0xffffff) : new THREE.Color(0x000000);
        break;
      case 'gmailNode':
        gmailMesh.material.color.setHex(color);
        gmailMesh.material.emissive.setHex(color);
        gmailMesh.material.emissive = emissive ? new THREE.Color(0xffffff) : new THREE.Color(0x000000);
        break;
      default:
        break;
    }
  }, [earthAtmosphereMesh.material, linkedinMesh.material, githubMesh.material, gmailMesh.material]);

  const createTextGeometry = async () => {
    const loader = new FontLoader();
    const font = await loader.loadAsync('fonts/montserrat_thin_regular.json');

    const titleTextGeometry = new TextGeometry(titre, {
      font: font,
      size: 0.22,
      depth: 0.01,
      bevelSize: 0.01,
      bevelThickness: 0.01,
      bevelEnabled: true,
    });

    const contentTextGeometry = new TextGeometry(content1,
      {
        font: font,
        size: 0.15,
        depth: 0.01,
        bevelSize: 0.005,
        bevelThickness: 0.005,
        bevelEnabled: true,
      }
    );

    const contentTextGeometry2 = new TextGeometry(content2,
      {
        font: font,
        size: 0.15,
        depth: 0.01,
        bevelSize: 0.005,
        bevelThickness: 0.005,
        bevelEnabled: true,
      }
    );

    const contentTextGeometry3 = new TextGeometry(content3,
      {
        font: font,
        size: 0.15,
        depth: 0.01,
        bevelSize: 0.005,
        bevelThickness: 0.005,
        bevelEnabled: true,
      }
    );

    // Put the content below the title
    contentTextGeometry.translate(0, -0.3, 0);
    contentTextGeometry2.translate(0, -0.6, 0);
    contentTextGeometry3.translate(0, -0.9, 0);

    const textGeometry = BufferGeometryUtils.mergeGeometries([titleTextGeometry, contentTextGeometry, contentTextGeometry2, contentTextGeometry3]);
    //return textGeometry;
    return bend(textGeometry);
  }
  createTextGeometry().then((textGeometry) => {
    textMesh = new THREE.Mesh(textGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    textMesh.position.set(0, 0, 0.9);
    textMesh.rotateOnAxis(new THREE.Vector3(0, -1, 0), Math.PI / 1.42);
    textMesh.visible = true;
    textMesh.geometry.center();
    scene.add(textMesh);
  });

  const bend = (g: THREE.BufferGeometry) => {
    const pos = g.attributes.position;
    const r = 10 / (2 * Math.PI);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const aspect = x / 10;
      const angle = Math.PI * 2 * aspect;
      const finalR = r + pos.getZ(i);
      pos.setXYZ(i, Math.cos(angle) * finalR, pos.getY(i), Math.sin(-angle) * finalR);
    }
    g.computeVertexNormals();
    return g;
  }



  const animate = React.useCallback(() => {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.0005; // Elapsed time in seconds
    earthMesh.rotation.y += 0.001;
    earthCloudsMesh.rotation.y += 0.0017;
    linkedinMesh.position.x = Math.cos(time * linkedinTimeMultiplier) * linkedinApogee; // Orbit around the Y axis
    linkedinMesh.position.z = Math.sin(time * linkedinTimeMultiplier) * linkedinPerigee; // Orbit around the Y axis
    linkedinMesh.position.y = Math.sin(time * linkedinverticalFrequency) * linkedinverticalAmplitude; // Vertical motion

    githubMesh.position.x = Math.cos(time * githubTimeMultiplier) * githubApogee;
    githubMesh.position.z = Math.sin(time * githubTimeMultiplier) * githubPerigee;
    githubMesh.position.y = Math.sin(time * githubverticalFrequency) * githubverticalAmplitude;

    gmailMesh.position.x = Math.cos(time * gmailTimeMultiplier) * gmailApogee;
    gmailMesh.position.z = Math.sin(time * gmailTimeMultiplier) * gmailPerigee;
    gmailMesh.position.y = Math.sin(time * gmailverticalFrequency) * gmailverticalAmplitude;

    // Make the nodes to always face the camera
    linkedinMesh.lookAt(camera.position);
    githubMesh.lookAt(camera.position);
    gmailMesh.lookAt(camera.position);


    controls.update();
    renderer.render(scene, camera);
  }, [camera, controls, earthCloudsMesh.rotation, earthMesh.rotation, linkedinMesh, githubMesh.position, gmailMesh.position, renderer, scene]);



  useEffect(() => {
    if (typeof window !== 'undefined') {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      containerRef.current?.appendChild(renderer.domElement);

      // Camera distance from planet
      camera.position.z = 5;
      camera.position.x = -1;

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
      linkedinMesh.castShadow = true;
      githubMesh.castShadow = true;
      gmailMesh.castShadow = true;

      //Milky way inclination
      starBackgroundMesh.rotation.x = 60.2;

      // Enable shadows
      earthMesh.castShadow = true;
      earthCloudsMesh.castShadow = true;
      earthMesh.receiveShadow = true;
      earthCloudsMesh.receiveShadow = true;
      linkedinMesh.receiveShadow = true;
      githubMesh.receiveShadow = true;
      gmailMesh.receiveShadow = true;
      dirLight.castShadow = true;

      // Add light
      dirLight.position.set(50, 0, 30);

      // Name objects
      earthMesh.name = 'earth';
      earthCloudsMesh.name = 'earthClouds';
      earthAtmosphereMesh.name = 'earthAtmosphere';
      linkedinMesh.name = 'linkedinNode';
      githubMesh.name = 'githubNode';
      gmailMesh.name = 'gmailNode';

      //Add objects to scene
      scene.add(dirLight);
      scene.add(ambientLight);
      scene.add(earthMesh);
      scene.add(earthCloudsMesh);
      scene.add(earthAtmosphereMesh);
      scene.add(linkedinMesh);
      scene.add(githubMesh);
      scene.add(gmailMesh);
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
        // const intersects = raycaster.intersectObjects(scene.children);
        // if (intersects.length > 0) {
        //   if (intersects[0].object.name === 'earthAtmosphere') {
        //     if (textMesh) {
        //       textMesh.visible = true;
        //     } else {
        //       console.log('textMesh is not defined yet');
        //     }
        //   }
        // }
      });

      window.addEventListener('resize', handleResize);
      // Clean up the event listener when the component is unmounted
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [renderer, scene, camera, controls, earthMesh, earthCloudsMesh, earthAtmosphereMesh, linkedinMesh, githubMesh, gmailMesh, starBackgroundMesh, dirLight, ambientLight, mouse, raycaster, textMesh, handleResize, animate, updateMeshHoverEmissiveColor]);

  return (
    <div ref={containerRef} />
  );
};

export default ThreeScene;