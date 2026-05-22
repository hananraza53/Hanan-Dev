// toggle icon navbar
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}

// scroll sections
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    let top = window.scrollY;

    sections.forEach(sec => {
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            // active navbar links
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            let activeLink = document.querySelector('header nav a[href*=' + id + ']');
            if (activeLink) {
                activeLink.classList.add('active');
            }
            // active sections for animation on scroll
            sec.classList.add('show-animate');
        }
        // if want to animation that repeats on scroll use this
        else {
            sec.classList.remove('show-animate');
        }
    });

    // sticky navbar
    let header = document.querySelector('header');
    if (header) {
        header.classList.toggle('sticky', top > 100);
    }

    // remove toggle icon and navbar when click navbar links (scroll)
    if (menuIcon && navbar) {
        menuIcon.classList.remove('bx-x');
        navbar.classList.remove('active');
    }

    // animation footer on scroll
    let footer = document.querySelector('footer');
    if (footer) {
        footer.classList.toggle('show-animate', window.innerHeight + top >= document.scrollingElement.scrollHeight);
    }
}

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').substring(1);
        if (targetId) { // Skip if just "#"
            e.preventDefault();
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Theme Switcher Logic
const themeBtn = document.getElementById('theme-btn');
const themeMenu = document.querySelector('.theme-menu');
const themeOptions = document.querySelectorAll('.theme-option');

// Toggle theme menu
themeBtn.addEventListener('click', () => {
    themeMenu.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!themeBtn.contains(e.target) && !themeMenu.contains(e.target)) {
        themeMenu.classList.remove('active');
    }
});

// Set Theme
const setTheme = (theme) => {
    if(theme === 'default') {
        document.body.removeAttribute('data-theme');
    } else {
        document.body.setAttribute('data-theme', theme);
    }
    localStorage.setItem('selected-theme', theme);
};

// Handle Theme Option Click
themeOptions.forEach(option => {
    option.addEventListener('click', () => {
        const theme = option.getAttribute('data-set-theme');
        setTheme(theme);
        themeMenu.classList.remove('active');
    });
});

// Load saved theme
const savedTheme = localStorage.getItem('selected-theme');
if (savedTheme) {
    setTheme(savedTheme);
}