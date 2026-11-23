function bindThemeSwitch(button, changed) {
    function sync() {
        const light = document.documentElement.dataset.theme === 'light';
        button.textContent = light ? '☾  Dark' : '☼  Light';
        button.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    }
    button.onclick = () => {
        const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
        document.documentElement.dataset.theme = theme;
        try { localStorage.setItem('selected-theme', theme); } catch {}
        sync();
        if (changed) changed();
    };
    sync();
}
// ==========================================
// HANAN DEV — PORTFOLIO JAVASCRIPT ENGINE
// Interactive Particles, Rolex Scroll HUD,
// 3D Tilt Effects, Dynamic Theme Engine
// ==========================================


// ------------------------------------------
// CLIENT-SIDE SECURITY ENGINE
// Console protection only.
// Right-click & Inspect are intentionally
// allowed for responsive / accessibility.
// ------------------------------------------
(function initSecurity() {

    // ── Console Security: banner + periodic clear ──
    const style = [
        'color: #00abf0',
        'font-size: 14px',
        'font-weight: bold',
        'background: #081b29',
        'padding: 8px 16px',
        'border-left: 4px solid #00abf0',
        'border-radius: 4px'
    ].join(';');

    const warn = () => {
        console.clear();
        console.log('%c⚠ HANAN DEV — SECURITY NOTICE', style);
        console.log('%cThis console is monitored. Do not paste unknown code here.', 'color:#e74c3c;font-size:12px;');
    };

    // Show immediately, then repeat every 4 s
    warn();
    setInterval(warn, 4000);

    // ── Block Ctrl+U (View Page Source) ──
    // Viewing page source in a new tab exposes raw HTML — block it.
    window.addEventListener('keydown', (e) => {
        const isModifier = e.ctrlKey || e.metaKey;
        if (isModifier && (e.key === 'u' || e.key === 'U')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

})();


document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------
    // 1. NAVBAR & MOBILE TOGGLE
    // ------------------------------------------
    const menuIcon = document.querySelector('#menu-icon');
    const navbar = document.querySelector('.navbar');

    if (menuIcon && navbar) {
        menuIcon.onclick = () => {
            menuIcon.classList.toggle('bx-x');
            navbar.classList.toggle('active');
        };
    }

    // ------------------------------------------
    // 2. THEME ENGINE
    // ------------------------------------------
    bindThemeSwitch(document.getElementById('theme-btn'));

    // ------------------------------------------
    // 3. UNIFIED SMOOTH INERTIAL SCROLLING (LERP)
    // ------------------------------------------
    const scrollProgress = document.getElementById('scrollProgress');
    const scrollHud = document.getElementById('scrollHud');
    const hudCircle = document.getElementById('hudCircle');
    const hudPct = document.getElementById('hudPct');
    const hudSection = document.getElementById('hudSection');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('header nav a');
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    const isPreloadActive = () => window.__isPreloading || document.body.classList.contains('preloading');

    let currentScrollY = 0;
    let targetScrollY = 0;
    let isLerping = false;
    const lerpFactor = 0.05; // Silky smooth deceleration (~0.05 - 0.06)

    if (!isPreloadActive()) {
        currentScrollY = window.scrollY || window.pageYOffset;
        targetScrollY = currentScrollY;
    } else {
        window.scrollTo(0, 0);
    }

    function getMaxScroll() {
        return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }

    function updateHUDAndEffects(top) {
        const totalHeight = getMaxScroll();
        const scrollPercent = totalHeight > 0 ? Math.min(100, Math.max(0, (top / totalHeight) * 100)) : 0;
        const roundedPct = Math.round(scrollPercent);

        // Update top progress bar
        if (scrollProgress) {
            scrollProgress.style.width = `${scrollPercent}%`;
        }

        // Update Rolex-style circular HUD
        if (hudCircle) {
            hudCircle.setAttribute('stroke-dasharray', `${scrollPercent}, 100`);
        }
        if (hudPct) {
            hudPct.textContent = `${roundedPct}%`;
        }

        // Active Section Detection
        let currentSectionId = 'home';
        sections.forEach(sec => {
            const offset = sec.offsetTop - 180;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');

            if (top >= offset && top < offset + height) {
                currentSectionId = id;

                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`header nav a[href*="${id}"]`);
                if (activeLink) activeLink.classList.add('active');

                sec.classList.add('show-animate');
            } else {
                sec.classList.remove('show-animate');
            }
        });

        // Update HUD current section label
        if (hudSection) {
            hudSection.textContent = currentSectionId.toUpperCase();
        }

        // Sticky Header with Blur
        if (header) {
            header.classList.toggle('sticky', top > 80);
        }

        // Close mobile nav on scroll
        if (menuIcon && navbar && navbar.classList.contains('active')) {
            menuIcon.classList.remove('bx-x');
            navbar.classList.remove('active');
        }

        // Footer animate on scroll
        if (footer) {
            footer.classList.toggle('show-animate', window.innerHeight + top >= document.scrollingElement.scrollHeight - 50);
        }
    }

    function startLerpLoop() {
        if (isPreloadActive()) return;
        if (!isLerping) {
            isLerping = true;
            requestAnimationFrame(lerpUpdate);
        }
    }

    const cvDialog = document.getElementById('cv-dialog');
    function lerpUpdate() {
        if (cvDialog?.open) {
            currentScrollY = targetScrollY = window.scrollY;
            isLerping = false;
            return;
        }
        if (isPreloadActive()) {
            isLerping = false;
            currentScrollY = 0;
            targetScrollY = 0;
            window.scrollTo(0, 0);
            return;
        }
        const maxScroll = getMaxScroll();
        targetScrollY = Math.max(0, Math.min(targetScrollY, maxScroll));
        const diff = targetScrollY - currentScrollY;

        // If distance is negligible, snap and sleep RAF loop to save GPU/battery
        if (Math.abs(diff) < 0.25) {
            currentScrollY = targetScrollY;
            window.scrollTo(0, currentScrollY);
            updateHUDAndEffects(currentScrollY);
            isLerping = false;
            return;
        }

        // LERP: current += (target - current) * lerpFactor
        currentScrollY += diff * lerpFactor;
        window.scrollTo(0, currentScrollY);
        updateHUDAndEffects(currentScrollY);

        requestAnimationFrame(lerpUpdate);
    }

    // Intercept mouse wheel for unified inertial scrolling
    window.addEventListener('wheel', (e) => {
        if (cvDialog?.open) return;
        if (isPreloadActive()) {
            e.preventDefault();
            return;
        }
        if (e.ctrlKey) return; // Allow normal browser zoom

        e.preventDefault();

        let delta = e.deltaY;
        if (e.deltaMode === 1) {
            delta *= 35; // Line mode
        } else if (e.deltaMode === 2) {
            delta *= window.innerHeight; // Page mode
        }

        targetScrollY += delta * 0.75;
        targetScrollY = Math.max(0, Math.min(targetScrollY, getMaxScroll()));

        startLerpLoop();
    }, { passive: false });

    // Sync if user drags scrollbar directly or touches (RAF-throttled for 60/120fps mobile performance)
    let scrollRafTicking = false;
    window.addEventListener('scroll', () => {
        if (isPreloadActive()) {
            window.scrollTo(0, 0);
            return;
        }
        const actualY = window.scrollY || window.pageYOffset;
        if (!isLerping || Math.abs(actualY - currentScrollY) > 6) {
            currentScrollY = actualY;
            targetScrollY = actualY;
            if (!scrollRafTicking) {
                requestAnimationFrame(() => {
                    updateHUDAndEffects(currentScrollY);
                    scrollRafTicking = false;
                });
                scrollRafTicking = true;
            }
        }
    }, { passive: true });

    // Keyboard navigation support (ArrowDown, ArrowUp, PageDown, PageUp, Space, Home, End)
    window.addEventListener('keydown', (e) => {
        if (cvDialog?.open || isPreloadActive()) {
            return;
        }
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag === 'input' || activeTag === 'textarea') return;

        let delta = 0;
        if (e.key === 'ArrowDown') delta = 90;
        else if (e.key === 'ArrowUp') delta = -90;
        else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) delta = window.innerHeight * 0.85;
        else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) delta = -window.innerHeight * 0.85;
        else if (e.key === 'Home') {
            e.preventDefault();
            targetScrollY = 0;
            startLerpLoop();
            return;
        } else if (e.key === 'End') {
            e.preventDefault();
            targetScrollY = getMaxScroll();
            startLerpLoop();
            return;
        }

        if (delta !== 0) {
            e.preventDefault();
            targetScrollY += delta;
            targetScrollY = Math.max(0, Math.min(targetScrollY, getMaxScroll()));
            startLerpLoop();
        }
    });

    // Listen for preloader completion to reset position and sync HUD cleanly from top
    window.addEventListener('preloaderFinished', () => {
        currentScrollY = 0;
        targetScrollY = 0;
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        updateHUDAndEffects(0);
    });

    // Smooth Anchor Navigation driven by LERP
    function smoothScrollTo(targetPosition) {
        targetScrollY = Math.max(0, Math.min(targetPosition, getMaxScroll()));
        startLerpLoop();
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').substring(1);
            if (targetId) {
                e.preventDefault();
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const headerOffset = 80;
                    const offsetPosition = targetElement.offsetTop - headerOffset;
                    smoothScrollTo(offsetPosition);
                }
            }
        });
    });

    // Scroll to top on Rolex HUD click
    if (scrollHud) {
        scrollHud.addEventListener('click', () => {
            smoothScrollTo(0);
        });
    }

    // Initial position sync
    updateHUDAndEffects(currentScrollY);

    // ------------------------------------------
    // 5. 3D TILT EFFECT ON PROJECT CARDS
    // ------------------------------------------
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
        });
    });

    // ------------------------------------------
    // 6. ANIMATED NUMBER COUNTERS (HERO STATS)
    // ------------------------------------------
    const statNumbers = document.querySelectorAll('.stat-num[data-count]');
    let hasCounted = false;

    const runCounters = () => {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'), 10);
            let current = 0;
            const stepTime = 120;
            const timer = setInterval(() => {
                current += 1;
                stat.textContent = `${current}+`;
                if (current >= target) {
                    clearInterval(timer);
                }
            }, stepTime);
        });
    };

    if ('IntersectionObserver' in window && statNumbers.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasCounted) {
                    hasCounted = true;
                    runCounters();
                }
            });
        }, { threshold: 0.5 });

        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) statsObserver.observe(heroStats);
    } else {
        runCounters();
    }

    // ------------------------------------------
    // 6b. SKILLS PROGRESS BARS COME/GO ANIMATION
    // ------------------------------------------
    const skillsSection = document.querySelector('#skills');
    const skillBars = document.querySelectorAll('.skills .bar span');

    // Ensure all skill bars have their target width saved in CSS variable and static width applied
    skillBars.forEach(bar => {
        let w = bar.style.getPropertyValue('--w') || bar.style.width;
        if (!w) {
            const pctSpan = bar.closest('.progress')?.querySelector('h3 span');
            if (pctSpan) w = pctSpan.textContent.trim();
        }
        if (w) {
            if (!w.endsWith('%') && !w.endsWith('px')) w += '%';
            bar.style.setProperty('--w', w);
            bar.dataset.width = w;
            bar.style.width = w;
        }
    });

    if (skillsSection && 'IntersectionObserver' in window) {
        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    skillsSection.classList.add('active-skills');
                } else {
                    skillsSection.classList.remove('active-skills');
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -20px 0px'
        });
        skillsObserver.observe(skillsSection);
    }

    // ------------------------------------------
    // 7. INTERACTIVE PARTICLE CONSTELLATION CANVAS
    // ------------------------------------------
});

