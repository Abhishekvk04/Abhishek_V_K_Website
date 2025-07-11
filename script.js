// Modern Portfolio JavaScript - Enhanced Version
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements for better performance
    const header = document.getElementById('myHeader');
    const page = document.getElementById('page');
    const openMenuButton = document.getElementById('openmenu');
    const navLinks = document.querySelectorAll('nav a[data-section]');
    const sections = document.querySelectorAll('.panel[id]');
    
    // State management
    let isMenuOpen = false;
    let isScrolling = false;
    let currentSection = 'home';
    
    // Throttle function for performance optimization
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    // Intersection Observer for section detection
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: [0.1, 0.5, 0.9]
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                currentSection = entry.target.id;
                updateActiveNavLink(currentSection);
                
                // Update URL hash without triggering scroll
                if (history.replaceState) {
                    history.replaceState(null, null, `#${currentSection}`);
                }
            }
        });
    }, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Update active navigation link
    function updateActiveNavLink(activeSection) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === activeSection) {
                link.classList.add('active');
            }
        });
    }
    
    // Enhanced scroll handler with throttling
    const handleScroll = throttle(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Close menu on scroll
        if (isMenuOpen) {
            closeMenu();
        }
        
        // Handle sticky header
        if (scrollTop > 100) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
        
        // Add scroll direction detection
        if (scrollTop > (window.lastScrollTop || 0)) {
            document.body.classList.add('scroll-down');
            document.body.classList.remove('scroll-up');
        } else {
            document.body.classList.add('scroll-up');
            document.body.classList.remove('scroll-down');
        }
        
        window.lastScrollTop = scrollTop;
    }, 16); // ~60fps
    
    window.addEventListener('scroll', handleScroll);
    
    // Menu functionality
    function openMenu() {
        isMenuOpen = true;
        page.classList.add('menuopen');
        document.body.classList.add('stop');
        header.classList.remove('sticky');
        openMenuButton.setAttribute('aria-expanded', 'true');
        
        // Add escape key listener
        document.addEventListener('keydown', handleEscapeKey);
    }
    
    function closeMenu() {
        isMenuOpen = false;
        page.classList.remove('menuopen');
        document.body.classList.remove('stop');
        openMenuButton.setAttribute('aria-expanded', 'false');
        
        // Remove escape key listener
        document.removeEventListener('keydown', handleEscapeKey);
        
        // Restore sticky header if needed
        if (window.pageYOffset > 100) {
            header.classList.add('sticky');
        }
    }
    
    function handleEscapeKey(e) {
        if (e.key === 'Escape') {
            closeMenu();
        }
    }
    
    // Menu button event
    openMenuButton.addEventListener('click', function(e) {
        e.stopPropagation();
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (isMenuOpen && !header.contains(e.target)) {
            closeMenu();
        }
    });
    
    // Enhanced smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            const targetElement = document.getElementById(targetSection);
            
            if (targetElement) {
                // Close menu if open
                if (isMenuOpen) {
                    closeMenu();
                }
                
                // Calculate target position
                const headerHeight = window.innerWidth <= 768 ? 80 : 100;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                // Smooth scroll with easing
                smoothScrollTo(targetPosition, 800);
                
                // Update active state immediately
                updateActiveNavLink(targetSection);
            }
        });
    });
    
    // Custom smooth scroll function with easing
    function smoothScrollTo(targetPosition, duration) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        
        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
    }
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', function(e) {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            const targetElement = document.getElementById(hash);
            const headerHeight = window.innerWidth <= 768 ? 80 : 100;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
    
    // Initialize page based on URL hash
    function initializePage() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            setTimeout(() => {
                const targetElement = document.getElementById(hash);
                const headerHeight = window.innerWidth <= 768 ? 80 : 100;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                updateActiveNavLink(hash);
            }, 100);
        }
    }
    
    // Animate elements on scroll
    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe elements for animation
    document.querySelectorAll('.skill-tag, .project-card, .achievement-item, .cert-item').forEach(el => {
        animateOnScroll.observe(el);
    });
    
    // Typing animation for hero section
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
    
    // Initialize typing animation
    const heroRole = document.querySelector('.role');
    if (heroRole) {
        const originalText = heroRole.textContent;
        setTimeout(() => {
            typeWriter(heroRole, originalText, 80);
        }, 1000);
    }
    
    // Parallax effect for hero section
    const heroPanel = document.querySelector('.hero-panel');
    if (heroPanel) {
        const parallaxScroll = throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            heroPanel.style.transform = `translateY(${rate}px)`;
        }, 16);
        
        window.addEventListener('scroll', parallaxScroll);
    }
    
    // Progress bar for reading progress
    function createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="progress-fill"></div>';
        document.body.appendChild(progressBar);
        
        const progressFill = progressBar.querySelector('.progress-fill');
        
        const updateProgress = throttle(() => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            progressFill.style.width = scrollPercent + '%';
        }, 16);
        
        window.addEventListener('scroll', updateProgress);
    }
    
    // Add CSS for progress bar
    const progressCSS = `
        .reading-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: rgba(255, 255, 255, 0.1);
            z-index: 99999;
            pointer-events: none;
        }
        
        .progress-fill {
            height: 100%;
            background: var(--primary-color);
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .skill-tag, .project-card, .achievement-item, .cert-item {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = progressCSS;
    document.head.appendChild(style);
    
    // Initialize components
    createProgressBar();
    initializePage();
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Recalculate positions on resize
            if (window.location.hash) {
                const hash = window.location.hash.substring(1);
                const targetElement = document.getElementById(hash);
                if (targetElement) {
                    const headerHeight = window.innerWidth <= 768 ? 80 : 100;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    window.scrollTo(0, targetPosition);
                }
            }
        }, 250);
    });
    
    // Performance optimization: Preload next section
    let preloadedSections = new Set();
    
    function preloadSection(sectionId) {
        if (!preloadedSections.has(sectionId)) {
            const section = document.getElementById(sectionId);
            if (section) {
                // Trigger any lazy-loaded content
                const lazyElements = section.querySelectorAll('[data-src]');
                lazyElements.forEach(el => {
                    if (el.dataset.src) {
                        el.src = el.dataset.src;
                        el.removeAttribute('data-src');
                    }
                });
                preloadedSections.add(sectionId);
            }
        }
    }
    
    // Preload adjacent sections
    const sectionIds = ['home', 'about', 'experience', 'projects', 'achievements', 'contact'];
    
    sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentIndex = sectionIds.indexOf(entry.target.id);
                
                // Preload next and previous sections
                if (currentIndex > 0) {
                    preloadSection(sectionIds[currentIndex - 1]);
                }
                if (currentIndex < sectionIds.length - 1) {
                    preloadSection(sectionIds[currentIndex + 1]);
                }
            }
        });
    }, { threshold: 0.5 });
    
    // Add loading state management
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Initialize any remaining animations
        setTimeout(() => {
            document.querySelectorAll('.skill-tag').forEach((tag, index) => {
                setTimeout(() => {
                    tag.classList.add('animate-in');
                }, index * 50);
            });
        }, 500);
    });
    
    console.log('Portfolio JavaScript initialized successfully!');
});

// Utility functions
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Export functions for potential external use
window.portfolioUtils = {
    scrollToSection: function(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const headerHeight = window.innerWidth <= 768 ? 80 : 100;
            const targetPosition = section.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    },
    
    getCurrentSection: function() {
        return window.currentSection || 'home';
    }
};


// Smooth navigation to projects page
document.addEventListener('DOMContentLoaded', function() {
    const projectsBtn = document.querySelector('.view-all-projects-btn');
    
    if (projectsBtn) {
        projectsBtn.addEventListener('click', function(e) {
            // Add loading state
            this.style.opacity = '0.7';
            this.style.pointerEvents = 'none';
            
            // Optional: Add loading animation
            const originalText = this.querySelector('.btn-text').textContent;
            this.querySelector('.btn-text').textContent = 'Loading...';
            
            // Allow normal navigation after brief delay
            setTimeout(() => {
                this.style.opacity = '1';
                this.style.pointerEvents = 'auto';
                this.querySelector('.btn-text').textContent = originalText;
            }, 500);
        });
    }
});

// Enhanced Netlify form handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    const submitBtn = document.querySelector('.submit-btn');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Add loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Sending...</span>';
            
            // Let Netlify handle the submission
            // This will redirect to success page or show success message
        });
        
        // Handle form submission success (if staying on same page)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
            showSuccessMessage();
        }
        
        // Real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value.trim() === '') {
                    this.style.borderColor = 'var(--accent-color)';
                } else {
                    this.style.borderColor = 'var(--primary-color)';
                }
            });
        });
    }
    
    function showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div class="success-content">
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for reaching out. I'll get back to you soon.</p>
            </div>
        `;
        
        document.querySelector('.contact-form-container').appendChild(successDiv);
        
        // Hide after 5 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }
});
