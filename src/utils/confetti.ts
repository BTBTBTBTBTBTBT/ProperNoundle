export function triggerConfetti() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
  `;

  document.body.appendChild(overlay);

  const colors = ['#10b981', '#3b82f6', '#f59e0b'];

  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      createFloatingParticle(overlay, colors[i % colors.length]);
    }, i * 80);
  }

  setTimeout(() => {
    overlay.remove();
  }, 2000);
}

function createFloatingParticle(container: HTMLElement, color: string) {
  const particle = document.createElement('div');
  const startX = Math.random() * 100;

  particle.style.cssText = `
    position: absolute;
    left: ${startX}%;
    bottom: -10%;
    width: 6px;
    height: 6px;
    background-color: ${color};
    border-radius: 50%;
    opacity: 0;
    animation: floatUp 1.5s ease-out forwards;
  `;

  container.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 1500);
}

export function triggerCameraFlash() {
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
    opacity: 0;
    pointer-events: none;
    z-index: 9998;
    transition: opacity 0.3s ease-out;
  `;

  document.body.appendChild(flash);

  setTimeout(() => {
    flash.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    flash.style.opacity = '0';
  }, 300);

  setTimeout(() => {
    flash.remove();
  }, 600);
}
