// Bytte mellom "sider" (seksjoner)
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const targetId = btn.dataset.target;
    panels.forEach((p) => p.classList.toggle("show", p.id === targetId));
  });
});

// Bucket list – felles funksjon
function addItem(bucketId, inputId) {
  const input = document.getElementById(inputId);
  const text = input.value.trim();
  if (!text) return;

  const ul = document.getElementById(bucketId);
  const li = document.createElement("li");
  li.innerHTML = `<label><input type="checkbox"> ${text}</label>`;

  ul.appendChild(li);
  input.value = "";
  input.focus();
}

// Pump check: bytte år (2023/2024/2025/2026)
const yearButtons = document.querySelectorAll(".year");
const yearPanels = document.querySelectorAll(".yearpanel");

yearButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    yearButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const target = btn.dataset.year;
    yearPanels.forEach((p) => p.classList.toggle("show", p.id === target));
  });
});

document.querySelectorAll(".cardlink").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.jump;
    document.querySelector(`.tab[data-target="${target}"]`)?.click();
  });
});
