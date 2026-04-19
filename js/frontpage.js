let currentPage = null;

// Feature: Recipe navigation handling
// Handles navigation from frontpage to individual recipe pages.
function goToRecipe(id){
  if(currentPage){
    sessionStorage.setItem("ff_last_page", currentPage);
  }
  window.location.href = `recipe.html?id=${encodeURIComponent(id)}`;
}

// Recipe items list generation
// Converts recipe data into interactive visual cards shown in the grid layout
function makeItem(r){
  const item = document.createElement("li");
  item.className = "item";

  item.innerHTML = `
    <div class="poster">
      <img src="${escapeHtml(r.img)}" alt="${escapeHtml(r.t)}" class="cardImage">
    </div>
    <p class="itTitle">${escapeHtml(r.t)}</p>
  `;

  item.onclick = () => goToRecipe(r.id);

  return item;
}

function renderList(ids){
  const searchInput = $("#q");
  const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";

  const recipes = ids
    .map(byId)
    .filter(Boolean)
    .filter(r => {
      if(!searchValue) return true;

      const ingredients = Array.isArray(r.ing) ? r.ing.join(" ") : "";
      const steps = Array.isArray(r.steps) ? r.steps.join(" ") : "";

      const text = (
        r.t + " " +
        r.d + " " +
        r.tags.join(" ") + " " +
        ingredients + " " +
        steps
      ).toLowerCase();

      return text.includes(searchValue);
    });

  const list = $("#list");
  if(list){
    list.innerHTML = "";
    recipes.forEach(r => list.appendChild(makeItem(r)));
  }

  const empty = $("#empty");
  if(empty){
    empty.textContent = "Ingen opskrifter fundet.";
    empty.hidden = recipes.length > 0;
  }
}

// --- Random Inspiration Generator ---
function getRandomInspiration(count = 4) {
  const copy = [...RECIPES];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, count).map(r => r.id);
}

// Feature: Section/Page controller
// Toggles visibility of #choose and #section and loads relevant recipe data.
function showPage(page){
  currentPage = page;

  const choose = $("#choose");
  const section = $("#section");
  const q = $("#q");
  const clearBtn = $("#clearList");
  const sectionTitle = $("#sectionTitle");

  if(choose) choose.hidden = true;
  if(section) section.hidden = false;
  if(q) q.value = "";

  // Inspiration-sektionen henter 4 tilfældige opskrifter via getRandomInspiration()
  if(page === "inspiration"){
  if(sectionTitle) sectionTitle.textContent = "Inspiration";
  if(clearBtn) clearBtn.hidden = true;

  const randomIds = getRandomInspiration();
  renderList(randomIds);
  }

  if(page === "top10"){
    if(sectionTitle) sectionTitle.textContent = "Top 10";
    if(clearBtn) clearBtn.hidden = true;
    renderList(TOP10);
  }

  if(page === "yourchoice"){
    if(sectionTitle) sectionTitle.textContent = "Your Choice";
    if(clearBtn){
      clearBtn.hidden = false;
      clearBtn.textContent = "Ryd";
    }
    fetch("/api/favourites")
      .then(r => r.json())
      .then(ids => renderList(ids));
  }

  if(page === "search"){
    if(sectionTitle) sectionTitle.textContent = "Søgeresultater";
    if(clearBtn) clearBtn.hidden = true;
  }
}

// Homepage navigation (goes back to homepage)
// Resets UI and returns user to the frontpage
function goBack(){
  const choose = $("#choose");
  const section = $("#section");
  const list = $("#list");
  const empty = $("#empty");
  const q = $("#q");
  const front = $("#frontSearch");

  if(section) section.hidden = true;
  if(choose) choose.hidden = false;
  if(list) list.innerHTML = "";
  if(empty) empty.hidden = true;
  if(q) q.value = "";
  if(front) front.value = "";

  currentPage = null;
  sessionStorage.removeItem("ff_last_page");
}

// Recipe Search Engine (Frontpage Search)
// Searches across entire dataset (RECIPES) and renders matching results.
function runFrontSearch(){
  const input = $("#frontSearch");
  if(!input) return;

  const value = input.value.trim().toLowerCase();
  if(!value) return;

  const results = RECIPES
    .filter(r => {
      const ingredients = Array.isArray(r.ing) ? r.ing.join(" ") : "";
      const steps = Array.isArray(r.steps) ? r.steps.join(" ") : "";

      const text = (
        r.t + " " +
        r.d + " " +
        r.tags.join(" ") + " " +
        ingredients + " " +
        steps
      ).toLowerCase();

      return text.includes(value);
    })
    .map(r => r.id);

  currentPage = "search";
  sessionStorage.setItem("ff_last_page", "search");

  const choose = $("#choose");
  const section = $("#section");
  const sectionTitle = $("#sectionTitle");
  const clearBtn = $("#clearList");
  const q = $("#q");
  const list = $("#list");
  const empty = $("#empty");

  if(choose) choose.hidden = true;
  if(section) section.hidden = false;
  if(sectionTitle) sectionTitle.textContent = "Søgeresultater";
  if(clearBtn) clearBtn.hidden = true;
  if(q) q.value = "";

  if(list){
    list.innerHTML = "";
    results.map(byId).filter(Boolean).forEach(r => {
      list.appendChild(makeItem(r));
    });
  }

  if(empty){
    empty.textContent = "Ingen opskrifter fundet.";
    empty.hidden = results.length > 0;
  }
}

