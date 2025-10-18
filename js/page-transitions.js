// ================================================
// PAGE TRANSITIONS & RESUME VIEWER
// ================================================

// ========== PAGE TRANSITION SYSTEM ========== //
class PageTransition {
    constructor() {
        this.overlay = document.getElementById('pageTransition');
        this.isTransitioning = false;
        this.duration = 500;
        this.init();
    }

    init() {
        // Intercept navigation link clicks
        this.setupNavLinks();
        this.setupResumeButton();
        this.setupSectionLinks();
    }

    setupNavLinks() {
        const navLinks = document.querySelectorAll('.nav-link:not(.resume-btn)');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    // Native section link, let browser handle it
                    // But add transition effect
                    this.playTransition();
                }
            });
        });
    }

    setupSectionLinks() {
        // Smooth scroll with transition effect
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a[href^="#"]');
            if (target) {
                const href = target.getAttribute('href');
                const section = document.querySelector(href);
                if (section && href !== '#') {
                    e.preventDefault();
                    this.transitionToSection(section);
                }
            }
        });
    }

    transitionToSection(section) {
        if (this.isTransitioning) return;

        this.isTransitioning = true;
        const sectionId = section.getAttribute('id');

        // Play transition out
        this.playTransition();

        // After transition, scroll to section
        setTimeout(() => {
            window.history.pushState(null, null, `#${sectionId}`);
            section.scrollIntoView({ behavior: 'smooth' });
            this.isTransitioning = false;
        }, this.duration / 2);
    }

    playTransition() {
        if (!this.overlay) return;

        // Add active state for transition in
        this.overlay.classList.remove('exit');
        this.overlay.classList.add('active');

        // Remove active state after duration
        setTimeout(() => {
            this.overlay.classList.add('exit');
            setTimeout(() => {
                this.overlay.classList.remove('active', 'exit');
            }, this.duration / 2);
        }, this.duration / 2);
    }

    setupResumeButton() {
        const resumeBtn = document.getElementById('resumeViewBtn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                ResumeViewer.open();
            });
        }
    }
}

// ========== RESUME VIEWER ========== //
class ResumeViewer {
    static init() {
        this.modal = document.getElementById('resumeModal');
        this.closeBtn = document.getElementById('resumeCloseBtn');
        this.setupListeners();
    }

    static setupListeners() {
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // Close on backdrop click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    static open() {
        if (!this.modal) return;

        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Trigger animation
        this.modal.offsetHeight; // Force reflow
        this.playOpenAnimation();
    }

    static close() {
        if (!this.modal) return;

        this.playCloseAnimation();

        setTimeout(() => {
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
        }, 300);
    }

    static playOpenAnimation() {
        const content = this.modal.querySelector('.resume-modal-content');
        if (content) {
            content.style.animation = 'resumeModalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }
    }

    static playCloseAnimation() {
        const content = this.modal.querySelector('.resume-modal-content');
        if (content) {
            content.style.animation = 'resumeModalSlideOut 0.3s cubic-bezier(0.76, 0, 0.24, 1)';
        }
    }

    // Static method to trigger from anywhere
    static toggle() {
        if (this.modal && this.modal.classList.contains('active')) {
            this.close();
        } else {
            this.open();
        }
    }

    // Expose API to window
    static exposeAPI() {
        window.ResumeViewer = {
            open: () => this.open(),
            close: () => this.close(),
            toggle: () => this.toggle()
        };
    }
}

// ========== INITIALIZATION ========== //
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page transitions
    const pageTransition = new PageTransition();
    
    // Initialize resume viewer
    ResumeViewer.init();
    ResumeViewer.exposeAPI();

    console.log('%c📄 Page Transitions & Resume Viewer Loaded', 'color: #00f3ff; font-size: 14px;');
});

// ========== SECTION ANIMATIONS ON SCROLL ========== //
// Add fade-in effect when sections come into view
function initSectionTransitions() {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'sectionFadeIn 0.8s ease-out forwards';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    sections.forEach(section => {
        section.style.opacity = '0';
        observer.observe(section);
    });
}

// Initialize section transitions on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSectionTransitions);
} else {
    initSectionTransitions();
}

// Add section fade-in keyframe animation (added to CSS separately)
