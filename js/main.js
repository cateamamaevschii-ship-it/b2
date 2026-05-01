document.addEventListener("DOMContentLoaded", () => {
  // Localization Logic
  let currentLang = localStorage.getItem('site_lang') || 'en';

  const updateTranslations = () => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[currentLang] && translations[currentLang][key]) {
        if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
          el.setAttribute('placeholder', translations[currentLang][key]);
        } else {
          el.innerHTML = translations[currentLang][key];
        }
      }
    });

    // Original Homepage Scroll Text Logic
    const scrollText = document.getElementById('animated-scroll-text');
    if (scrollText) {
      const textToSplit = translations[currentLang]['home_scroll_text'];
      if (textToSplit) {
        const words = textToSplit.split(' ');
        scrollText.innerHTML = '';
        words.forEach(word => {
          const span = document.createElement('span');
          span.innerText = word + ' ';
          scrollText.appendChild(span);
        });
        window.dispatchEvent(new Event('scroll'));
      }
    }

    // Services Motto Word Split Logic
    const serviceMottoLines = document.querySelectorAll('.service-cta-section .split-text-reveal');
    serviceMottoLines.forEach(line => {
      const key = line.getAttribute('data-i18n');
      if (key && translations[currentLang] && translations[currentLang][key]) {
        line.classList.add('word-anim');
        const textToSplit = translations[currentLang][key];
        const words = textToSplit.split(' ');
        line.innerHTML = '';
        words.forEach(word => {
          const span = document.createElement('span');
          span.innerText = word;
          line.appendChild(span);
          line.appendChild(document.createTextNode(' ')); // Explicit space
        });
      }
    });

    // Update switcher active state
    document.querySelectorAll('.language-switcher button').forEach(btn => {
      if (btn.getAttribute('data-lang') === currentLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Run responsive line splits after translations are fully applied
    if (typeof initResponsiveLineSplits === 'function') {
      setTimeout(initResponsiveLineSplits, 50);
    }
  };

  // --- Responsive Line Split Utility ---
  function initResponsiveLineSplits() {
    const targets = document.querySelectorAll(`
      h1:not(.mission-intro-title):not(.hero-title-mask h1):not(.expand-title h1):not(.split-word-left):not(.split-word-right),
      h2:not(.hero-subtitle):not(#animated-scroll-text):not(.cinematic-overlay h2):not(.split-text-reveal):not(.process-overview-big-title h2),
      h3,
      h4:not(.expand-title h4),
      p:not(.team-intro-text):not(.mission-bottom-text p):not(.exp-panel p)
    `);

    const validTargets = Array.from(targets).filter(el => {
      if (el.closest('header') || el.closest('footer') || el.closest('.contact-lines')) return false;
      if (el.querySelector('a')) return false; // Prevent breaking nested links
      if (!el.innerText.trim()) return false;
      return true;
    });

    validTargets.forEach(el => {
      // Temporarily store original text explicitly
      let text = el.getAttribute('data-orig-text');
      if (!text) {
        // If it's the first time, read the text content and strip HTML cleanly safely
        text = el.textContent.trim().replace(/\s+/g, ' ');
        el.setAttribute('data-orig-text', text);
      } else {
        // If translated, we use the new translation which should have been injected by updateTranslations,
        // wait, updateTranslations overwrites innerHTML, so textContent is now the translated text
        text = el.textContent.trim().replace(/\s+/g, ' ');
      }

      el.innerHTML = '';
      const words = text.split(' ');
      const wordSpans = [];

      words.forEach(word => {
        const span = document.createElement('span');
        span.style.display = 'inline-block';
        span.innerText = word + ' ';
        el.appendChild(span);
        wordSpans.push(span);
      });

      let lastTop = -1;
      let currentLine = [];
      let lines = [];

      wordSpans.forEach(span => {
        const top = span.offsetTop;
        if (top !== lastTop && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = [];
        }
        currentLine.push(span);
        lastTop = top;
      });
      if (currentLine.length > 0) lines.push(currentLine);

      el.innerHTML = '';
      lines.forEach(lineWords => {
        const wrapper = document.createElement('span');
        wrapper.style.display = 'block';
        wrapper.style.overflow = 'hidden';

        const inner = document.createElement('span');
        inner.style.display = 'block';
        inner.style.transform = 'translateY(110%)';
        inner.classList.add('r-split-line');

        let lt = '';
        lineWords.forEach(w => lt += w.innerText);
        inner.innerText = lt;

        wrapper.appendChild(inner);
        el.appendChild(wrapper);
      });

      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        if (el._st) el._st.kill();
        el._st = ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          onEnter: () => {
            gsap.to(el.querySelectorAll('.r-split-line'), {
              y: '0%', duration: 1.0, stagger: 0.1, ease: 'power3.out'
            });
          }
        });
      }
    });
  }

  window.addEventListener('resize', () => {
    if (typeof initResponsiveLineSplits === 'function') {
      clearTimeout(window._rsT);
      window._rsT = setTimeout(initResponsiveLineSplits, 300);
    }
  });

  // Perform initial translation
  if (typeof translations !== 'undefined') {
    updateTranslations();
  }

  // Bind language switcher buttons
  document.querySelectorAll('.language-switcher button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentLang = e.target.getAttribute('data-lang');
      localStorage.setItem('site_lang', currentLang);
      updateTranslations();
    });
  });

  // Sticky Header Auto-hide
  const header = document.querySelector('header');
  let lastScrollPos = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Hide header on scroll down, show on scroll up
    if (currentScrollY > lastScrollPos && currentScrollY > 150) {
      header.classList.add('nav-hidden');
    } else {
      header.classList.remove('nav-hidden');
    }
    lastScrollPos = currentScrollY;

    // Background style applying when scrolled down
    if (currentScrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Menu Logic
  const burgerMenu = document.getElementById('burger-menu');
  const navLinks = document.querySelector('.nav-links');

  if (burgerMenu) {
    burgerMenu.addEventListener('click', () => {
      burgerMenu.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.classList.toggle('no-scroll');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burgerMenu.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // Smooth GSAP Staggered Entrance for Projects Grids
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.projects-grid').forEach(grid => {
      const cards = grid.querySelectorAll('.project-card');

      // Remove generic CSS reveal to let GSAP handle it perfectly
      cards.forEach(card => card.classList.remove('reveal'));

      gsap.fromTo(cards,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: grid,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }

  // Generic Reveal Elements on Scroll (fallback/standard)
  const revealElements = document.querySelectorAll('.reveal');

  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const elementVisible = 100;

    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      if (elementTop < windowHeight - elementVisible) {
        element.classList.add('active');
      }
    });
  };

  // Initial check and event listener
  revealOnScroll();
  window.addEventListener('scroll', revealOnScroll);

  // Smooth scroll for anchor links (if any)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // Yodezeen Style Entrance Sequence & Hero Slider
  const preloader = document.getElementById('preloader');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroTitle = document.querySelector('.hero h1');
  const headerElem = document.querySelector('header');
  const firstSlide = document.querySelector('.slide.active');
  const preloaderProgress = document.querySelector('.preloader-progress');
  const preloaderLogo = document.querySelector('.preloader-logo');
  const allSlides = document.querySelectorAll('.slide');

  // Set initial text states before timeline starts to prevent flashes
  if (heroSubtitle) gsap.set(heroSubtitle, { y: '100%' });
  if (heroTitle) gsap.set(heroTitle, { y: '100%' });
  if (headerElem) gsap.set(headerElem, { y: '-100%', opacity: 0 });
  if (firstSlide) gsap.set(firstSlide, { scale: 1.15 });

  let sliderInterval;

  // Wait a small tick before starting animations
  if (preloader && typeof gsap !== 'undefined') {
    // Lock scroll exactly like Yodezeen prevents scrolling immediately
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        // Unlock scroll and start regular slider
        document.body.style.overflow = '';
        startHeroSlider();
      }
    });

    // 1. Loading progress (simulated aesthetic load)
    tl.to(preloaderProgress, {
      width: '100%',
      duration: 1.5,
      ease: 'power2.inOut'
    })
      // 2. Pulse logo slightly and fade out progress
      .to(preloaderLogo, {
        scale: 1.05,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in'
      }, '+=0.2')
      .to(preloaderProgress, {
        opacity: 0,
        duration: 0.4
      }, '<')
      // 3. Slide up the preloader curtain
      .to(preloader, {
        y: '-100%',
        duration: 1.2,
        ease: 'power4.inOut'
      })
      // 4. Parallax zoom out the active hero image slowly
      .to(firstSlide, {
        scale: 1.0,
        duration: 4,
        ease: 'power2.out'
      }, '-=0.8')
      // 5. Header drops into place smoothly
      .to(headerElem, {
        y: '0%',
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out'
      }, '-=3.5')
      // 6. Text stagger slide-up (Sub-title first, then title)
      .to([heroSubtitle, heroTitle], {
        y: '0%',
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out'
      }, '-=3.0');
  } else {
    // Fallback if no preloader (for inner pages)
    if (headerElem) gsap.set(headerElem, { y: '0%', opacity: 1 });
    if (heroSubtitle) gsap.set(heroSubtitle, { y: '0%' });
    if (heroTitle) gsap.set(heroTitle, { y: '0%' });
    if (firstSlide) gsap.set(firstSlide, { scale: 1.0 });

    startHeroSlider();
  }

  // Hero Slider Logic encapsulated to start *after* the timeline
  function startHeroSlider() {
    if (allSlides.length > 0) {
      // Ensure the first slide finishes exactly at scale: 1
      gsap.set(firstSlide, { scale: 1.0 });

      let currentSlide = 0;
      sliderInterval = setInterval(() => {
        allSlides[currentSlide].classList.remove('active');

        currentSlide = (currentSlide + 1) % allSlides.length;

        allSlides[currentSlide].classList.add('active');
        // Subtle GSAP zoom on new slide for consistency with entrance
        gsap.fromTo(allSlides[currentSlide],
          { scale: 1.05 },
          { scale: 1.0, duration: 6, ease: 'none' }
        );
      }, 6000);
    }
  }

  // Animated Scroll Text
  const scrollText = document.getElementById('animated-scroll-text');
  if (scrollText) {
    window.addEventListener('scroll', () => {
      const parentSection = scrollText.closest('.scroll-text-section');
      const rect = parentSection.getBoundingClientRect();
      const scrollHeight = rect.height - window.innerHeight;

      let progress = -rect.top / scrollHeight;

      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      const spans = scrollText.querySelectorAll('span');
      const wordsToShow = Math.floor(progress * spans.length);

      spans.forEach((span, index) => {
        if (index < wordsToShow) {
          span.style.opacity = '1';
        } else {
          span.style.opacity = '0.15';
        }
      });
    });
    // Trigger once on load
    window.dispatchEvent(new Event('scroll'));
  }

  // Integrated Studio Mission Animation
  const studioMission = document.querySelector('.studio-mission');
  if (studioMission && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const missionTl = gsap.timeline({
      scrollTrigger: {
        trigger: studioMission,
        start: "top top",
        end: "+=1000%", // Extensively increased for an extremely deliberate and slow scroll sequence
        pin: true,
        scrub: 2.5, // Increased inertia for a "wealthier", more controlled movement feel
        anticipatePin: 1
      }
    });

    // 1. Scene 1: Initial Reveal (Text Only)
    missionTl.fromTo(".mission-intro-title span", { y: 150, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, stagger: 0.3, ease: "power4.out" }, 0.2)
      .fromTo(".mission-intro-desc", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power3.out" }, 1);

    // 2. Text Exits
    missionTl.to(".mission-intro-title", { y: "-120vh", opacity: 0, duration: 3, ease: "power3.inOut" }, 4.5)
      .to(".mission-intro-desc", { y: "-120vh", opacity: 0, duration: 2.8, ease: "power3.inOut" }, 4.6)
      .to(".mission-scroll-arrow", { y: -150, opacity: 0, duration: 2 }, 4.5);

    // 3. Image Enters Full Screen (After text leaves)
    missionTl.fromTo(".mission-intro-image", { top: "120%", opacity: 0 }, {
      width: "100vw",
      height: "100vh",
      right: "0%",
      top: "0%",
      yPercent: 0,
      y: 0, // Safety reset
      borderRadius: 0,
      opacity: 1,
      duration: 3,
      ease: "power2.inOut"
    }, 5.5)
      .to({}, { duration: 1.5 }); // Keep timeline perfectly timed for the next scene

    // 4. Image Exits completely (Fade + Scale Up)
    missionTl.to(".mission-intro-image", { scale: 1.1, opacity: 0, duration: 2, ease: "power2.inOut" }, 10);

    // 5. Scene 2 Fade In (on solid black background)
    missionTl.to(".mission-stack-container", { opacity: 1, scale: 1, duration: 2, ease: "power3.out" }, 12);

    // 6. Stacking Words Logic (Progressive One-by-One Swaps)
    // --- Step 1: Word 1 Swaps (REFINING -> CAPTURING) ---
    missionTl.to("#line-1 .stack-word:nth-child(1)", { y: "-100%", opacity: 0, duration: 1.5 }, 14.5)
      .to("#line-1 .stack-word:nth-child(2)", { y: "0%", opacity: 1, duration: 1.5 }, 15);

    // --- Step 2: Word 2 Swaps (RAW -> DRAMATIC) ---
    missionTl.to("#line-2 .stack-word:nth-child(1)", { y: "-100%", opacity: 0, duration: 1.5 }, 17.5)
      .to("#line-2 .stack-word:nth-child(2)", { y: "0%", opacity: 1, duration: 1.5 }, 18);

    // --- Step 3: Word 3 Swaps (ELEGANCE -> LIGHTING) ---
    missionTl.to("#line-3 .stack-word:nth-child(1)", { y: "-100%", opacity: 0, duration: 1.5 }, 20.5)
      .to("#line-3 .stack-word:nth-child(2)", { y: "0%", opacity: 1, duration: 1.5 }, 21);

    // Final Reveal of bottom motto
    missionTl.to(".mission-bottom-text", { y: -40, opacity: 1, duration: 2, ease: "power3.out" }, 23)
      .to(".mission-stack-container", { opacity: 0, y: -20, duration: 1.5, ease: "power2.in" }, 26)
      .to(".mission-bottom-text", { opacity: 0, y: -20, duration: 1.5, ease: "power2.in" }, 26.5)
      .to({}, { duration: 5 }); // 7. Dead scroll phase for a clean 'black screen' void transition
  }

  // Cinematic GSAP ScrollTrigger Sequence
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && document.querySelector('.cinematic-project')) {
    gsap.registerPlugin(ScrollTrigger);

    // Fade in the entire cinematic sticky frame from the black void as it enters the viewport
    gsap.fromTo(".cinematic-sticky",
      { opacity: 0 },
      {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".cinematic-project",
          start: "top bottom", // Start fading in when the frame enters the screen
          end: "top top",     // Takes the ENTIRE entry scroll height to fade in beautifully slowly
          scrub: 2
        }
      }
    );

    const cinematicTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".cinematic-project",
        start: "top top",
        end: "bottom bottom",
        scrub: 2
      }
    });

    // Animate the background image to "pan out and glide" without blur
    cinematicTl
      // Start zoomed in, dark, NO BLUR
      .fromTo(".cinematic-bg",
        { scale: 1.6, filter: "brightness(0.3)", transformOrigin: "50% 50%" },
        // Pan out very gracefully over a longer duration fraction
        { scale: 1, filter: "brightness(0.9)", transformOrigin: "50% 50%", duration: 6, ease: "power1.inOut" }
      )
      // Fade in overlay extremely slowly
      .to(".cinematic-overlay", { opacity: 1, duration: 2.5 }, "-=3.5")
      // Slide up the title and button very slowly
      .fromTo(".cinematic-overlay h2", { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 2, ease: "power2.out" }, "-=2.5")
      // Slide up the button at the very end
      .fromTo(".cinematic-more", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 2 }, "-=1");
  }

  // Team Page Split View Sequence
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && document.querySelector('.team-scroll-container')) {
    gsap.registerPlugin(ScrollTrigger);

    const teamTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".team-scroll-container",
        start: "top top",
        end: "+=250%", // Usor marit pentru a oferi mai mult spatiu fizic de scroll
        pin: true,
        scrub: 1.5 // Smooth sluggish inertia
      }
    });

    teamTl
      // Phase 1: Mutarea textelor initiale si Colorarea portretelor
      .to(".team-bg-text", { scale: 1.2, opacity: 0.5, duration: 1 }, 0)
      .to(".team-fg-text", { y: "-15vh", ease: "power1.inOut", duration: 1 }, 0)
      .to(".portrait img.color", { opacity: 1, duration: 1, ease: "power2.inOut" }, 0)

      // Phase 2: Dupa ce se coloreaza, portretele se dau in parti de tot (ies din ecran) - MAI INCET SI LINIAR
      .to(".left-portrait", { x: "-60vw", ease: "none", duration: 4 }, 1)
      .to(".right-portrait", { x: "60vw", ease: "none", duration: 4 }, 1)

      // Phase 3: Textul descriptiv apare si este pozitionat mult mai jos
      .fromTo(".team-intro-text", { y: "25vh", opacity: 0 }, { y: "15vh", opacity: 1, ease: "power2.out", duration: 1.5 }, 3.5)

      .to({}, { duration: 0.5 }); // Buffer before unpinning

  }

  // Yodezeen style Expanding "Why Us" Sequence
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && document.querySelector('.yodz-why-section')) {
    gsap.registerPlugin(ScrollTrigger);

    // Check if on mobile to set appropriate width
    const isMobile = window.innerWidth <= 1024;
    const initialWidth = isMobile ? "60vw" : "20vw";

    const whyTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".yodz-why-section",
        start: "top top",
        end: "+=700%", // Reduced from 1400% for a tighter sequence
        pin: true,
        scrub: 2.5
      }
    });

    // Step -1: The big background title animates in first
    whyTl.to(".expand-title", {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: "power2.out"
    })
      // Add dead scroll space so the user can just look at the title for a bit
      .to({}, { duration: 2.5 })

      // Step 0: The window pops into existence from absolutely nothing
      .to(".expand-window", {
        opacity: 1,
        width: initialWidth,
        height: "40vh",
        duration: 1,
        ease: "power3.out"
      })
      // Step 1: Expand the window from center to full screen
      .to(".expand-window", {
        width: "100vw",
        height: "100vh",
        borderRadius: "0px",
        duration: 2.5, // Even slower expansion
        ease: "power2.inOut"
      }, "+=0.5") // Brief pause holding the window before blowing it up
      // Darken overlay, fade out background title concurrently
      .to(".expand-overlay", { opacity: 0.7, duration: 1 }, "-=1.5")
      .to(".expand-title", { opacity: 0, scale: 0.95, y: -50, duration: 1.5 }, "-=2");

    // Phase 1: Show Panel 1
    whyTl.fromTo(".p1", { y: 150, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" });
    whyTl.to(".p1", { y: -150, opacity: 0, duration: 1.5, ease: "power2.in" }, "+=2.5"); // Pause heavily before changing

    // Phase 2: Fade in Image 2, Show Panel 2
    whyTl.to(".why-stk-img:nth-child(2)", { opacity: 1, duration: 1.5 }, "-=1");
    whyTl.fromTo(".p2", { y: 150, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" }, "-=0.8");
    whyTl.to(".p2", { y: -150, opacity: 0, duration: 1.5, ease: "power2.in" }, "+=2.5");

    // Phase 3: Fade in Image 3, Show Panel 3
    whyTl.to(".why-stk-img:nth-child(3)", { opacity: 1, duration: 1.5 }, "-=1");
    whyTl.fromTo(".p3", { y: 150, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" }, "-=0.8");
    whyTl.to(".p3", { y: -150, opacity: 0, duration: 1.5, ease: "power2.in" }, "+=2.5");

    // Phase 4: Fade in Image 4, Show Panel 4
    whyTl.to(".why-stk-img:nth-child(4)", { opacity: 1, duration: 1.5 }, "-=1");
    whyTl.fromTo(".p4", { y: 150, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" }, "-=0.8");
    whyTl.to(".p4", { y: -150, opacity: 0, duration: 1.5, ease: "power2.in" }, "+=2.5");

    // Phase 5: Fade in Image 5, Show Panel 5
    whyTl.to(".why-stk-img:nth-child(5)", { opacity: 1, duration: 1.5 }, "-=1");
    whyTl.fromTo(".p5", { y: 150, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" }, "-=0.8");

    // Phase 6: Empty scroll delay at the very end
    whyTl.to({}, { duration: 4 }); // Allow user to scroll 'in place' with nothing changing before unpinning
  }

  // ==========================================
  // Project Details Page Specific Animations
  // ==========================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && document.querySelector('.project-page-body')) {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Initial Hero Parallax zooming slowly out
    const heroImg = document.querySelector('.project-hero-img');
    if (heroImg) {
      gsap.to(heroImg, {
        scale: 1,
        ease: "power1.out",
        duration: 2.5
      });

      // Also slight parallax down as user scrolls
      gsap.to(heroImg, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: ".project-hero-fullscreen",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }

    // 2. Split Text Reveals (.split-text-reveal inside .split-text-wrapper)
    const textWrappers = document.querySelectorAll('.split-text-wrapper');
    textWrappers.forEach(wrapper => {
      const reveals = wrapper.querySelectorAll('.split-text-reveal');
      if (reveals.length > 0) {
        gsap.to(reveals, {
          y: '0%',
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapper,
            start: "top 85%", // Trigger when the top of the wrapper hits 85% of viewport
            toggleActions: "play none none reverse"
          }
        });
      }
    });

    // 3. Circle Decorator Scale Reveal
    const circle = document.querySelector('.reveal-circle');
    if (circle) {
      gsap.to(circle, {
        scale: 1,
        opacity: 1,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)",
        scrollTrigger: {
          trigger: ".project-info-section",
          start: "top 70%"
        }
      });
    }

    // 4. Landscape image fade up
    const landscapeUp = document.querySelector('.reveal-up');
    if (landscapeUp) {
      gsap.to(landscapeUp, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".project-landscape-section",
          start: "top 75%"
        }
      });
    }

    // 5. Huge CTA Parallax Scroll
    const ctaSection = document.querySelector('.project-cta-section');
    if (ctaSection) {
      const bgTexts = document.querySelectorAll('.cta-bg-text');
      // Subtle opposite horizontal shifts
      if (bgTexts.length >= 2) {
        gsap.to(bgTexts[0], {
          x: "10vw",
          ease: "none",
          scrollTrigger: {
            trigger: ctaSection,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
        gsap.to(bgTexts[1], {
          x: "-10vw",
          ease: "none",
          scrollTrigger: {
            trigger: ctaSection,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      }
    }

    // 6. Next Project Image Unmasking exactly like Yodezeen style
    const nextSection = document.querySelector('.next-project-section');
    if (nextSection) {
      const imageReveal = document.querySelector('.next-project-image-reveal');
      const innerImg = document.querySelector('.next-img');

      // The container slides UP to 0 from 50%
      gsap.to(imageReveal, {
        y: "0%",
        ease: "none",
        scrollTrigger: {
          trigger: nextSection,
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1
        }
      });
      // The inner image slowly un-zooms for parallax depth
      gsap.to(innerImg, {
        scale: 1.05,
        ease: "none",
        scrollTrigger: {
          trigger: nextSection,
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1
        }
      });
    }
  }

  // ==========================================
  // Service Details Page Specific Animations
  // ==========================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && document.querySelector('.service-hero-fullscreen')) {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Hero Parallax
    const heroImg = document.querySelector('.service-hero-img');
    if (heroImg) {
      gsap.to(heroImg, {
        scale: 1,
        ease: "power1.out",
        duration: 2.5
      });

      gsap.to(heroImg, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".service-hero-fullscreen",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }

    // 1.5 Process Steps Stacking Scroll Animations
    const overviewTitle = document.querySelector('.process-overview-big-title h2');
    if (overviewTitle) {
      gsap.fromTo(overviewTitle, {
        y: 80,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".process-overview-hero",
          start: "top 40%" // Start earlier during the sticky sequence
        }
      });
    }

    const processSteps = document.querySelectorAll('.process-step-section');
    processSteps.forEach((step, i) => {
      const num = step.querySelector('.process-step-num');
      const content = step.querySelector('.process-step-content');

      // Animate contents coming in
      if (num) {
        gsap.fromTo(num, { opacity: 0, x: -60 }, {
          opacity: 1, x: 0, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: step, start: "top 80%" }
        });
      }
      if (content) {
        gsap.fromTo(content, { opacity: 0, y: 80 }, {
          opacity: 1, y: 0, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: step, start: "top 80%" }
        });
      }

      const isLast = i === processSteps.length - 1;

      // Only pin and scale the cards that are NOT the last one
      if (!isLast) {
        // Parallax Stacking Card Effect
        ScrollTrigger.create({
          trigger: step,
          start: "top top", // Pin when top of section hits top of viewport
          end: "+=180%",    // Stay pinned while user scrolls through the content (100%) + void gap (80%)
          pin: true,
          pinSpacing: false // Allows the NEXT section to scroll over it after the gap
        });

        // Scale down and fade back AFTER it stays on screen for a bit
        gsap.fromTo(step,
          { scale: 1, opacity: 1 },
          {
            scale: 0.85,
            opacity: 0.3,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: step,
              start: () => "top+=" + (window.innerHeight * 1.0) + " top", // Start scaling ONLY once the NEXT card begins its 80vh climb
              end: "+=80%",
              scrub: 1.5 // Buttery smooth lag-behind on scroll
            }
          }
        );
      }
    });

    // 2. Motto CTA Progressive Word Highlight
    const ctaSection = document.querySelector('.service-cta-section');
    if (ctaSection) {
      window.addEventListener('scroll', () => {
        const rect = ctaSection.getBoundingClientRect();
        const scrollHeight = rect.height - window.innerHeight;
        let progress = -rect.top / scrollHeight;

        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;

        const spans = ctaSection.querySelectorAll('.split-text-reveal span');
        const wordsToShow = Math.floor(progress * spans.length);

        spans.forEach((span, index) => {
          if (index < wordsToShow) {
            span.style.opacity = '1';
          } else {
            span.style.opacity = '0.25'; // Consistent with my recent visual adjustments
          }
        });
      });
      window.dispatchEvent(new Event('scroll'));
    }

    // 3. OTHER SERVICES Pin and Split Word Animation
    const otherSection = document.querySelector('.other-services-pin');
    if (otherSection) {
      const splitLeft = otherSection.querySelector('.split-word-left');
      const splitRight = otherSection.querySelector('.split-word-right');
      const gallery = otherSection.querySelector('.other-services-gallery');

      const tlOther = gsap.timeline({
        scrollTrigger: {
          trigger: otherSection,
          start: "top top",
          end: "+=150%", // Pins for 1.5x screen height
          pin: true,
          scrub: 1
        }
      });

      tlOther.to(splitLeft, {
        x: "-38vw", // Move partially off left
        opacity: 0.4,
        ease: "power2.inOut"
      }, 0)
        .to(splitRight, {
          x: "38vw", // Move partially off right
          opacity: 0.4,
          ease: "power2.inOut"
        }, 0)
        .to(gallery, {
          opacity: 1,
          scale: 1,
          ease: "power2.out"
        }, 0.2); // slight overlap so gallery appears as words depart
    }
  }
});
