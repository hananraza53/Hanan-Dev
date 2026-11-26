(() => {
  const dialog = document.getElementById('certificate-dialog');
  const body = dialog.querySelector('.certificate-pages');
  const files = {
    dism: { title: 'DISM Certificate — APTECH', pdf: 'Muhammad-Hanan-Raza-DISM-Certificate-Enhanced.pdf', image: 'images/certificates/dism-1.png' },
    techwiz: { title: 'TechWiz 5 — Certificate of Participation', pdf: 'Techwiz Certificate.pdf', image: 'images/certificates/techwiz-1.png' }
  };
  let trigger, motion, closing = false;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animate(out) {
    motion?.cancel();
    const start = trigger.getBoundingClientRect(), end = dialog.getBoundingClientRect();
    const small = { opacity: 0, transform: `translate(${start.left + start.width / 2 - end.left - end.width / 2}px, ${start.top + start.height / 2 - end.top - end.height / 2}px) scale(.18)` };
    motion = dialog.animate(out ? [{ opacity: 1, transform: 'none' }, small] : [small, { opacity: 1, transform: 'none' }], { duration: reduced() ? 0 : out ? 220 : 380, easing: 'cubic-bezier(.2,.75,.25,1)' });
    return motion;
  }
  function close() {
    if (closing || !dialog.open) return;
    closing = true;
    animate(true).onfinish = () => dialog.close();
  }
  document.querySelectorAll('[data-certificate]').forEach(button => button.addEventListener('click', () => {
    const certificate = files[button.dataset.certificate];
    if (!dialog.showModal) { window.open(certificate.pdf, '_blank', 'noopener'); return; }
    trigger = button;
    document.getElementById('certificate-title').textContent = certificate.title;
    document.getElementById('certificate-download').href = certificate.pdf;
    const image = new Image();
    image.alt = certificate.title;
    if (button.dataset.certificate === 'techwiz') {
  image.addEventListener('load', () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalHeight;
    canvas.height = image.naturalWidth;

    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(image, 0, 0);
    image.src = canvas.toDataURL('image/png');
  }, { once: true });
}
    image.src = certificate.image;
    body.replaceChildren(image);
    closing = false;
    dialog.showModal();
    body.scrollTop = 0;
    animate(false);
  }));
  dialog.querySelector('button').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
  });
  dialog.addEventListener('close', () => { motion?.cancel(); trigger?.focus({ preventScroll: true }); });
})();
