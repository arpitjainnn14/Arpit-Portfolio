// Three.js scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
const container = document.getElementById('hero-canvas');

if (container) {
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 5;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.005,
        color: '#6c63ff',
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Camera position
    camera.position.z = 2;

    // Mouse movement effect
    let mouseX = 0;
    let mouseY = 0;

    function onDocumentMouseMove(event) {
        mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
        mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
    }

    document.addEventListener('mousemove', onDocumentMouseMove);

    function updateParticles() {
        const positions = particlesMesh.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(Date.now() * 0.0005 + positions[i]) * 0.0001;
        }
        
        particlesMesh.geometry.attributes.position.needsUpdate = true;
    }

    // Animation
    function animate() {
        requestAnimationFrame(animate);

        updateParticles();

        particlesMesh.rotation.x += 0.0001;
        particlesMesh.rotation.y += 0.0001;

        // Mouse movement effect
        particlesMesh.rotation.x += mouseY * 0.1;
        particlesMesh.rotation.y += mouseX * 0.1;

        renderer.render(scene, camera);
    }

    // Handle window resize
    function onWindowResize() {
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    }

    window.addEventListener('resize', onWindowResize);

    // Start animation
    animate();
} 