// ══════════════════════════════════════════
// PROJECT CATEGORY TABS — Sliding Indicator
// ══════════════════════════════════════════
(function initProjectTabs() {
    const tabs = document.querySelectorAll('.proj-tab');
    const panels = document.querySelectorAll('.proj-panel');
    const indicator = document.getElementById('tabIndicator');

    if (!tabs.length || !panels.length || !indicator) return;

    function moveIndicatorTo(tab) {
        indicator.style.width = tab.offsetWidth + 'px';
        indicator.style.transform = `translateX(${tab.offsetLeft - indicator.offsetLeft}px)`;
    }

    // Set indicator on load
    const activeTab = document.querySelector('.proj-tab.active');
    if (activeTab) {
        // Use rAF to ensure layout is settled
        requestAnimationFrame(() => moveIndicatorTo(activeTab));
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPanel = tab.dataset.panel;

            // Update tabs
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            // Update panels
            panels.forEach(panel => {
                if (panel.id === 'panel-' + targetPanel) {
                    panel.removeAttribute('hidden');
                    panel.classList.add('active');
                } else {
                    panel.setAttribute('hidden', '');
                    panel.classList.remove('active');
                }
            });

            // Move indicator
            moveIndicatorTo(tab);
        });
    });

    // Recalculate on resize
    window.addEventListener('resize', () => {
        const active = document.querySelector('.proj-tab.active');
        if (active) moveIndicatorTo(active);
    });
})();

