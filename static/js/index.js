window.HELP_IMPROVE_VIDEOJS = false;

function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function() {
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (scrollButton) scrollButton.classList.toggle('visible', window.pageYOffset > 300);
});

function setupVideoAutoplay() {
    const videos = document.querySelectorAll('video[data-autoplay]');
    if (!videos.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.play().catch(() => {});
            } else {
                entry.target.pause();
            }
        });
    }, { threshold: 0.4 });
    videos.forEach(v => observer.observe(v));
}

function setupHeroScroller() {
    const scroller = document.getElementById('heroScroller');
    if (!scroller) return;
    const slides = Array.from(scroller.querySelectorAll('.hero-slide'));
    const prev = document.querySelector('.scroller-arrow.prev');
    const next = document.querySelector('.scroller-arrow.next');
    const dots = Array.from(document.querySelectorAll('#heroDots .dot'));

    function current() {
        return Math.round(scroller.scrollLeft / scroller.clientWidth);
    }
    function go(i) {
        const idx = Math.max(0, Math.min(slides.length - 1, i));
        scroller.scrollTo({ left: idx * scroller.clientWidth, behavior: 'smooth' });
    }
    if (prev) prev.addEventListener('click', () => go(current() - 1));
    if (next) next.addEventListener('click', () => go(current() + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));

    let raf = null;
    scroller.addEventListener('scroll', () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
            const c = current();
            dots.forEach((d, i) => d.classList.toggle('active', i === c));
            raf = null;
        });
    });
}

$(document).ready(function() {
    setupHeroScroller();
    setupVideoAutoplay();
});
