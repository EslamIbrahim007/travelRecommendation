const API_PATH = "./travel_recommendation_api.json";

let apiData = null;

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");

const resultsEl = document.getElementById("results");
const msgEl = document.getElementById("messageBox");
const resultCountEl = document.getElementById("resultCount");

function showMsg(text) {
  msgEl.textContent = text;
  msgEl.classList.add("show");
}

function hideMsg() {
  msgEl.classList.remove("show");
  msgEl.textContent = "";
}

function clearResults() {
  resultsEl.innerHTML = "";
  resultCountEl.textContent = "0 results";
  hideMsg();
}

function normalize(str) {
  return (str || "").trim().toLowerCase();
}

function isKeyword(q, base) {
  // beach/beaches, temple/temples, country/countries
  return q === base || q === `${base}s`;
}

function escapeHTML(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCard(item) {
  const name = escapeHTML(item.name);
  const description = escapeHTML(item.description);
  const imageUrl = escapeHTML(item.imageUrl);

  return `
    <div class="card">
      <img src="${imageUrl}" alt="${name}" onerror="this.style.display='none';" />
      <div class="card-content">
        <h3>${name}</h3>
        <p>${description}</p>
        <div class="card-actions">
          <button class="visit" type="button">Visit</button>
          <span></span>
        </div>
      </div>
    </div>
  `;
}

function renderResults(items) {
  clearResults();

  if (!items || items.length === 0) {
    showMsg("No recommendations found for your search.");
    return;
  }

  // Task 8: show at least two
  const list = items.slice(0, 10);

  resultsEl.innerHTML = list.map(renderCard).join("");
  resultCountEl.textContent = `${list.length} results`;
}

function getBeachResults(data) {
  // JSON: data.beaches[]
  return (data.beaches || []).map((b) => ({
    name: b.name,
    imageUrl: b.imageUrl,
    description: b.description,
  }));
}

function getTempleResults(data) {
  // JSON: data.temples[]
  return (data.temples || []).map((t) => ({
    name: t.name,
    imageUrl: t.imageUrl,
    description: t.description,
  }));
}

function getCountryResults(data) {
  // JSON: data.countries[].cities[]
  // Since countries don't have image/description, we show cities as "country recommendations"
  const out = [];
  for (const c of data.countries || []) {
    for (const city of c.cities || []) {
      out.push({
        name: city.name,
        imageUrl: city.imageUrl,
        description: city.description,
      });
    }
  }
  return out;
}

function doSearch() {
  if (!apiData) {
    showMsg("Data not loaded yet. Refresh the page.");
    return;
  }

  const q = normalize(searchInput.value);

  if (!q) {
    clearResults();
    showMsg("Please enter a valid search query.");
    return;
  }

  // Task 7/8
  if (isKeyword(q, "beach")) {
    renderResults(getBeachResults(apiData));
    return;
  }

  if (isKeyword(q, "temple")) {
    renderResults(getTempleResults(apiData));
    return;
  }

  if (isKeyword(q, "country")) {
    renderResults(getCountryResults(apiData));
    return;
  }

  // Optional helpful behavior: if user types a country name like "Japan"
  const country = (apiData.countries || []).find(
    (c) => normalize(c.name) === q
  );

  if (country) {
    const items = (country.cities || []).map((city) => ({
      name: city.name,
      imageUrl: city.imageUrl,
      description: city.description,
    }));
    renderResults(items);
    return;
  }

  clearResults();
  showMsg('Try "beach", "temple", or "country" (case-insensitive).');
}

async function init() {
  try {
    const res = await fetch(API_PATH);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    apiData = await res.json();

    // Task 6: verify with console.log
    console.log("API Data Loaded:", apiData);
  } catch (err) {
    console.error(err);
    showMsg("Could not load travel_recommendation_api.json. Check file name/path.");
  }

  // Task 6/7: results appear only after clicking Search
  searchBtn.addEventListener("click", doSearch);

  // Task 9: clear button
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearResults();
  });
}

init();
