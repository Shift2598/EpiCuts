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
fetch('/api/content.php?_=' + Date.now())
  .then(res => res.json())
  .then(items => {
    const map = {};
    items.forEach(item => { map[item.section + '_' + item['key']] = item.value; });
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
    if (map.hero_subtext) {
      const el = document.getElementById('heroSubtext');
      if (el) el.textContent = map.hero_subtext;
    }
    if (map.about_title) {
      const el = document.getElementById('aboutTitle');
      if (el) el.textContent = map.about_title;
    }
    if (map.about_subtitle) {
      const el = document.getElementById('aboutSubtitle');
      if (el) el.textContent = map.about_subtitle;
    }
    if (map.about_text) {
      const el = document.getElementById('aboutText');
      if (el) el.textContent = map.about_text;
    }
    if (map.about_feature1) {
      var el = document.getElementById('aboutFeature1');
      if (el) { el.textContent = map.about_feature1; el.dataset.loaded = '1'; }
    }
    if (map.about_feature2) {
      var el = document.getElementById('aboutFeature2');
      if (el) { el.textContent = map.about_feature2; el.dataset.loaded = '1'; }
    }
    if (map.about_feature3) {
      var el = document.getElementById('aboutFeature3');
      if (el) { el.textContent = map.about_feature3; el.dataset.loaded = '1'; }
    }
    if (map.about_feature4) {
      var el = document.getElementById('aboutFeature4');
      if (el) { el.textContent = map.about_feature4; el.dataset.loaded = '1'; }
    }
    if (map.gallery_title) {
      document.querySelectorAll('#galleryLabel, #galleryHeading').forEach(el => el.textContent = map.gallery_title);
    }
    if (map.gallery_subtitle) {
      const el = document.getElementById('gallerySubtitle');
      if (el) el.textContent = map.gallery_subtitle;
    }
    if (map.contact_title) {
      const el = document.getElementById('contactLabel');
      if (el) el.textContent = map.contact_title;
    }
    if (map.contact_subtitle) {
      const el = document.getElementById('contactSubtitle');
      if (el) el.textContent = map.contact_subtitle;
    }
    // Services section
    function renderIncludes(id, val) {
      var el = document.getElementById(id);
      if (el && val) {
        el.innerHTML = val.split('|').map(function(i) { return '<li>' + i.trim() + '</li>'; }).join('');
      }
    }
    if (map.services_section_label) {
      var el = document.getElementById('servicesLabel');
      if (el) el.textContent = map.services_section_label;
    }
    if (map.services_title) {
      var el = document.getElementById('servicesTitle');
      if (el) el.textContent = map.services_title;
    }
    if (map.services_subtitle) {
      var el = document.getElementById('servicesSubtitle');
      if (el) el.textContent = map.services_subtitle;
    }
    if (map.services_svc1_name) {
      var el = document.getElementById('svc1Name');
      if (el) el.textContent = map.services_svc1_name;
    }
    if (map.services_svc1_desc) {
      var el = document.getElementById('svc1Desc');
      if (el) el.textContent = map.services_svc1_desc;
    }
    renderIncludes('svc1Includes', map.services_svc1_includes);
    if (map.services_svc2_name) {
      var el = document.getElementById('svc2Name');
      if (el) el.textContent = map.services_svc2_name;
    }
    if (map.services_svc2_desc) {
      var el = document.getElementById('svc2Desc');
      if (el) el.textContent = map.services_svc2_desc;
    }
    renderIncludes('svc2Includes', map.services_svc2_includes);
    if (map.services_svc2_badge) {
      var el = document.getElementById('svc2Badge');
      if (el) el.textContent = map.services_svc2_badge;
    }
    if (map.services_svc3_name) {
      var el = document.getElementById('svc3Name');
      if (el) el.textContent = map.services_svc3_name;
    }
    if (map.services_svc3_desc) {
      var el = document.getElementById('svc3Desc');
      if (el) el.textContent = map.services_svc3_desc;
    }
    renderIncludes('svc3Includes', map.services_svc3_includes);
    if (map.services_svc4_name) {
      var el = document.getElementById('svc4Name');
      if (el) el.textContent = map.services_svc4_name;
    }
    if (map.services_svc4_desc) {
      var el = document.getElementById('svc4Desc');
      if (el) el.textContent = map.services_svc4_desc;
    }
    renderIncludes('svc4Includes', map.services_svc4_includes);
    // Populate service dropdown
    if (map.services_dropdown_options) {
      var sel = document.getElementById('serviceSelect');
      if (sel) {
        var label = map.services_dropdown_label || 'Select a Service';
        var opts = map.services_dropdown_options.split('|');
        sel.innerHTML = '<option value="" disabled selected>' + label + '</option>';
        opts.forEach(function(o) {
          var opt = document.createElement('option');
          opt.textContent = o.trim();
          sel.appendChild(opt);
        });
      }
    }
    // Update time slots
    if (map.general_time_slots) {
      timeSlots = map.general_time_slots.split('|').map(function(t) { return t.trim(); });
      if (typeof populateTimes === 'function') {
        var booked = [];
        var date = document.getElementById('bookingDate');
        if (date && date.value) {
          fetch('/api/availability.php?date=' + date.value)
            .then(function(r) { return r.json(); })
            .then(function(b) { populateTimes(b); })
            .catch(function() { populateTimes(); });
        } else {
          populateTimes();
        }
      }
    }
    console.log('Content map:', map);
  })
  .catch(function(err) {
    console.error('Content fetch error:', err);
    var dbg = document.getElementById('debugContent');
    if (!dbg) {
      dbg = document.createElement('div');
      dbg.id = 'debugContent';
      dbg.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:red;color:#fff;padding:10px;z-index:9999';
      document.body.appendChild(dbg);
    }
    dbg.textContent = 'Content API error: ' + err.message;
  });

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

var timeSlots = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'];
function to24h(t) {
  var s = t.trim().toUpperCase();
  var isPM = s.includes('PM');
  var isAM = s.includes('AM');
  var parts = s.replace(/[AP]M/g, '').trim().split(':');
  var h = parseInt(parts[0]);
  var m = parts[1] || '00';
  if (isPM && h !== 12) h += 12;
  if (isAM && h === 12) h = 0;
  return String(h).padStart(2, '0') + ':' + m;
}

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
        const booked = bookedTimes || [];
        timeSlots.forEach(t => {
            const opt = document.createElement('option');
            opt.value = to24h(t);
            if (booked.includes(opt.value)) {
                opt.disabled = true;
                opt.textContent = t + ' (Booked)';
            } else {
                opt.textContent = t;
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
