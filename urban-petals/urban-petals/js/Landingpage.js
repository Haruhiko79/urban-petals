
  /* ── Floating leaves ── */
  const leafColors = ['#2e5f2e','#4a8a4a','#8fbc6a','#3a7a3a','#5a9a5a'];
  for (let i = 0; i < 18; i++) {
    const l = document.createElement('div');
    l.className = 'leaf';
    const size = 16 + Math.random() * 36;
    const color = leafColors[Math.floor(Math.random() * leafColors.length)];
    const dur = 12 + Math.random() * 18;
    const delay = Math.random() * -20;
    Object.assign(l.style, {
      width: size + 'px',
      height: size * 0.6 + 'px',
      left: Math.random() * 100 + '%',
      bottom: '-10%',
      background: color,
      animationDuration: dur + 's',
      animationDelay: delay + 's',
      opacity: 0,
    });
    document.querySelector('.scene').appendChild(l);
  }

  /* ── Navigate with fade ── */
  function navigate() {
    const overlay = document.getElementById('fadeOverlay');
    overlay.classList.add('active');
    setTimeout(() => { window.location.href = 'Homepage.html'; }, 700);
  }

  /* ── CTA click ── */
  document.getElementById('enterBtn').addEventListener('click', function(e) {
    e.preventDefault();
    navigate();
  });