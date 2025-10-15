// ================================================
// MODERN DATA SCIENTIST PORTFOLIO - JAVASCRIPT
// ================================================

// ========== INITIALIZATION ========== //
document.addEventListener('DOMContentLoaded', function() {
    initMatrixRain();
    initParticles();
    initTypingEffect();
    initScrollReveal();
    initNavbar();
    initMobileMenu();
    initCounterAnimation();
    initSkillBars();
    initCharts();
    initBackToTop();
    initSmoothScroll();
    
    console.log('%c🚀 Welcome to Arpit\'s Portfolio!', 'color: #00f3ff; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #00f3ff;');
    console.log('%c💻 Data Scientist | ML Engineer', 'color: #ff00ff; font-size: 14px;');
});

// ========== MATRIX RAIN EFFECT ========== //
function initMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const matrix = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const chars = matrix.split('');
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(5, 7, 15, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00f3ff';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 50);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ========== PARTICLES EFFECT ========== //
function initParticles() {
    if (typeof particlesJS === 'undefined') return;
    
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#00f3ff' },
            shape: { type: 'circle' },
            opacity: {
                value: 0.5,
                random: true,
                anim: { enable: true, speed: 1, opacity_min: 0.1 }
            },
            size: {
                value: 3,
                random: true,
                anim: { enable: true, speed: 2, size_min: 0.1 }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#00f3ff',
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: true,
                out_mode: 'out'
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: true, mode: 'repulse' },
                onclick: { enable: true, mode: 'push' }
            }
        }
    });
}

// ========== TYPING EFFECT ========== //
function initTypingEffect() {
    const typingElement = document.getElementById('typingText');
    if (!typingElement) return;

    const texts = [
        'import pandas as pd',
        'import tensorflow as tf',
        'model = train_neural_network()',
        'accuracy = model.evaluate(test_data)',
        'print("Building the future with AI...")'
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

// ========== SCROLL REVEAL ========== //
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    function reveal() {
        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', reveal);
    reveal(); // Initial check
}

// ========== NAVBAR SCROLL EFFECT ========== //
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// ========== MOBILE MENU ========== //
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!mobileToggle) return;

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// ========== COUNTER ANIMATION ========== //
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-value');
    const speed = 200;

    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const increment = target / speed;
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.ceil(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };

        updateCounter();
    };

    // Intersection Observer for counters
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

