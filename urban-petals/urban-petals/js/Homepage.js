// Homepage-specific JS — nav.js handles auth, cart, toast, mobile menu
document.addEventListener('DOMContentLoaded', () => {
  // Carousel
  const slides = document.querySelectorAll('.slide');
  const track = document.getElementById('slidesTrack');
  const dotsRow = document.getElementById('dotsRow');
  const ghostL = document.getElementById('ghostLeftImg');
  const ghostR = document.getElementById('ghostRightImg');
  if (!slides.length || !track) return;

  let cur = 0;

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.onclick = () => goTo(i);
    dotsRow.appendChild(d);
  });

  function goTo(n) {
    cur = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${cur * 100}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === cur));
    const prev = (cur - 1 + slides.length) % slides.length;
    const next = (cur + 1) % slides.length;
    if (ghostL) ghostL.src = slides[prev].querySelector('img').src;
    if (ghostR) ghostR.src = slides[next].querySelector('img').src;
  }

  window.prevSlide = () => goTo(cur - 1);
  window.nextSlide = () => goTo(cur + 1);

  setInterval(() => goTo(cur + 1), 5000);
  goTo(0);
});
