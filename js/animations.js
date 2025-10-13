// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Hero section animations
gsap.from('.hero-content h1', {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: 'power3.out'
});

gsap.from('.hero-content .name', {
    duration: 1,
    y: 50,
    opacity: 0,
    delay: 0.2,
    ease: 'power3.out'
});

gsap.from('.hero-content .tagline', {
    duration: 1,
    y: 50,
    opacity: 0,
    delay: 0.4,
    ease: 'power3.out'
});

gsap.from('.cta-buttons', {
    duration: 1,
    y: 50,
    opacity: 0,
    delay: 0.6,
    ease: 'power3.out'
});

// About section animations
gsap.from('.about-content', {
    scrollTrigger: {
        trigger: '.about',
        start: 'top center',
        toggleActions: 'play none none reverse'
    },
    duration: 1,
    y: 50,
    opacity: 0,
    ease: 'power3.out'
});

// Skills section animations
gsap.from('.skill-card', {
    scrollTrigger: {
        trigger: '.skills',
        start: 'top center',
        toggleActions: 'play none none reverse'
    },
    duration: 0.8,
    y: 50,
    opacity: 0,
    stagger: 0.2,
    ease: 'power3.out'
});

// Projects section animations
gsap.from('.projects-grid > *', {
    scrollTrigger: {
        trigger: '.projects',
        start: 'top center',
        toggleActions: 'play none none reverse'
    },
    duration: 0.8,
    y: 50,
    opacity: 0,
    stagger: 0.2,
    ease: 'power3.out'
});

// Contact section animations
gsap.from('.contact-form', {
    scrollTrigger: {
        trigger: '.contact',
        start: 'top center',
        toggleActions: 'play none none reverse'
    },
    duration: 1,
    x: -50,
    opacity: 0,
    ease: 'power3.out'
});

gsap.from('.contact-info', {
    scrollTrigger: {
        trigger: '.contact',
        start: 'top center',
        toggleActions: 'play none none reverse'
    },
    duration: 1,
    x: 50,
    opacity: 0,
    ease: 'power3.out'
});

// Footer animations
gsap.from('.social-links a', {
    scrollTrigger: {
        trigger: '.footer',
        start: 'top bottom',
        toggleActions: 'play none none reverse'
    },
    duration: 0.5,
    y: 20,
    opacity: 0,
    stagger: 0.1,
    ease: 'power3.out'
});

// Navbar animation on scroll
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        // Scroll Down
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        // Scroll Up
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// Add hover effect to buttons
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
        gsap.to(button, {
            duration: 0.3,
            scale: 1.05,
            ease: 'power2.out'
        });
    });
    
    button.addEventListener('mouseleave', () => {
        gsap.to(button, {
            duration: 0.3,
            scale: 1,
            ease: 'power2.out'
        });
    });
});

// Professional section fade-in and slide-up animations
const sections = document.querySelectorAll('section');
sections.forEach(section => {
  gsap.from(section, {
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    stagger: 0.1
  });
});

// Section title reveal
const sectionTitles = document.querySelectorAll('.section-title');
gsap.utils.toArray(sectionTitles).forEach(title => {
  gsap.from(title, {
    scrollTrigger: {
      trigger: title,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
    y: 20,
    opacity: 0,
    duration: 0.7,
    ease: 'power2.out',
  });
}); 