const root = document.documentElement;
const themeButton = document.querySelector('#theme-toggle');
function updateThemeLabel() {
  const dark = root.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  themeButton.querySelector('.theme-label').textContent = dark ? 'Light mode' : 'Dark mode';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#1a3442' : '#eaf3f7';
}
themeButton.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('damla-theme', root.dataset.theme); } catch {}
  updateThemeLabel();
});
updateThemeLabel();
const page = document.querySelector('.page');
const board = document.querySelector('.circuit-board');
const sections = [...document.querySelectorAll('.sections > section')];
const pins = [...document.querySelectorAll('.portrait-pins span')];
let selected = null;
const paths = sections.map(() => {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.classList.add('circuit-trace');
  board.append(path);
  return path;
});
function drawConnections() {
  const origin = page.getBoundingClientRect();
  const intro = document.querySelector('.intro').getBoundingClientRect();
  const portrait = document.querySelector('.portrait').getBoundingClientRect();
  const mobile = matchMedia('(max-width: 600px)').matches;
  sections.forEach((section, i) => {
    const source = pins[i].getBoundingClientRect();
    const target = section.querySelector('.heading-pin').getBoundingClientRect();
    const sx = source.left + source.width / 2 - origin.left;
    const sy = source.bottom - origin.top;
    const tx = target.left + target.width / 2 - origin.left;
    const ty = target.top + target.height / 2 - origin.top;
    const lane = tx - 9 - i * 4;
    const crossY = intro.bottom - origin.top + 16 + i * 6;
    if (mobile) {
      paths[i].setAttribute('d', `M${sx},${sy} V${crossY - 6} L${sx - 6},${crossY} H${lane + 6} L${lane},${crossY + 6} V${ty - 6} L${lane + 6},${ty} H${tx}`);
    } else {
      const outer = portrait.right - origin.left + 12 + i * 5;
      const exit = sy + 10 + i * 5;
      paths[i].setAttribute('d', `M${sx},${sy} V${exit} H${outer - 6} L${outer},${exit + 6} V${crossY - 6} L${outer - 6},${crossY} H${lane + 6} L${lane},${crossY + 6} V${ty - 6} L${lane + 6},${ty} H${tx}`);
    }
  });
}
function activate(section, updateURL = true) {
  selected = section;
  sections.forEach((item, i) => {
    const active = item === selected;
    item.classList.toggle('connected', active);
    item.querySelector('.section-toggle').setAttribute('aria-expanded', String(active));
    item.querySelector('.toggle-mark').textContent = active ? '−' : '+';
    item.querySelector('.section-content').hidden = !active;
    paths[i].classList.toggle('is-lit', active);
  });
  if (updateURL) history.replaceState(null, '', selected ? `#${selected.id}` : location.pathname + location.search);
  drawConnections();
}
sections.forEach(section => section.querySelector('.section-toggle').addEventListener('click', () => {
  activate(selected === section ? null : section);
}));
function followHash() {
  activate(sections.find(section => `#${section.id}` === location.hash) || null, false);
}
window.addEventListener('hashchange', followHash);
window.addEventListener('resize', drawConnections);
document.querySelector('.portrait img').addEventListener('load', drawConnections);
new ResizeObserver(drawConnections).observe(page);
followHash();
