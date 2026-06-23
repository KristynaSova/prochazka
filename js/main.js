/* ============================================================
   JIŘÍ MIROSLAV PROCHÁZKA – Main JavaScript
   ============================================================ */

'use strict';

(function () {

    /* --------------------------------------------------------
       MOBILNÍ MENU
       -------------------------------------------------------- */
    const navToggle  = document.querySelector('.nav__toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeBtn   = document.querySelector('.mobile-menu__close');

    if (navToggle && mobileMenu) {

        const openMenu = () => {
            mobileMenu.classList.add('is-open');
            mobileMenu.setAttribute('aria-hidden', 'false');
            navToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            closeBtn?.focus();
        };

        const closeMenu = () => {
            mobileMenu.classList.remove('is-open');
            mobileMenu.setAttribute('aria-hidden', 'true');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            navToggle.focus();
        };

        navToggle.addEventListener('click', openMenu);
        closeBtn?.addEventListener('click', closeMenu);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
                closeMenu();
            }
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    /* --------------------------------------------------------
       ANIMACE KARET – IntersectionObserver
       -------------------------------------------------------- */
    const animEls = document.querySelectorAll('[data-animate]');
    if (animEls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const animObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    animObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        animEls.forEach(el => animObserver.observe(el));
    }

    /* --------------------------------------------------------
       REFERENCE SLIDER
       -------------------------------------------------------- */
    const refWrapper = document.querySelector('.roles__reference-slider');
    const refTrack   = document.querySelector('.roles__reference-track');
    const refSlides  = document.querySelectorAll('.roles__reference-slide');
    const refDots    = document.querySelectorAll('.roles__reference-dot');

    if (refWrapper && refTrack && refSlides.length > 1 && refDots.length) {
        let currentSlide = 0;

        const setHeight = (index) => {
            refWrapper.style.height = refSlides[index].scrollHeight + 'px';
        };

        const goTo = (index) => {
            refTrack.style.transform = `translateX(-${index * 100}%)`;
            setHeight(index);
            refDots.forEach((dot, i) => {
                dot.classList.toggle('roles__reference-dot--active', i === index);
            });
            refSlides.forEach((slide, i) => {
                slide.setAttribute('aria-hidden', String(i !== index));
            });
            currentSlide = index;
        };

        /* Inicializace */
        goTo(0);

        /* Swipe (touch) */
        let touchStartX = 0;
        let touchDeltaX = 0;

        refWrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchDeltaX = 0;
        }, { passive: true });

        refWrapper.addEventListener('touchmove', (e) => {
            touchDeltaX = e.touches[0].clientX - touchStartX;
        }, { passive: true });

        refWrapper.addEventListener('touchend', () => {
            if (Math.abs(touchDeltaX) < 40) return;
            if (touchDeltaX < 0) {
                goTo((currentSlide + 1) % refSlides.length);
            } else {
                goTo((currentSlide - 1 + refSlides.length) % refSlides.length);
            }
        });

        /* Ruční navigace tečkami */
        refDots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                goTo(i);
            });
            dot.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    const next = (currentSlide + 1) % refSlides.length;
                    goTo(next);
                    refDots[next].focus();
                }
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prev = (currentSlide - 1 + refSlides.length) % refSlides.length;
                    goTo(prev);
                    refDots[prev].focus();
                }
            });
        });
    }

    /* --------------------------------------------------------
       PARALLAX – Sekce 3 (citát)
       Transformuje pouze .quote-section__parallax (wrapper s fotografií).
       Text v .quote-section__content zůstává zcela statický.
       -------------------------------------------------------- */
    const quoteSect     = document.querySelector('.quote-section');
    const quoteParallax = document.querySelector('.quote-section__parallax');

    if (quoteSect && quoteParallax && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let ticking = false;

        const updateParallax = () => {
            const rect  = quoteSect.getBoundingClientRect();
            const sH    = quoteSect.offsetHeight;
            const vpH   = window.innerHeight;

            // 0 = sekce vstupuje zdola do viewportu, 1 = sekce opouští nahoře
            const progress = (vpH - rect.top) / (vpH + sH);
            if (progress < 0 || progress > 1) return;

            // Ken Burns: větší parallax pohyb + zoom (1.08 při vstupu → 1.0 při odchodu)
            const maxShift = sH * 0.22;
            const shift    = (progress - 0.5) * 2 * maxShift;
            const scale    = 1.08 - progress * 0.08;

            quoteParallax.style.transform = `translateY(${shift.toFixed(2)}px) scale(${scale.toFixed(4)}) translateZ(0)`;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateParallax();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        updateParallax();
    }

    /* --------------------------------------------------------
       AKORDEONY – seznam-tvorby
       -------------------------------------------------------- */
    const accordionBtns = document.querySelectorAll('[data-accordion-toggle]');
    let activeBtn = null;

    const closeAccordion = (btn) => {
        const body = document.getElementById(btn.getAttribute('aria-controls'));
        btn.closest('.st-accordion').classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        body.hidden = true;
    };

    accordionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isOpen = btn.getAttribute('aria-expanded') === 'true';

            /* Zavřít aktuálně otevřený (pokud je jiný) */
            if (activeBtn && activeBtn !== btn) {
                closeAccordion(activeBtn);
                activeBtn = null;
            }

            if (isOpen) {
                closeAccordion(btn);
                activeBtn = null;
            } else {
                const accordion = btn.closest('.st-accordion');
                const body = document.getElementById(btn.getAttribute('aria-controls'));
                accordion.classList.add('is-open');
                btn.setAttribute('aria-expanded', 'true');
                body.hidden = false;
                activeBtn = btn;
            }
        });
    });

    /* --------------------------------------------------------
       PLYNULÝ SCROLL pro kotevní odkazy
       -------------------------------------------------------- */
    const header = document.getElementById('site-header');

    document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#' || href === '/') return;

            // /#section — jen na homepage
            const selector = href.startsWith('/#') ? href.slice(1) : href;
            if (href.startsWith('/#') && window.location.pathname !== '/') return;

            const target = document.querySelector(selector);
            if (!target) return;

            e.preventDefault();
            const headerH = header ? header.offsetHeight : 0;
            const top     = target.getBoundingClientRect().top + window.scrollY - headerH;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });


})();