// URL routing
// Enables direct linking and restoring page state via URL.
function openSectionFromUrl(){
  const params = new URLSearchParams(window.location.search);
  const section = params.get("section");

  if(section === "inspiration"){
    showPage("inspiration");
  }

  if(section === "top10"){
    showPage("top10");
  }

  if(section === "yourchoice"){
    showPage("yourchoice");
  }

  if(section === "search"){
    const lastSearch = sessionStorage.getItem("ff_last_search") || "";
    const input = $("#frontSearch");
    if(input && lastSearch){
      input.value = lastSearch;
      runFrontSearch();
    }
  }
}

// Dynamic UI
// Updates all visible UI text elements based on current state.
function applyPageLanguage(){
  const chooseTitle = $("#chooseTitle");
  const frontText = $(".frontSearchText");
  const frontSearch = $("#frontSearch");
  const frontSearchBtn = $("#frontSearchBtn");
  const q = $("#q");
  const clearBtn = $("#clearList");
  const backBtn = $("#backBtn");
  const choices = $$(".choice");

  if(chooseTitle) chooseTitle.textContent = "Vælg en sektion";

  if(choices[0]){
    choices[0].querySelector(".choiceTag").textContent = "INSPIRATION";
    choices[0].querySelector(".choiceSub").textContent = "Idéer til at komme i gang";
  }

  if(choices[1]){
    choices[1].querySelector(".choiceTag").textContent = "TOP 10";
    choices[1].querySelector(".choiceSub").textContent = "Mest populære opskrifter";
  }

  if(choices[2]){
    choices[2].querySelector(".choiceTag").textContent = "YOUR CHOICE";
    choices[2].querySelector(".choiceSub").textContent = "Dine gemte opskrifter";
  }

  if(frontText) frontText.textContent = "Klar til at finde en opskrift? Søg efter navn eller ingredienser.";
  if(frontSearch) frontSearch.placeholder = "Søg efter opskrifter...";
  if(frontSearchBtn) frontSearchBtn.textContent = "Søg";
  if(q) q.placeholder = "Søg i denne sektion...";
  if(clearBtn && currentPage === "yourchoice") clearBtn.textContent = "Ryd";
  if(backBtn) backBtn.textContent = "← Tilbage til forsiden";

  const sectionTitle = $("#sectionTitle");
  if(sectionTitle){
    if(currentPage === "inspiration") sectionTitle.textContent = "Inspiration";
    if(currentPage === "top10") sectionTitle.textContent = "Top 10";
    if(currentPage === "yourchoice") sectionTitle.textContent = "Your Choice";
    if(currentPage === "search") sectionTitle.textContent = "Søgeresultater";
  }
}

// Event Listener System (User Interaction Handling)
// Connects user actions (click, input, submit) to application behavior.

/*Denne funktion gør, at man ikke kan trykke på Your Choice, hvis man gerne vil skal man bare
ændre ".choice:not(.blocked-choice)" til ".choice" i querySelectorAll i starten af denne fil. 
Det er lavet sådanfor at vise, at der er funktioner som ikke er tilgængelige*/
document.querySelectorAll(".choice:not(.blocked-choice)").forEach(btn => {
  btn.onclick = () => showPage(btn.dataset.page);
});

if($("#backBtn")){
  $("#backBtn").onclick = goBack;
}

if($("#q")){
  $("#q").oninput = () => {
    if(currentPage === "inspiration") renderList(INSP);
    if(currentPage === "top10") renderList(TOP10);
    if(currentPage === "yourchoice"){
      fetch("/api/favourites")
        .then(r => r.json())
        .then(ids => renderList(ids));
    }
  };
}

if($("#clearList")){
  $("#clearList").onclick = async () => {
    await fetch("/api/favourites", { method: "DELETE" });
    if(currentPage === "yourchoice"){
      renderList([]);
    }
  };
}

if($("#frontSearchForm")){
  $("#frontSearchForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const input = $("#frontSearch");
    if(input){
      sessionStorage.setItem("ff_last_search", input.value.trim());
    }

    runFrontSearch();
  });
}

applyPageLanguage();
openSectionFromUrl();