// ==========================================
// SKILLS SECTION — Tab Filter + Ring Animate
// ==========================================
(function initSkills() {
    const tabsEl  = document.getElementById('skTabs');
    const tabs    = document.querySelectorAll('.sk-tab');
    const cards   = document.querySelectorAll('.sk-card');
    if (!tabs.length || !cards.length) return;

    // ── Inject sliding indicator pill ──────
    const indicator = document.createElement('div');
    indicator.className = 'sk-indicator';
    tabsEl.prepend(indicator);

    function moveIndicatorTo(tab) {
        const tabsRect = tabsEl.getBoundingClientRect();
        const tabRect  = tab.getBoundingClientRect();
        indicator.style.width     = tabRect.width + 'px';
        indicator.style.transform = `translateX(${tabRect.left - tabsRect.left}px)`;
    }

    // Position on load
    const firstActive = tabsEl.querySelector('.sk-tab.active');
    if (firstActive) requestAnimationFrame(() => moveIndicatorTo(firstActive));

    // ── Tab filter ─────────────────────────
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            moveIndicatorTo(tab);

            const filter = tab.dataset.sk;
            let delay = 0;
            cards.forEach(card => {
                card.classList.remove('sk-pop');
                if (filter === 'all' || card.dataset.cat === filter) {
                    card.classList.remove('sk-hidden');
                    // stagger pop-in
                    const d = delay;
                    setTimeout(() => {
                        card.classList.add('sk-pop');
                        setTimeout(() => card.classList.remove('sk-pop'), 320);
                    }, d);
                    delay += 40;
                } else {
                    card.classList.add('sk-hidden');
                }
            });
        });
    });

    // Re-position indicator on resize
    window.addEventListener('resize', () => {
        const active = tabsEl.querySelector('.sk-tab.active');
        if (active) moveIndicatorTo(active);
    });

    // ── Ring animation on scroll-into-view ─
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('sk-animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.25 });

    cards.forEach(card => observer.observe(card));
})();