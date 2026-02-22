const SUPABASE_URL = "https://hjddoowasowebcndcvjp.supabase.co";
const SUPABASE_KEY = "sb_publishable_JO3FWhlIRY67V-4ISf5bSg_k-nN5kOI";

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

// ======================
// SEND HILSEN TIL DATABASE
// ======================

async function sendGreeting(name, message) {
  await fetch(`${SUPABASE_URL}/rest/v1/greetings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "return=minimal"
    },
    body: JSON.stringify([{ name, message }])
  });
}

// ===== GJESTEBOK =====
const gbSend = document.getElementById("gbSend");
const gbName = document.getElementById("gbName");
const gbMsg = document.getElementById("gbMsg");
const gbStatus = document.getElementById("gbStatus");
const gbList = document.getElementById("gbList");

async function sendGreeting(name, message) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/greetings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify([{ name, message }]),
  });

  if (!res.ok) throw new Error("Kunne ikke lagre");
}

gbSend?.addEventListener("click", async () => {
  const name = gbName.value.trim();
  const message = gbMsg.value.trim();
  if (!message) return;

  gbStatus.textContent = "Sender...";
  try {
    await sendGreeting(name, message);
    gbStatus.textContent = "Lagret! 💚";
    gbMsg.value = "";
    await loadGreetings();
  } catch (e) {
    gbStatus.textContent = "Feil 😭";
  }
});

async function loadGreetings() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/greetings?select=*&order=created_at.desc`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!res.ok) {
    gbList.innerHTML = "Klarte ikke laste hilsener 😭";
    return;
  }

  const data = await res.json();
  gbList.innerHTML = data
    .map((g) => {
      const who = (g.name && g.name.trim()) ? g.name.trim() : "Anonym";
      return `<details class="note"><summary>Fra ${who}</summary><p>${g.message}</p></details>`;
    })
    .join("");
}

loadGreetings();

// ===== BILDE-OPPLASTING =====

const BUCKET = "bilder";

const imgName = document.getElementById("imgName");
const imgFiles = document.getElementById("imgFiles");
const imgUpload = document.getElementById("imgUpload");
const imgStatus = document.getElementById("imgStatus");
const imgGallery = document.getElementById("imgGallery");

function makeFilePath(file) {
  const ext = file.name.split(".").pop();
  return `uploads/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
}

function publicUrl(path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function uploadFile(path, file) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": file.type
    },
    body: file
  });

  if (!res.ok) throw new Error("Upload failed");
}

async function insertImageRow(path, name) {
  const periode = document.getElementById("imgPeriode").value;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/bilder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "return=minimal"
    },
    body: JSON.stringify([{ path, name, periode }])
  });

  if (!res.ok) throw new Error("DB insert failed");
}

async function loadImages() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/bilder?select=*&order=created_at.desc`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!res.ok) {
    imgStatus.textContent = "Klarte ikke laste bilder 😭";
    return;
  }

  const data = await res.json();

  // Tøm alle dynamiske gallerier først
  document.querySelectorAll('[id^="gallery-"]').forEach(g => {
    g.querySelectorAll('[data-dyn="1"]').forEach(el => el.remove());
  });

  data.forEach(row => {
    const url = publicUrl(row.path);
    const who = row.name ? `— ${row.name}` : "";

    const year = row.periode || "2025"; //fallback
    const gallery = document.getElementById(`gallery-${year}`);
    if (!gallery) return;

    const figure = document.createElement("figure");
    figure.className = "polaroid";
    figure.setAttribute("data-dyn", "1");
    figure.style.transform = "none";

    figure.innerHTML = `
      <img src="${url}" />
      <figcaption>${who}</figcaption>
    `;

    gallery.prepend(figure);
  });
}

imgUpload?.addEventListener("click", async () => {
  const files = Array.from(imgFiles.files || []);
  if (!files.length) return;

  imgStatus.textContent = "Laster opp...";

  try {
    for (const file of files) {
      const path = makeFilePath(file);
      await uploadFile(path, file);
      await insertImageRow(path, imgName.value.trim());
    }

    imgStatus.textContent = "Ferdig! 📸";
    imgFiles.value = "";
    loadImages();

  } catch (err) {
    imgStatus.textContent = "Feil ved opplasting 😭";
  }
});

loadImages();


// ===== BUCKET LIST (REST) =====

async function fetchBucketItems() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/bucket_items?select=*&order=created_at.asc`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) throw new Error("Kunne ikke hente bucket items");
  return await res.json();
}

function clearDynamicItems(ul) {
  // fjerner bare de vi selv har lagt inn fra DB, ikke dine originale
  ul.querySelectorAll('li[data-dyn="1"]').forEach(li => li.remove());
}

async function loadBucketItems() {
  try {
    const data = await fetchBucketItems();

    const ulS = document.getElementById("bucket-sivert");
    const ulA = document.getElementById("bucket-annmarie");
    if (!ulS || !ulA) return;

    clearDynamicItems(ulS);
    clearDynamicItems(ulA);

    data.forEach((item) => {
      const ul = item.list === "sivert" ? ulS : ulA;

      const li = document.createElement("li");
      li.setAttribute("data-dyn", "1");
      li.innerHTML = `<label><input type="checkbox" disabled> ${item.text}</label>`;
      ul.appendChild(li);
    });
  } catch (e) {
    console.error(e);
  }
}

async function addBucketItem(listName, inputId, ulId) {
  const input = document.getElementById(inputId);
  const text = (input?.value || "").trim();
  if (!text) return;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/bucket_items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify([{ list: listName, text }]),
  });

  if (!res.ok) {
    console.error("Kunne ikke lagre bucket item");
    return;
  }

  input.value = "";
  await loadBucketItems();
}

// last inn ved oppstart
loadBucketItems();