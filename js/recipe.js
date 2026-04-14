let currentId = null;

// Rating stars UI rendering
// Displays and updates the user's rating visually in the #stars container
function renderStars(){
  const wrap = $("#stars");
  if(!wrap || !currentId) return;

  wrap.innerHTML = "";

  const currentRating = rate(currentId);

  for(let i = 1; i <= 5; i++){
    const b = document.createElement("button");
    b.className = "star" + (i <= currentRating ? " on" : "");
    b.textContent = "★";
    b.type = "button";
    b.onclick = () => setRating(i);
    wrap.appendChild(b);
  }

  const note = $("#note");
  if(note){
    note.textContent = currentRating
      ? `${t("yourRating")} ${currentRating}/5`
      : t("noRating");
  }
}

// Rating system
// Stores rating per recipe and refreshes star display
function setRating(v){
  if(!currentId) return;

  const all = get(LS_RATE, {});
  all[currentId] = v;
  set(LS_RATE, all);
  renderStars();
}

// "Your Choice" toggle system
// Adds or removes current recipe from user's saved list
function toggleList(){
  if(!currentId) return;

  const list = get(LS_LIST, []);
  const i = list.indexOf(currentId);

  if(i >= 0){
    list.splice(i, 1);
  } else {
    list.unshift(currentId);
  }

  set(LS_LIST, list);

  const toggleBtn = $("#toggleList");
  if(toggleBtn){
    toggleBtn.textContent = inList(currentId) ? t("removeChoice") : t("addChoice");
  }
}
// Recipe page renderer
// Loads recipe data from URL parameter and populates all UI elements
function renderRecipe(){
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const recipe = byId(id);

  const recipePage = $("#recipePage");
  const missingRecipe = $("#missingRecipe");

  // Handles where recipe ID is invalid or not found
  if(!recipe){
    if(recipePage) recipePage.hidden = true;
    if(missingRecipe) missingRecipe.hidden = false;
    currentId = null;
    return;
  }

  currentId = id;

  if(recipePage) recipePage.hidden = false;
  if(missingRecipe) missingRecipe.hidden = true;

  // Renders recipe image into #mPoster container
  const poster = $("#mPoster");
  if(poster){
    poster.innerHTML = "";
    poster.style.background = "none";

    const img = document.createElement("img");
    img.src = recipe.img;
    img.alt = recipe.t;
    img.className = "recipeImage";
    poster.appendChild(img);
  }

  if($("#mTitle")) $("#mTitle").textContent = recipe.t;
  if($("#mDesc")) $("#mDesc").textContent = recipe.d;
  if($("#mTime")) $("#mTime").textContent = recipe.time;
  if($("#mDiff")) $("#mDiff").textContent = recipe.diff;
  if($("#mTags")) $("#mTags").textContent = recipe.tags.join(", ");

  // Fills ingredients list (#mIng) with recipe data
  const ingList = $("#mIng");
  if(ingList){
    ingList.innerHTML = "";

    let currentIngredients = [];

    if(Array.isArray(recipe.ing)){
      currentIngredients = recipe.ing;
    } else if(recipe.ing && Array.isArray(recipe.ing.da)){
      currentIngredients = recipe.ing.da;
    }

    currentIngredients.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      ingList.appendChild(li);
    });
  }

  // Fills step-by-step instructions (#mSteps)
  const stepsList = $("#mSteps");
  if(stepsList){
    stepsList.innerHTML = "";

    let currentSteps = [];

    if(Array.isArray(recipe.steps)){
      currentSteps = recipe.steps;
    } else if(recipe.steps && Array.isArray(recipe.steps.da)){
      currentSteps = recipe.steps.da;
    }

    currentSteps.forEach(step => {
      const li = document.createElement("li");
      li.textContent = step;
      stepsList.appendChild(li);
    });
  }
  
// Updates "Your Choice" button text based on saved state
  const toggleBtn = $("#toggleList");
  if(toggleBtn){
    toggleBtn.textContent = inList(currentId) ? t("removeChoice") : t("addChoice");
  }

// Initializes rating UI for current recipe
  renderStars();
}

// Dynamic UI text
// Updates all static text elements on the recipe page
function applyPageLanguage(){
  if($("#backBtn")) $("#backBtn").textContent = "← Tilbage til opskrifter";
  if($("#ingredientsTitle")) $("#ingredientsTitle").textContent = "Ingredienser";
  if($("#howToTitle")) $("#howToTitle").textContent = "Sådan gør du";
  if($("#ratingTitle")) $("#ratingTitle").textContent = "Vurdering";

  const missingTitle = $("#missingRecipe h2");
  const missingText = $("#missingRecipe p");

  if(missingTitle) missingTitle.textContent = "Opskrift ikke fundet";
  if(missingText) missingText.textContent = "Denne opskrift findes ikke.";

  if(currentId){
    const toggleBtn = $("#toggleList");
    if(toggleBtn){
      toggleBtn.textContent = inList(currentId) ? t("removeChoice") : t("addChoice");
    }
    renderStars();
  }
}
// Event listener system
// Handles navigation and user actions
if($("#backBtn")){
  $("#backBtn").onclick = () => {
    const from = sessionStorage.getItem("ff_last_page") || "";
    if(from){
      window.location.href = `index.html?section=${encodeURIComponent(from)}`;
    } else {
      window.location.href = "index.html";
    }
  };
}

if($("#toggleList")){
  $("#toggleList").onclick = toggleList;
}

applyPageLanguage();
renderRecipe();
