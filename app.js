let allPlants = [];
let currentFiltered = [];

const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const modalName = document.getElementById("modal-name");
const modalCategory = document.getElementById("modal-category");
const modalHealth = document.getElementById("modal-health");
const modalStock = document.getElementById("modal-stock");
const modalMutations = document.getElementById("modal-mutations");
const modalBonuses = document.getElementById("modal-bonuses");

modalClose.addEventListener("click", () => modal.classList.add("hidden"));

async function fetchPlants() {
  const res = await fetch("https://growagardenstock.vercel.app/api/plants");
  const data = await res.json();
  allPlants = data;
  renderPlants(allPlants);
}

function showPlantDetails(plant) {
  modalName.textContent = plant.name;
  modalCategory.textContent = `Category: ${plant.category}`;
  modalHealth.textContent = `Health: ${plant.health}`;
  modalStock.textContent = `Stock: ${plant.stock}`;

  modalMutations.innerHTML = "";
  modalBonuses.innerHTML = "";

  if (plant.mutations) {
    plant.mutations.split(",").forEach(m => {
      const badge = document.createElement("span");
      badge.className = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 px-2 py-1 rounded-full text-xs";
      badge.textContent = `🧬 ${m.trim()}`;
      modalMutations.appendChild(badge);
    });
  }

  if (plant.bonuses) {
    plant.bonuses.split(",").forEach(b => {
      const badge = document.createElement("span");
      badge.className = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full text-xs";
      badge.textContent = `🎁 ${b.trim()}`;
      modalBonuses.appendChild(badge);
    });
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

// Replace with full renderPlants, filters, countdowns, export logic from previous steps
fetchPlants();
