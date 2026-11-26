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
      : link.dataset.book;
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
