// Gamified Portfolio - Three.js + GSAP + Vanilla JS
document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const CONFIG = {
        scrollSpeed: 0.5,
        cameraSpeed: 0.05,
        fogDensity: 0.02,
        cloudCount: 20,
        gadgetCount: 15
    };

    // --- DOM Elements ---
    const preloader = document.getElementById('preloader');
    const progressText = document.querySelector('.pct');
    const statusText = document.querySelector('.status');
    // Updated selector for new robot structure
    const robotBody = document.querySelector('.robot-walking') || document.querySelector('.robot-body');
    const header = document.getElementById('myHeader');

    // --- Preloader Logic ---
    let progress = 0;

    // Initial State: Idle Hover
    if (robotBody) robotBody.classList.add('robot-idle');

    const simulateLoad = setInterval(() => {
        progress += Math.floor(Math.random() * 5) + 1;
        if (progress > 100) progress = 100;

        progressText.textContent = `${progress}%`;

        // PHASE 2: Thrusters Engage (60%)
        if (progress > 60 && !robotBody.classList.contains('robot-thrust')) {
            robotBody.classList.remove('robot-idle');
            robotBody.classList.add('robot-thrust');
            statusText.textContent = "Thrusters Engaging...";
            statusText.style.color = "#ff6b6b"; // Red warning color
        }

        // PHASE 3: BLAST OFF (100%)
        if (progress === 100) {
            clearInterval(simulateLoad);
            statusText.textContent = "LAUNCH INITIATED!";

            // Trigger Blast
            robotBody.classList.remove('robot-thrust');
            robotBody.classList.add('robot-blast');

            // Quick Delay for Blast to visual register
            setTimeout(() => {
                // Fade out preloader
                gsap.to(preloader, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.inOut",
                    onComplete: () => {
                        preloader.style.display = 'none';
                        document.body.classList.remove('loading');
                        initThreeJS();
                    }
                });
            }, 800); // Wait for blast animation (0.8s)
        }
    }, 40);

    // --- Three.js Environment ---
    function initThreeJS() {
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0a0a0a, CONFIG.fogDensity); // Dark Fog

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x00ff88, 1, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        const secondaryLight = new THREE.PointLight(0x0066ff, 1, 100);
        secondaryLight.position.set(-10, -10, 5);
        scene.add(secondaryLight);

        // --- Objects: Clouds (Low Poly) ---
        const clouds = [];
        const cloudGeo = new THREE.DodecahedronGeometry(1, 0);
        const cloudMat = new THREE.MeshLambertMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.6,
            wireframe: true
        });

        for (let i = 0; i < CONFIG.cloudCount; i++) {
            const cloud = new THREE.Mesh(cloudGeo, cloudMat);
            cloud.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 100 - 20
            );
            cloud.rotation.z = Math.random() * Math.PI;
            const scale = Math.random() * 2 + 1;
            cloud.scale.set(scale, scale, scale);
            scene.add(cloud);
            clouds.push(cloud);
        }

        // --- Objects: Gadgets (Floating Tech) ---
        const gadgets = [];
        const geoms = [
            new THREE.IcosahedronGeometry(0.5),
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.OctahedronGeometry(0.5)
        ];
        const mat = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            roughness: 0.4,
            metalness: 0.8
        });

        for (let i = 0; i < CONFIG.gadgetCount; i++) {
            const geom = geoms[Math.floor(Math.random() * geoms.length)];
            const gadget = new THREE.Mesh(geom, mat);

            // Position gadgets along the 'scroll path' (Z axis)
            gadget.position.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                - i * 5 // Spread out along depth
            );

            scene.add(gadget);
            gadgets.push(gadget);
        }

        // --- Animation Loop ---
        let targetScroll = 0;
        let currentScroll = 0;

        // Sync with window scroll
        window.addEventListener('scroll', () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const scrollValues = window.scrollY / maxScroll; // 0 to 1
            targetScroll = scrollValues * 50; // Move 50 units in 3D space

            // Header Sticky Logic
            if (window.scrollY > 50) header.classList.add('sticky');
            else header.classList.remove('sticky');
        });

        function animate() {
            requestAnimationFrame(animate);

            // Smooth Scroll Camera
            currentScroll += (targetScroll - currentScroll) * CONFIG.cameraSpeed;
            camera.position.z = -currentScroll;
            camera.rotation.x = currentScroll * 0.01; // Slight tilt

            // Move Clouds
            clouds.forEach((cloud, idx) => {
                cloud.rotation.x += 0.002;
                cloud.rotation.y += 0.003;
                // Parallax effect on clouds relative to camera
                // cloud.position.z += Math.sin(Date.now() * 0.001 + idx) * 0.01; 
            });

            // Animate Gadgets
            gadgets.forEach((gadget, idx) => {
                gadget.rotation.x += 0.01;
                gadget.rotation.y += 0.01;
                gadget.position.y += Math.sin(Date.now() * 0.002 + idx) * 0.005; // Bobbing
            });

            // Light follows camera somewhat
            pointLight.position.z = -currentScroll + 10;

            renderer.render(scene, camera);
        }

        animate();

        // --- Resize Handler ---
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // --- Previous JS Functionality (Nav, Toggles) ---
    // Preserving menu toggle and basic interactions
    const openMenuButton = document.getElementById('openmenu');
    const page = document.getElementById('page');

    if (openMenuButton) {
        openMenuButton.addEventListener('click', () => {
            page.classList.toggle('menuopen');
            header.classList.toggle('menu-active');
        });
    }

    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            page.classList.remove('menuopen');
            header.classList.remove('menu-active'); // Fix: Reset navbar position
        });
    });

    // Intersection Observer for Sections (Active Link)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
                const activeLink = document.querySelector(`nav a[href="#${id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('section').forEach(section => observer.observe(section));



    // Experience Card Accordion (Mobile)
    document.querySelectorAll('.experience-card, .achievement-item, .cert-item').forEach(card => {
        card.addEventListener('click', function (e) {
            // Only trigger if window is small (mobile/tablet)
            if (window.innerWidth <= 768) {
                // Toggle current
                this.classList.toggle('active');
            }
        });
    });
});
