const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
const compactHeader = window.matchMedia('(max-width: 64rem)');

function updateHeaderHeight() {
  const condensed = header.classList.contains('is-condensed');
  header.classList.toggle('is-condensed', window.scrollY > (condensed ? 12 : 48));
}

window.addEventListener('scroll', updateHeaderHeight, { passive: true });
updateHeaderHeight();

function setMenuOpen(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.hidden = compactHeader.matches && !open;
}

function updateHeader() {
  const restoreFocus = compactHeader.matches && navigation.contains(document.activeElement);
  menuButton.hidden = !compactHeader.matches;
  setMenuOpen(false);

  if (restoreFocus) {
    menuButton.focus();
  }
}

menuButton.addEventListener('click', () => {
  setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
});

navigation.addEventListener('click', (event) => {
  if (compactHeader.matches && event.target.closest('a')) {
    menuButton.focus({ preventScroll: true });
    setMenuOpen(false);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    menuButton.focus();
    setMenuOpen(false);
  }
});

compactHeader.addEventListener('change', updateHeader);
updateHeader();

const bookingDialog = document.querySelector('#booking-dialog');
const bookingService = bookingDialog.querySelector('.booking-service');
const bookingForm = bookingDialog.querySelector('.booking-form');
const bookingStatus = bookingDialog.querySelector('.booking-status');
const nameField = bookingForm.elements.namedItem('name');
const phoneField = bookingForm.elements.namedItem('phone');

for (const link of document.querySelectorAll('[data-book]')) {
  link.addEventListener('click', (event) => {
    if (typeof bookingDialog.showModal !== 'function') {
      return;
    }

    event.preventDefault();
    const service = link.dataset.book === 'service'
      ? link.closest('.service-card').querySelector('h3').textContent
      : '';
    bookingService.textContent = service;
    bookingService.hidden = !service;
    bookingDialog.showModal();
    nameField.focus();
  });
}

bookingForm.addEventListener('input', () => {
  nameField.setCustomValidity('');
  phoneField.setCustomValidity('');
  bookingStatus.textContent = '';
});

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!nameField.value.trim()) {
    nameField.setCustomValidity('Укажите имя.');
    nameField.reportValidity();
    return;
  }

  const digits = phoneField.value.replace(/\D/g, '');
  const phoneCharacters = /^\+?[0-9\s().-]+$/;

  if (!phoneCharacters.test(phoneField.value.trim()) || digits.length < 10 || digits.length > 15) {
    phoneField.setCustomValidity('Проверьте номер телефона. В нём должно быть от 10 до 15 цифр.');
    phoneField.reportValidity();
    return;
  }

  bookingForm.reset();
  bookingStatus.textContent = 'Форма заполнена верно. Это демонстрационная запись.';
});

bookingDialog.addEventListener('close', () => {
  bookingForm.reset();
  nameField.setCustomValidity('');
  phoneField.setCustomValidity('');
  bookingStatus.textContent = '';
});

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

const reviews = document.querySelector('.reviews-slider');
const reviewList = reviews.querySelector('.review-list');
const reviewSlides = [...reviews.querySelectorAll('.review')];
const reviewTools = reviews.querySelector('.review-tools');
const reviewToggle = reviews.querySelector('.reviews-all');
const reviewArrows = reviews.querySelector('.review-arrows');
const reviewStatus = reviews.querySelector('.review-status');
let activeReview = 0;
let reviewAnimations = [];

function renderReviews() {
  const showAll = reviewToggle.getAttribute('aria-expanded') === 'true';
  reviewList.classList.toggle('is-carousel', !showAll);
  reviewSlides.forEach((slide, index) => {
    slide.inert = !showAll && index !== activeReview;
  });
  reviewArrows.hidden = showAll;
}

for (const arrow of reviewArrows.querySelectorAll('[data-review-step]')) {
  arrow.addEventListener('click', () => {
    const outgoing = reviewSlides[activeReview];
    const step = Number(arrow.dataset.reviewStep);
    activeReview = (activeReview + step + reviewSlides.length) % reviewSlides.length;
    reviewAnimations.forEach(animation => animation.cancel());
    renderReviews();

    if (!reducedMotion.matches) {
      const incoming = reviewSlides[activeReview];
      const timing = { duration: 360, easing: 'ease' };
      reviewAnimations = [
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
    reviewStatus.textContent = `Отзыв ${activeReview + 1} из ${reviewSlides.length}`;
  });
}

reviewToggle.addEventListener('click', () => {
  reviewAnimations.forEach(animation => animation.cancel());
  const showAll = reviewToggle.getAttribute('aria-expanded') !== 'true';
  reviewToggle.setAttribute('aria-expanded', String(showAll));
  reviewToggle.firstChild.textContent = showAll ? 'Свернуть отзывы ' : 'Все отзывы ';
  renderReviews();
});

renderReviews();
reviewTools.hidden = false;
