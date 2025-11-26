// Basic frontend to call the Java backend at http://localhost:8080/api/meals/*
const API_BASE = 'http://localhost:8080/api/meals';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const categoriesList = document.getElementById('categoriesList');
const resultsEl = document.getElementById('results');
const detailsEl = document.getElementById('details');

searchBtn.addEventListener('click', () => {
  const name = searchInput.value.trim();
  if (!name) return alert('Type a meal name to search');
  searchByName(name);
});

randomBtn.addEventListener('click', () => {
  fetchRandom();
});

categoriesList.addEventListener('click', (e) => {
  const li = e.target.closest('li[data-cat]');
  if (!li) return;
  const cat = li.dataset.cat;
  fetchByCategory(cat);
});

resultsEl.addEventListener('click', (e) => {
  const card = e.target.closest('.card[data-id]');
  if (!card) return;
  const id = card.dataset.id;
  fetchDetails(id);
});

// helper to show JSON error
function showError(err) {
  alert('Error: ' + err);
}

// fetch categories and render
async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const json = await res.json();
    const list = json.meals || [];
    categoriesList.innerHTML = list.map(c => `<li data-cat="${encodeURIComponent(c.strCategory)}">${c.strCategory}</li>`).join('');
  } catch (e) {
    showError(e.message);
  }
}

async function searchByName(name) {
  try {
    resultsEl.innerHTML = 'Loading...';
    detailsEl.classList.add('hidden');
    const res = await fetch(`${API_BASE}/search?name=${encodeURIComponent(name)}`);
    const json = await res.json();
    renderResults(json.meals);
  } catch (e) {
    showError(e.message);
  }
}

async function fetchRandom() {
  try {
    resultsEl.innerHTML = 'Loading...';
    detailsEl.classList.add('hidden');
    const res = await fetch(`${API_BASE}/random`);
    const json = await res.json();
    renderResults(json.meals);
  } catch (e) {
    showError(e.message);
  }
}

// TheMealDB supports filter.php?c=Category -- if your backend doesn't proxy it, we can call the official API directly.
// But here we try to call backend at /filter (optional). If not available, fallback to search by category name via list (simple)
async function fetchByCategory(cat) {
  try {
    resultsEl.innerHTML = 'Loading...';
    detailsEl.classList.add('hidden');

    // Try backend filter endpoint first (if you add it later)
    const res = await fetch(`${API_BASE}/filter?category=${encodeURIComponent(cat)}`);
    if (!res.ok) {
      // fallback: call TheMealDB directly (only if CORS allows) — otherwise, backend must implement filter
      const fallback = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(cat)}`);
      const json = await fallback.json();
      return renderResults(json.meals);
    }
    const json = await res.json();
    renderResults(json.meals);
  } catch (e) {
    showError(e.message);
  }
}

function renderResults(meals) {
  if (!meals) {
    resultsEl.innerHTML = '<p>No results</p>';
    return;
  }
  detailsEl.classList.add('hidden');
  resultsEl.innerHTML = meals.map(m => `
    <div class="card" data-id="${m.idMeal}">
      <img src="${m.strMealThumb || ''}" alt="${escapeHtml(m.strMeal)}" />
      <div class="meta">
        <h4>${escapeHtml(m.strMeal)}</h4>
        <p>ID: ${m.idMeal}</p>
      </div>
    </div>
  `).join('');
}

async function fetchDetails(id) {
  try {
    detailsEl.innerHTML = 'Loading details...';
    detailsEl.classList.remove('hidden');
    const res = await fetch(`${API_BASE}/lookup?id=${encodeURIComponent(id)}`);
    const json = await res.json();
    const meal = (json.meals && json.meals[0]) || null;
    if (!meal) {
      detailsEl.innerHTML = '<p>Details not found</p>';
      return;
    }

    // build ingredients list
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ing && ing.trim()) ingredients.push(`${measure || ''} ${ing}`.trim());
    }

    // youtube embed if present
    let youtubeHTML = '';
    if (meal.strYoutube) {
      const vid = meal.strYoutube.split('v=')[1] || '';
      const short = vid.split('&')[0];
      if (short) {
        youtubeHTML = `<div class="video"><iframe width="100%" height="315" src="https://www.youtube.com/embed/${short}" frameborder="0" allowfullscreen></iframe></div>`;
      }
    }

    detailsEl.innerHTML = `
      <h2>${escapeHtml(meal.strMeal)}</h2>
      <p><strong>Category:</strong> ${escapeHtml(meal.strCategory || '')} &nbsp; <strong>Area:</strong> ${escapeHtml(meal.strArea || '')}</p>
      <img src="${meal.strMealThumb || ''}" alt="${escapeHtml(meal.strMeal)}" style="max-width:320px; width:100%; border-radius:8px;"/>
      <h3>Ingredients</h3>
      <ul>${ingredients.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
      <h3>Instructions</h3>
      <p style="white-space:pre-line">${escapeHtml(meal.strInstructions || '')}</p>
      ${youtubeHTML}
    `;
  } catch (e) {
    showError(e.message);
  }
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

// init
loadCategories();
