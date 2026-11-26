const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const doctorSlider = document.querySelector('.doctor-slider');
const doctorViewport = doctorSlider.querySelector('.doctor-viewport');
const doctorGrid = doctorSlider.querySelector('.doctor-grid');
const doctorCards = [...doctorGrid.querySelectorAll('.doctor-card')];
const doctorArrows = doctorSlider.querySelector('.doctor-arrows');
const [previousDoctor, nextDoctor] = doctorArrows.querySelectorAll('button');
const doctorStatus = doctorSlider.querySelector('.doctor-status');
let firstDoctor = 0;

function renderDoctors(step = 0) {
  const visible = Number(getComputedStyle(doctorGrid).getPropertyValue('--doctor-visible'));
  const lastStart = Math.max(0, doctorCards.length - visible);
  firstDoctor = Math.min(lastStart, Math.max(0, firstDoctor + step));
  const offset = doctorCards[firstDoctor].getBoundingClientRect().left - doctorGrid.getBoundingClientRect().left;

  doctorGrid.classList.toggle('is-moving', step !== 0);
  doctorGrid.style.setProperty('--doctor-offset', `${-offset}px`);
  previousDoctor.setAttribute('aria-disabled', String(firstDoctor === 0));
  nextDoctor.setAttribute('aria-disabled', String(firstDoctor === lastStart));
  doctorCards.forEach((card, index) => {
    card.inert = index < firstDoctor || index >= firstDoctor + visible;
  });
  if (step) {
    doctorStatus.textContent = `Врачи ${firstDoctor + 1}–${Math.min(firstDoctor + visible, doctorCards.length)} из ${doctorCards.length}`;
  }
}

previousDoctor.addEventListener('click', () => {
  if (previousDoctor.getAttribute('aria-disabled') !== 'true') renderDoctors(-1);
});
nextDoctor.addEventListener('click', () => {
  if (nextDoctor.getAttribute('aria-disabled') !== 'true') renderDoctors(1);
});

doctorSlider.classList.add('is-ready');
doctorArrows.hidden = false;
renderDoctors();
new ResizeObserver(() => renderDoctors()).observe(doctorViewport);

function createCarousel(list, arrows, status, label) {
  const slides = [...list.children];
  let activeSlide = 0;
  let animations = [];

  function render(showAll = false) {
    animations.forEach(animation => animation.cancel());
    animations = [];
    list.classList.toggle('is-carousel', !showAll);
    slides.forEach((slide, index) => {
      slide.inert = !showAll && index !== activeSlide;
    });
    arrows.hidden = showAll;
  }

  for (const arrow of arrows.querySelectorAll('[data-slide-step]')) {
    arrow.addEventListener('click', () => {
      const outgoing = slides[activeSlide];
      const step = Number(arrow.dataset.slideStep);
      activeSlide = (activeSlide + step + slides.length) % slides.length;
      render();

      if (!reducedMotion.matches) {
        const incoming = slides[activeSlide];
        const timing = { duration: 360, easing: 'ease' };
        animations = [
          outgoing.animate([
            { transform: 'translateX(0)', visibility: 'visible' },
            { transform: `translateX(${-step * 100}%)`, visibility: 'visible' },
          ], timing),
          incoming.animate([
            { transform: `translateX(${step * 100}%)` },
            { transform: 'translateX(0)' },
          ], timing),
        ];
      }
      status.textContent = `${label} ${activeSlide + 1} из ${slides.length}`;
    });
  }

  render();
  return render;
}

const technologies = document.querySelector('.technology-slider');
createCarousel(
  technologies.querySelector('.technology-slides'),
  technologies.querySelector('.technology-arrows'),
  technologies.querySelector('.technology-status'),
  'Оборудование'
);

const reviews = document.querySelector('.reviews-slider');
const reviewTools = reviews.querySelector('.review-tools');
const reviewToggle = reviews.querySelector('.reviews-all');
const renderReviews = createCarousel(
  reviews.querySelector('.review-list'),
  reviews.querySelector('.review-arrows'),
  reviews.querySelector('.review-status'),
  'Отзыв'
);

reviewToggle.addEventListener('click', () => {
  const showAll = reviewToggle.getAttribute('aria-expanded') !== 'true';
  reviewToggle.setAttribute('aria-expanded', String(showAll));
  reviewToggle.firstChild.textContent = showAll ? 'Свернуть отзывы ' : 'Все отзывы ';
  renderReviews(showAll);
});

reviewTools.hidden = false;

const faq = document.querySelector('.faq');
const faqQuestions = faq.querySelector('.faq-questions');
const faqPanels = [...faq.querySelectorAll('.faq-panel')];
let activeQuestion = 0;

const faqButtons = faqPanels.map((panel, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button faq-button';
  button.id = `${panel.id}-button`;
  button.textContent = panel.querySelector('h3').textContent;
  button.setAttribute('aria-controls', panel.id);
  panel.setAttribute('aria-labelledby', button.id);
  button.addEventListener('click', () => {
    activeQuestion = activeQuestion === index ? -1 : index;
    renderFaq();
    revealFaqButton(button);
  });
  return button;
});

function renderFaq() {
  faqPanels.forEach((panel, index) => {
    const open = index === activeQuestion;
    faqButtons[index].setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    panel.inert = !open;
  });
}

function revealFaqButton(button) {
  const rail = faqQuestions.getBoundingClientRect();
  const bounds = button.getBoundingClientRect();
  const left = Math.min(0, bounds.left - rail.left) + Math.max(0, bounds.right - rail.right);
  if (left) faqQuestions.scrollBy({ left, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}

faqQuestions.append(...faqButtons);
faqQuestions.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

  const index = faqButtons.indexOf(event.target);
  const step = event.key === 'ArrowRight' ? 1 : -1;
  event.preventDefault();
  const button = faqButtons[(index + step + faqButtons.length) % faqButtons.length];
  button.focus({ preventScroll: true });
  revealFaqButton(button);
});

renderFaq();
faq.classList.add('is-ready');
faqQuestions.hidden = false;