// ========== SKILL BARS ANIMATION ========== //
function initSkillBars() {
    const skillCategories = document.querySelectorAll('.skill-category');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Trigger all skill bar animations in this category
                const skillBars = entry.target.querySelectorAll('.skill-bar-fill');
                
                skillBars.forEach((bar, index) => {
                    setTimeout(() => {
                        const width = bar.style.getPropertyValue('--skill-width');
                        if (width) {
                            bar.style.width = width;
                        }
                    }, index * 150); // Stagger animation
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    skillCategories.forEach(category => observer.observe(category));
}

// ========== CHARTS INITIALIZATION ========== //
function initCharts() {
    if (typeof Chart === 'undefined') return;

    // Skills Radar Chart
    const radarCanvas = document.getElementById('skillsRadar');
    if (radarCanvas) {
        const radarCtx = radarCanvas.getContext('2d');
        new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Python', 'ML/DL', 'Data Analysis', 'Cloud', 'SQL', 'Visualization'],
                datasets: [{
                    label: 'Skill Level',
                    data: [95, 90, 92, 80, 85, 87],
                    backgroundColor: 'rgba(0, 243, 255, 0.2)',
                    borderColor: '#00f3ff',
                    borderWidth: 2,
                    pointBackgroundColor: '#00f3ff',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#00f3ff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            color: '#8b92b0',
                            backdropColor: 'transparent'
                        },
                        grid: {
                            color: 'rgba(0, 243, 255, 0.1)'
                        },
                        pointLabels: {
                            color: '#e0e7ff',
                            font: { size: 12 }
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // Skills Bar Chart
    const chartCanvas = document.getElementById('skillsChart');
    if (chartCanvas) {
        const chartCtx = chartCanvas.getContext('2d');
        new Chart(chartCtx, {
            type: 'bar',
            data: {
                labels: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'AWS', 'Docker', 'Pandas', 'Scikit-learn'],
                datasets: [{
                    label: 'Proficiency Level',
                    data: [95, 90, 88, 85, 80, 75, 92, 90],
                    backgroundColor: [
                        'rgba(0, 243, 255, 0.8)',
                        'rgba(255, 0, 255, 0.8)',
                        'rgba(112, 0, 255, 0.8)',
                        'rgba(0, 243, 255, 0.8)',
                        'rgba(255, 0, 255, 0.8)',
                        'rgba(112, 0, 255, 0.8)',
                        'rgba(0, 243, 255, 0.8)',
                        'rgba(255, 0, 255, 0.8)'
                    ],
                    borderColor: [
                        '#00f3ff',
                        '#ff00ff',
                        '#7000ff',
                        '#00f3ff',
                        '#ff00ff',
                        '#7000ff',
                        '#00f3ff',
                        '#ff00ff'
                    ],
                    borderWidth: 2,
                    borderRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#8b92b0',
                            stepSize: 20
                        },
                        grid: {
                            color: 'rgba(0, 243, 255, 0.1)',
                            borderColor: 'rgba(0, 243, 255, 0.2)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#e0e7ff'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(10, 14, 39, 0.9)',
                        titleColor: '#00f3ff',
                        bodyColor: '#e0e7ff',
                        borderColor: '#00f3ff',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false
                    }
                }
            }
        });
    }
}

// ========== BACK TO TOP BUTTON ========== //
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========== SMOOTH SCROLL ========== //
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========== FORM SUBMISSION ========== //
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        const submitBtn = this.querySelector('.submit-btn');
        const originalHTML = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
        submitBtn.disabled = true;

        // Form will redirect after submission
        setTimeout(() => {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }, 3000);
    });
}

// ========== CURSOR TRAIL EFFECT (Desktop Only) ========== //
if (window.innerWidth > 768) {
    const cursorTrail = [];
    const trailLength = 20;

    document.addEventListener('mousemove', (e) => {
        cursorTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
        
        if (cursorTrail.length > trailLength) {
            cursorTrail.shift();
        }

        // Create particle occasionally
        if (Math.random() < 0.1) {
            createCursorParticle(e.clientX, e.clientY);
        }
    });

    function createCursorParticle(x, y) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            background: #00f3ff;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: particle-fade 1s ease-out forwards;
            box-shadow: 0 0 10px #00f3ff;
        `;
        document.body.appendChild(particle);

        setTimeout(() => particle.remove(), 1000);
    }

    // Add particle animation CSS
    if (!document.getElementById('particle-animation-style')) {
        const style = document.createElement('style');
        style.id = 'particle-animation-style';
        style.textContent = `
            @keyframes particle-fade {
                0% { opacity: 1; transform: scale(1); }
                100% { opacity: 0; transform: scale(0) translateY(-50px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== PARALLAX EFFECT (Hero-only, bounded) ========== //
(function initHeroParallax() {
    const hero = document.querySelector('.hero');
    const content = document.querySelector('.hero-content');
    if (!hero || !content) return;

    function onScroll() {
        // Respect user motion preferences
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            content.style.transform = '';
            return;
        }

        const rect = hero.getBoundingClientRect();
        const inView = rect.bottom > 0 && rect.top < window.innerHeight;

        if (inView) {
            // Use rect.top to move content upward as user scrolls down
            // rect.top goes from positive to negative; we want a small negative translate
            const factor = 0.08; // small factor for subtle motion
            const translate = Math.max(-rect.height * 0.15, Math.min(rect.height * 0.15, -rect.top * factor));
            content.style.transform = `translateY(${translate}px)`;
        } else {
            // Reset when out of view to avoid big jumps
            content.style.transform = 'translateY(0)';
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// ========== PROJECT CARDS TILT EFFECT ========== //
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});

// ========== EASTER EGG - KONAMI CODE ========== //
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join(',') === konamiSequence.join(',')) {
        activateSecretMode();
        konamiCode = [];
    }
});

function activateSecretMode() {
    console.log('%c🎉 SECRET MODE ACTIVATED!', 'color: #ff00ff; font-size: 30px; font-weight: bold;');
    document.body.style.animation = 'rainbow 2s linear infinite';
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        document.body.style.animation = '';
    }, 10000);
}

// ========== CONSOLE SIGNATURE ========== //
console.log('%c     ', 'font-size: 100px; background: linear-gradient(135deg, #00f3ff, #ff00ff, #7000ff); background-clip: text;');
console.log('%c🔥 Interested in the code?', 'color: #00f3ff; font-size: 16px;');
console.log('%c📧 Let\'s connect: GitHub @arpitjainnn14', 'color: #ff00ff; font-size: 14px;');
