// ============================================================
// WASTE2WEALTH HUB — TypeScript Application Core  v1.0
// Global Waste Trading Marketplace · Local · African · International
// ============================================================
// ─────────────────── Utilities ───────────────────
const generateId = () => Math.random().toString(36).substring(2, 10).toUpperCase();
const formatCurrency = (amount, currency = 'NGN') => {
    const symbols = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', GHS: 'GH₵', KES: 'KES ', ZAR: 'R' };
    const sym = symbols[currency] || currency + ' ';
    return sym + amount.toLocaleString();
};
const formatDate = (date) => date.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
const debounce = (fn, delay) => {
    let timer;
    return ((...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    });
};
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
// ─────────────────── Navbar ───────────────────
class Navbar {
    constructor() {
        this.nav = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.navLinks = document.querySelector('.navbar-nav');
        this.navActions = document.querySelector('.navbar-actions');
        this.init();
    }
    init() {
        var _a;
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        (_a = this.hamburger) === null || _a === void 0 ? void 0 : _a.addEventListener('click', this.toggleMenu.bind(this));
        this.setActiveLink();
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar'))
                this.closeMenu();
        });
    }
    handleScroll() {
        var _a;
        (_a = this.nav) === null || _a === void 0 ? void 0 : _a.classList.toggle('scrolled', window.scrollY > 20);
    }
    toggleMenu() {
        var _a, _b;
        (_a = this.navLinks) === null || _a === void 0 ? void 0 : _a.classList.toggle('open');
        (_b = this.navActions) === null || _b === void 0 ? void 0 : _b.classList.toggle('open');
    }
    closeMenu() {
        var _a, _b;
        (_a = this.navLinks) === null || _a === void 0 ? void 0 : _a.classList.remove('open');
        (_b = this.navActions) === null || _b === void 0 ? void 0 : _b.classList.remove('open');
    }
    setActiveLink() {
        const current = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href') || '';
            if (href === current || (current === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
}
// ─────────────────── Form Validator ───────────────────
class FormValidator {
    static validateEmail(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }
    static validatePhone(v) {
        // Accepts Nigerian, African, and international formats
        return /^(\+?[1-9]\d{6,14})$/.test(v.replace(/[\s\-()]/g, ''));
    }
    static validatePassword(v) {
        return v.length >= 8;
    }
    static validateRequired(v) {
        return v.trim().length > 0;
    }
    static getPasswordStrength(password) {
        let score = 0;
        if (password.length >= 8)
            score++;
        if (password.length >= 12)
            score++;
        if (/[A-Z]/.test(password))
            score++;
        if (/[0-9]/.test(password))
            score++;
        if (/[^A-Za-z0-9]/.test(password))
            score++;
        const levels = [
            { label: 'Very Weak', color: '#ef4444' },
            { label: 'Weak', color: '#f59e0b' },
            { label: 'Fair', color: '#fbbf24' },
            { label: 'Good', color: '#059669' },
            { label: 'Strong', color: '#065f46' },
        ];
        return Object.assign({ score }, levels[clamp(score, 0, 4)]);
    }
    static validate(form) {
        const errors = {};
        form.querySelectorAll('[data-validate]').forEach(el => {
            const rules = (el.dataset.validate || '').split('|');
            const label = el.dataset.label || el.name || 'Field';
            const value = el.value;
            rules.forEach(rule => {
                if (rule === 'required' && !this.validateRequired(value))
                    errors[el.name] = label + ' is required';
                if (rule === 'email' && value && !this.validateEmail(value))
                    errors[el.name] = 'Enter a valid email address';
                if (rule === 'phone' && value && !this.validatePhone(value))
                    errors[el.name] = 'Enter a valid phone number (include country code)';
                if ((rule === 'password' || rule === 'min8') && value && !this.validatePassword(value))
                    errors[el.name] = 'Password must be at least 8 characters';
            });
        });
        return { isValid: Object.keys(errors).length === 0, errors };
    }
    static showErrors(form, errors) {
        var _a;
        form.querySelectorAll('.field-error').forEach(el => el.remove());
        form.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
        Object.entries(errors).forEach(([name, message]) => {
            var _a;
            const inp = form.querySelector('[name="' + name + '"]');
            if (!inp)
                return;
            inp.classList.add('error');
            const span = document.createElement('span');
            span.className = 'field-error';
            span.textContent = message;
            (_a = inp.parentElement) === null || _a === void 0 ? void 0 : _a.appendChild(span);
            inp.addEventListener('input', () => {
                inp.classList.remove('error');
                span.remove();
            }, { once: true });
        });
        (_a = (form.querySelector('.form-control.error'))) === null || _a === void 0 ? void 0 : _a.focus();
    }
    static clearErrors(form) {
        form.querySelectorAll('.field-error').forEach(el => el.remove());
        form.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
    }
}
// ─────────────────── Toast ───────────────────
class Toast {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }
    show(message, type = 'info', duration = 4500) {
        var _a;
        const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
        const toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.innerHTML =
            '<span class="toast-icon">' + icons[type] + '</span>' +
                '<span class="toast-msg">' + message + '</span>' +
                '<button class="toast-close" aria-label="Close">✕</button>';
        this.container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('toast-enter'));
        const close = () => {
            toast.classList.add('toast-exit');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        };
        (_a = toast.querySelector('.toast-close')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', close);
        setTimeout(close, duration);
    }
}
// ─────────────────── Scroll Animator ───────────────────
class ScrollAnimator {
    constructor() {
        this.observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
            .forEach(el => this.observer.observe(el));
    }
    refresh() {
        document.querySelectorAll('.reveal:not(.visible),.reveal-left:not(.visible),.reveal-right:not(.visible)')
            .forEach(el => this.observer.observe(el));
    }
}
// ─────────────────── Counter Animation ───────────────────
const animateCounter = (el, target, duration = 2000) => {
    const t0 = performance.now();
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const useSep = el.dataset.nosep === undefined;
    const fmt = (n) => (useSep ? n.toLocaleString() : String(n));
    const tick = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        const v = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        el.textContent = prefix + fmt(v) + suffix;
        if (p < 1)
            requestAnimationFrame(tick);
        else
            el.textContent = prefix + fmt(target) + suffix;
    };
    requestAnimationFrame(tick);
};
// ─────────────────── Nigerian States List ───────────────────
const NIGERIAN_STATES = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT – Abuja', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];
const AFRICAN_COUNTRIES = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Ethiopia', 'Tanzania',
    'Uganda', 'Morocco', 'Cameroon', 'Ivory Coast', 'Senegal', 'Niger', 'Zambia',
    'Zimbabwe', 'Mozambique', 'Angola', 'Mali', 'Burkina Faso', 'Rwanda',
    'Benin', 'Sierra Leone', 'Togo', 'Libya', 'Tunisia', 'Algeria', 'Sudan',
    'Somalia', 'Botswana', 'Namibia', 'Gabon', 'Liberia', 'Guinea', 'Chad'
];
const WASTE_CATEGORIES = {
    domestic: { label: 'Domestic / Household', icon: '🏠', color: '#065f46' },
    industrial: { label: 'Industrial Waste', icon: '🏭', color: '#0369a1' },
    ewaste: { label: 'Electronic (E-Waste)', icon: '💻', color: '#5b21b6' },
    agricultural: { label: 'Agricultural Waste', icon: '🌾', color: '#92400e' },
    medical: { label: 'Medical / Healthcare', icon: '🏥', color: '#9f1239' },
    construction: { label: 'Construction & Demolition', icon: '🏗', color: '#78350f' },
    plastic: { label: 'Plastic / Polymer', icon: '♳', color: '#0e7490' },
    metal: { label: 'Metal / Scrap Metal', icon: '⚙', color: '#374151' },
    paper: { label: 'Paper / Cardboard', icon: '📦', color: '#a16207' },
    textile: { label: 'Textile / Fabric', icon: '🧵', color: '#be185d' },
};
// ─────────────────── States Grid Injector ───────────────────
const injectStatesGrid = (containerId) => {
    const grid = document.getElementById(containerId);
    if (!grid)
        return;
    NIGERIAN_STATES.forEach(state => {
        const pill = document.createElement('div');
        pill.className = 'location-pill';
        pill.textContent = '📍 ' + state;
        pill.addEventListener('click', () => {
            window['_toast'] &&
                window['_toast'].show(state + ' · Listings available', 'info');
        });
        grid.appendChild(pill);
    });
};
const injectCountriesGrid = (containerId) => {
    const grid = document.getElementById(containerId);
    if (!grid)
        return;
    AFRICAN_COUNTRIES.forEach(country => {
        const pill = document.createElement('div');
        pill.className = 'location-pill';
        pill.textContent = '🌍 ' + country;
        pill.addEventListener('click', () => {
            window['_toast'] &&
                window['_toast'].show(country + ' · Market active', 'info');
        });
        grid.appendChild(pill);
    });
};
// ─────────────────── DOM Init ───────────────────
document.addEventListener('DOMContentLoaded', () => {
    new Navbar();
    new ScrollAnimator();
    // Inject shared utility styles
    const style = document.createElement('style');
    style.textContent = [
        '.toast-container{position:fixed;bottom:28px;right:28px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;}',
        '.toast{display:flex;align-items:center;gap:10px;padding:14px 18px;border-radius:12px;background:#fff;',
        'box-shadow:0 10px 40px rgba(6,78,59,.22);font-size:.9rem;font-weight:500;min-width:290px;max-width:390px;',
        'pointer-events:all;opacity:0;transform:translateX(40px);transition:opacity .35s,transform .35s;}',
        '.toast.toast-enter{opacity:1;transform:none;}',
        '.toast.toast-exit{opacity:0;transform:translateX(40px);}',
        '.toast-success{border-left:4px solid #059669;}',
        '.toast-error{border-left:4px solid #ef4444;}',
        '.toast-info{border-left:4px solid #065f46;}',
        '.toast-warning{border-left:4px solid #d97706;}',
        '.toast-icon{font-size:1rem;font-weight:800;flex-shrink:0;}',
        '.toast-success .toast-icon{color:#059669;}.toast-error .toast-icon{color:#ef4444;}',
        '.toast-info .toast-icon{color:#065f46;}.toast-warning .toast-icon{color:#d97706;}',
        '.toast-msg{flex:1;}.toast-close{background:none;border:none;color:#6b7280;font-size:.85rem;cursor:pointer;padding:2px;margin-left:4px;}',
        '.toast-close:hover{color:#065f46;}',
        '.form-control.error{border-color:#ef4444!important;box-shadow:0 0 0 4px rgba(239,68,68,.14)!important;}',
        '.field-error{display:block;color:#ef4444;font-size:.78rem;margin-top:4px;font-weight:600;}',
    ].join('');
    document.head.appendChild(style);
    // Animate counters on scroll
    const counters = document.querySelectorAll('[data-counter]');
    if (counters.length) {
        const co = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const el = e.target;
                    animateCounter(el, parseInt(el.dataset.counter || '0', 10));
                    co.unobserve(el);
                }
            });
        }, { threshold: 0.4 });
        counters.forEach(el => co.observe(el));
    }
    // Password strength meter
    const pwInput = document.querySelector('#password');
    const pwSegs = document.querySelectorAll('.pw-strength-seg');
    const pwLabel = document.querySelector('.pw-strength-label');
    if (pwInput) {
        pwInput.addEventListener('input', () => {
            const { score, label, color } = FormValidator.getPasswordStrength(pwInput.value);
            pwSegs.forEach((seg, i) => { seg.style.background = i < score ? color : 'var(--border)'; });
            if (pwLabel) {
                pwLabel.textContent = label;
                pwLabel.style.color = color;
            }
        });
    }
    // Password visibility toggle
    document.querySelectorAll('[data-toggle-pw]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.togglePw || '';
            const input = document.getElementById(targetId);
            if (!input)
                return;
            const isText = input.type === 'text';
            input.type = isText ? 'password' : 'text';
            btn.textContent = isText ? '👁' : '🙈';
        });
    });
    // Inject state grids
    injectStatesGrid('statesGrid');
    injectCountriesGrid('africanGrid');
    // Expose to inline scripts
    const g = window;
    g._toast = new Toast();
    g.FormValidator = FormValidator;
    g.debounce = debounce;
    g.generateId = generateId;
    g.formatDate = formatDate;
    g.formatCurrency = formatCurrency;
    g.animateCounter = animateCounter;
    g.NIGERIAN_STATES = NIGERIAN_STATES;
    g.AFRICAN_COUNTRIES = AFRICAN_COUNTRIES;
    g.WASTE_CATEGORIES = WASTE_CATEGORIES;
    g.injectStatesGrid = injectStatesGrid;
    g.injectCountriesGrid = injectCountriesGrid;
});
