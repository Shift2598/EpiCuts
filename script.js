// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Active nav link highlighting
const sections = document.querySelectorAll('section[id], header[id]');
const navItems = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
    const scrollPos = window.pageYOffset + 100;

    let currentSection = '';

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
            currentSection = id;
        }
    });

    // If at top of page, highlight Home
    if (window.pageYOffset < 200) {
        currentSection = 'home';
    }

    navItems.forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (href && href === `#${currentSection}`) {
            item.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNav);
updateActiveNav();

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
const animateElements = document.querySelectorAll(
    '.technique-card, .gallery-item, .testimonial-card, .service-card, .about-content, .about-image, .contact-info, .contact-form'
);

animateElements.forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Stagger animation for grid items
const staggerGrids = document.querySelectorAll('.techniques-grid, .services-grid, .testimonials-grid, .gallery-grid');

staggerGrids.forEach(grid => {
    const items = grid.children;
    Array.from(items).forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
});

// Form submission with better UX
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    const originalBg = btn.style.background;

    // Loading state
    btn.textContent = 'Sending...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    // Submit to backend API
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    fetch('/api/bookings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            btn.textContent = 'Request Sent!';
            btn.style.background = '#2d7a3a';
            btn.style.color = '#fff';
            btn.style.opacity = '1';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = originalBg;
                btn.style.color = '';
                btn.disabled = false;
                contactForm.reset();
            }, 3000);
        } else {
            btn.textContent = 'Error!';
            btn.style.background = '#c0392b';
            btn.style.color = '#fff';
            btn.style.opacity = '1';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = originalBg;
                btn.style.color = '';
                btn.disabled = false;
            }, 2000);
        }
    })
    .catch(err => {
        btn.textContent = 'Error!';
        btn.style.background = '#c0392b';
        btn.style.color = '#fff';
        btn.style.opacity = '1';
        console.error('Booking error:', err);
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = originalBg;
            btn.style.color = '';
            btn.disabled = false;
        }, 2000);
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const id = this.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Gallery hover sound effect (optional - subtle feedback)
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
    item.addEventListener('mouseleave', () => {
        item.style.transition = 'transform 0.3s ease';
    });
});

// Back to top functionality when clicking logo
document.querySelector('.logo').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Lazy load images for better performance
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Preload critical fonts
const fontLink = document.createElement('link');
fontLink.rel = 'preload';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap';
fontLink.as = 'style';
document.head.appendChild(fontLink);

// Popup notification
const popupOverlay = document.getElementById('popupOverlay');
const popupClose = document.getElementById('popupClose');

popupClose.addEventListener('click', () => {
    popupOverlay.classList.remove('active');
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
});

popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) {
        popupOverlay.classList.remove('active');
    }
});

// Auto popup after 15 seconds
setTimeout(() => {
    popupOverlay.classList.add('active');
}, 15000);

// Load gallery from API
fetch('/api/gallery.php')
    .then(res => res.json())
    .then(images => {
        const grid = document.getElementById('galleryGrid');
        if (!grid || !images.length) return;
        grid.innerHTML = images.map(img => `
            <div class="gallery-item">
                <div class="gallery-image">
                    <img src="${img.image_url}" alt="${img.title}" loading="lazy">
                </div>
            </div>
        `).join('');
    })
    .catch(() => {});

// Populate date and time dropdowns for booking form
const monthSelect = document.getElementById('bookingMonth');
const daySelect = document.getElementById('bookingDay');
const timeSelect = document.getElementById('bookingTime');
const dateHidden = document.getElementById('bookingDate');
const timeHidden = document.getElementById('bookingTimeHidden');

if (monthSelect && daySelect && timeSelect) {
    const months = [
        { value: '01', label: 'January' }, { value: '02', label: 'February' },
        { value: '03', label: 'March' }, { value: '04', label: 'April' },
        { value: '05', label: 'May' }, { value: '06', label: 'June' },
        { value: '07', label: 'July' }, { value: '08', label: 'August' },
        { value: '09', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' }
    ];

    const now = new Date();
    const currentMonth = now.getMonth();
    months.forEach((m, i) => {
        const opt = document.createElement('option');
        opt.value = m.value;
        opt.textContent = m.label;
        if (i < currentMonth) opt.disabled = true;
        monthSelect.appendChild(opt);
    });

    function populateDays() {
        daySelect.innerHTML = '<option value="" disabled selected>Day</option>';
        if (!monthSelect.value) return;
        const year = new Date().getFullYear();
        const month = parseInt(monthSelect.value);
        const today = new Date();
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const opt = document.createElement('option');
            opt.value = String(d).padStart(2, '0');
            opt.textContent = d;
            if (year === today.getFullYear() && month === today.getMonth() + 1 && d <= today.getDate()) {
                if (d < today.getDate()) opt.disabled = true;
            }
            daySelect.appendChild(opt);
        }
    }

    function populateTimes() {
        timeSelect.innerHTML = '<option value="" disabled selected>Time</option>';
        const slots = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30'];
        slots.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            const [h, m] = t.split(':');
            const hour = parseInt(h);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const display = `${hour > 12 ? hour - 12 : hour}:${m} ${ampm}`;
            opt.textContent = display;
            timeSelect.appendChild(opt);
        });
    }

    monthSelect.addEventListener('change', () => {
        populateDays();
        updateHidden();
    });
    daySelect.addEventListener('change', updateHidden);
    timeSelect.addEventListener('change', updateHidden);

    function updateHidden() {
        if (monthSelect.value && daySelect.value) {
            const year = new Date().getFullYear();
            dateHidden.value = `${year}-${monthSelect.value}-${daySelect.value}`;
        }
        if (timeSelect.value) {
            timeHidden.value = timeSelect.value;
        }
    }

    populateDays();
    populateTimes();
}
