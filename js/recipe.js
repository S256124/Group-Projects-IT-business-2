let currentId = null;
    // TODO: when the backend is ready, replace this local UI-only update
    // with an API call that saves the rating for the current recipe/user.
    // The request should include the recipe id (currentId) and the logged-in user's
    // auth token/session, then update the UI from the server response.
// Funtion to update rating with star display and text output
function rating(n) {
  const stars = document.getElementsByClassName("star");
    const output = document.getElementById("output");
    remove();
    for (let i = 0; i < n; i++) {
        if (n == 1) cls = "one";
        else if (n == 2) cls = "two";
        else if (n == 3) cls = "three";
        else if (n == 4) cls = "four";
        else if (n == 5) cls = "five";
        stars[i].className = "star " + cls;
    }
    output.innerText = "Rating is: " + n + "/5";

    }
// To remove the pre-applied styling
function remove() {
    let i = 0;
    while (i < 5) {
        stars[i].className = "star";
        i++;
    }
}

async function toggleList(){
  if(!currentId) return; // stop if there's no recipe loaded

  const alreadySaved = await inList(currentId); // is it saved already?

  if(alreadySaved){
    await fetch(`/api/favourites/${currentId}`, { method: "DELETE" }); // remove it
  } else {
    await fetch(`/api/favourites/${currentId}`, { method: "POST" });   // save it
  }

  // update the button text to reflect the new state
  const toggleBtn = $("#toggleList");
  if(toggleBtn){
    const nowSaved = await inList(currentId);
    toggleBtn.textContent = nowSaved ? t("removeChoice") : t("addChoice");
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
  (async () => {
    const toggleBtn = $("#toggleList");
    if(toggleBtn){
      toggleBtn.textContent = (await inList(currentId)) ? t("removeChoice") : t("addChoice");
    }
  })();

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
    (async () => {
      const toggleBtn = $("#toggleList");
      if(toggleBtn){
        toggleBtn.textContent = (await inList(currentId)) ? t("removeChoice") : t("addChoice");
      }
    })();
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
