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

// Load dynamic content from API
fetch('/api/content.php')
  .then(res => res.json())
  .then(items => {
    const map = {};
    items.forEach(item => { map[item.section + '_' + item.key] = item.value; });
    if (map.general_logo) {
      document.querySelectorAll('#logoText, #heroLogo, #footerLogo').forEach(el => el.textContent = map.general_logo);
    }
    if (map.general_logo_accent) {
      document.querySelectorAll('#logoAccent, #heroAccent, #footerAccent').forEach(el => el.textContent = map.general_logo_accent);
    }
    if (map.contact_address) {
      document.querySelectorAll('#topAddress, #contactAddress').forEach(el => {
        el.innerHTML = (el.id === 'topAddress' ? '&#9873; ' : '') + map.contact_address;
      });
    }
    if (map.contact_phone) {
      const el = document.getElementById('topPhone');
      if (el) el.innerHTML = '&#9742; ' + map.contact_phone;
      const el2 = document.getElementById('contactPhone');
      if (el2) el2.textContent = map.contact_phone;
    }
    if (map.contact_email) {
      const el = document.getElementById('contactEmail');
      if (el) el.textContent = map.contact_email;
    }
    if (map.general_hours) {
      document.querySelectorAll('#topHours, #contactHours').forEach(el => {
        el.innerHTML = (el.id === 'topHours' ? '&#9202; ' : '') + map.general_hours.replace(/\|/g, '<br>');
      });
    }
  })
  .catch(() => {});

// Form submission - native POST (bypasses Infinity Free security)
const contactForm = document.getElementById('contactForm');
contactForm.setAttribute('action', '/api/bookings.php');
contactForm.setAttribute('method', 'POST');

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

    function populateTimes(bookedTimes) {
        timeSelect.innerHTML = '<option value="" disabled selected>Time</option>';
        const slots = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
        const booked = bookedTimes || [];
        slots.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            const [h, m] = t.split(':');
            const hour = parseInt(h);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const display = `${hour > 12 ? hour - 12 : hour}:${m} ${ampm}`;
            if (booked.includes(t)) {
                opt.disabled = true;
                opt.textContent = display + ' (Booked)';
            } else {
                opt.textContent = display;
            }
            timeSelect.appendChild(opt);
        });
    }

    function fetchAvailability() {
        if (monthSelect.value && daySelect.value) {
            const year = new Date().getFullYear();
            const date = `${year}-${monthSelect.value}-${daySelect.value}`;
            fetch('/api/availability.php?date=' + date)
                .then(res => res.json())
                .then(booked => { populateTimes(booked); })
                .catch(() => { populateTimes(); });
        } else {
            populateTimes();
        }
    }

    monthSelect.addEventListener('change', () => {
        populateDays();
        fetchAvailability();
        updateHidden();
    });
    daySelect.addEventListener('change', () => {
        fetchAvailability();
        updateHidden();
    });
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

// Show success/error toast from redirect
const params = new URLSearchParams(window.location.search);
if (params.get('success') === '1') {
    const toast = document.createElement('div');
    toast.textContent = 'Booking sent! We\'ll confirm shortly.';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#27ae60;color:#fff;padding:16px 32px;font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:1px;z-index:9999;animation:fadeIn 0.3s';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
    history.replaceState({}, '', '/');
}
if (params.get('error') === 'time_taken') {
    const toast = document.createElement('div');
    toast.textContent = 'That time just got booked! Please pick another.';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#c0392b;color:#fff;padding:16px 32px;font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:1px;z-index:9999;animation:fadeIn 0.3s';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
    history.replaceState({}, '', '/');
} else if (params.get('error')) {
    const toast = document.createElement('div');
    toast.textContent = 'Something went wrong. Please try again.';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#c0392b;color:#fff;padding:16px 32px;font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:1px;z-index:9999;animation:fadeIn 0.3s';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
    history.replaceState({}, '', '/');
}
