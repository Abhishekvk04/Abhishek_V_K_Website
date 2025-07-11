document.addEventListener('DOMContentLoaded', function() {
    const swiper = new Swiper(".projects-swiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        loop: true,
        
        coverflowEffect: {
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 1.5,
            slideShadows: false,
        },
        
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },
        
        mousewheel: {
            enabled: true,
            sensitivity: 1,
            thresholdDelta: 50,
            releaseOnEdges: true,
            forceToAxis: true,
            invert: false
        },
        
        spaceBetween: 30,
        loopAdditionalSlides: 2,
        loopedSlides: 3,
        
        breakpoints: {
            320: { slidesPerView: 1, spaceBetween: 20 },
            640: { slidesPerView: 1.5, spaceBetween: 25 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 30 }
        },
        
        speed: 600,
        
        on: {
            init: function() {
                console.log('Projects Swiper initialized');
                // Force all elements to be visible
                this.slides.forEach(slide => {
                    makeElementsVisible(slide);
                });
            },
            
            slideChange: function() {
                // Maintain visibility after slide change
                setTimeout(() => {
                    this.slides.forEach(slide => {
                        makeElementsVisible(slide);
                    });
                }, 100);
            },
            
            transitionStart: function() {
                // Prevent elements from hiding during transition
                this.slides.forEach(slide => {
                    makeElementsVisible(slide);
                });
            },
            
            transitionEnd: function() {
                // Ensure elements are visible after transition
                this.slides.forEach(slide => {
                    makeElementsVisible(slide);
                });
                this.update();
            }
        }
    });
    
    // Function to make all elements visible
    function makeElementsVisible(slide) {
        const elements = slide.querySelectorAll('.project-links, .github-link, .swiper-slide-content, .project-links *');
        elements.forEach(element => {
            element.style.opacity = '1';
            element.style.visibility = 'visible';
            element.style.transform = 'translateY(0)';
        });
    }
    
    // Set initial slide
    swiper.slideTo(1, 0, false);
    
    // Additional event listeners to maintain visibility
    swiper.on('touchStart', function() {
        this.slides.forEach(slide => {
            makeElementsVisible(slide);
        });
    });
    
    swiper.on('touchEnd', function() {
        setTimeout(() => {
            this.slides.forEach(slide => {
                makeElementsVisible(slide);
            });
        }, 300);
    });
    
    // // Observer to watch for visibility changes
    // const observer = new MutationObserver(function(mutations) {
    //     mutations.forEach(function(mutation) {
    //         if (mutation.type === 'attributes' && 
    //             (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
    //             const slide = mutation.target.closest('.swiper-slide');
    //             if (slide) {
    //                 makeElementsVisible(slide);
    //             }
    //         }
    //     });
    // });
    
    // // Observe all slides for changes
    // document.querySelectorAll('.swiper-slide').forEach(slide => {
    //     observer.observe(slide, {
    //         attributes: true,
    //         subtree: true,
    //         attributeFilter: ['style', 'class']
    //     });
    // });



    
    // Function to update active slide
    function updateActiveSlide(activeIndex) {
        const slides = document.querySelectorAll('.swiper-slide');
        slides.forEach((slide, index) => {
            const showMoreBtn = slide.querySelector('.show-more');
            const description = slide.querySelector('p');
            
            if (index === activeIndex) {
                // Animate show-more button
                setTimeout(() => {
                    if (showMoreBtn) {
                        showMoreBtn.style.opacity = '1';
                        showMoreBtn.style.transform = 'translateY(0)';
                    }
                }, 300);
                
                // Expand description on hover
                slide.addEventListener('mouseenter', () => {
                    if (description) {
                        description.style.webkitLineClamp = 'unset';
                        description.style.overflow = 'visible';
                    }
                });
                
                slide.addEventListener('mouseleave', () => {
                    if (description) {
                        description.style.webkitLineClamp = '3';
                        description.style.overflow = 'hidden';
                    }
                });
            } else {
                // Hide show-more button for inactive slides
                if (showMoreBtn) {
                    showMoreBtn.style.opacity = '0';
                    showMoreBtn.style.transform = 'translateY(20px)';
                }
            }
        });
    }
    
    // Add intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.projects-header, .projects-footer').forEach(el => {
        observer.observe(el);
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
                swiper.slidePrev();
                break;
            case 'ArrowRight':
                swiper.slideNext();
                break;
            case ' ':
                e.preventDefault();
                if (swiper.autoplay.running) {
                    swiper.autoplay.stop();
                } else {
                    swiper.autoplay.start();
                }
                break;
        }
    });
    
    // Add touch gestures for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - next slide
                swiper.slideNext();
            } else {
                // Swipe down - previous slide
                swiper.slidePrev();
            }
        }
    }
    
    // Performance optimization
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        // Disable autoplay and reduce animations for users who prefer reduced motion
        swiper.autoplay.stop();
        document.body.classList.add('reduced-motion');
    }
    
    // Add loading state management
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Initialize slide animations
        setTimeout(() => {
            updateActiveSlide(swiper.activeIndex);
        }, 500);
    });
    
    // Add resize handler for responsive updates
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            swiper.update();
            updateActiveSlide(swiper.activeIndex);
        }, 250);
    });
    
    console.log('Enhanced Projects Carousel initialized successfully!');
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .projects-header,
    .projects-footer {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }
    
    .swiper-loaded .swiper-slide {
        transition: all 0.3s ease;
    }
    
    .loaded {
        opacity: 1;
    }
    
    body {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
`;
document.head.appendChild(style);
