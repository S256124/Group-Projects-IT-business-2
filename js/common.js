let currentLang = "da";

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const byId = (id) => RECIPES.find(r => r.id === id);

function t(key){
  return TEXT[key] || key;
}

function get(k, d){
  try{
    return JSON.parse(localStorage.getItem(k)) ?? d;
  }catch{
    return d;
  }
}

function set(k, v){
  localStorage.setItem(k, JSON.stringify(v));
}

function rate(id){
  return get(LS_RATE, {})[id] || 0;
}

// Asks the server if this recipe is saved by the current user
async function inList(id){
  const response = await fetch(`/api/favourites/${id}`); // ask the server
  const data = await response.json();                    // read the answer
  return data.saved;                                     // true or false
}

function posterStyle(r){
  const h = r.hue || 0;
  return `background:
    linear-gradient(135deg, rgba(229,9,20,.75), rgba(0,0,0,.35)),
    radial-gradient(420px 160px at 30% 20%, hsla(${h},90%,60%,.22), transparent 60%);`;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"]/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;"
  }[c]));
}

/* ---------- user ---------- */
function getUsers(){
  return get(LS_USERS, []);
}

function setUsers(users){
  set(LS_USERS, users);
}

function getActiveUser(){
  return localStorage.getItem(LS_ACTIVE_USER) || "";
}

function setActiveUser(email){
  localStorage.setItem(LS_ACTIVE_USER, email);
}

function clearActiveUser(){
  localStorage.removeItem(LS_ACTIVE_USER);
}

function openUserModal(){
  const modal = $("#userModal");
  if(!modal) return;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeUserModal(){
  const modal = $("#userModal");
  if(!modal) return;

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function updateUserUI(){
  const activeUser = getActiveUser();
  const status = $("#userStatus");
  const message = $("#userMessage");
  const button = $("#accountBtn");
  const modalTitle = $("#userModalTitle");

  if(status){
    status.textContent = activeUser
      ? `${t("userLoggedIn")} ${activeUser}`
      : t("userLoggedOut");
  }

  if(button){
    button.textContent = t("login");
  }

  if(modalTitle){
    modalTitle.textContent = t("login");
  }

  if(message && !message.textContent){
    message.textContent = "";
  }
}

function createProfile(){
  const email = $("#emailInput")?.value.trim();
  const password = $("#passwordInput")?.value.trim();
  const message = $("#userMessage");

  if(!email || !password){
    if(message) message.textContent = t("fillFields");
    return;
  }

  const users = getUsers();
  const exists = users.find(u => u.email === email);

  if(exists){
    if(message) message.textContent = t("createFail");
    return;
  }

  users.push({ email, password });
  setUsers(users);

  if(message) message.textContent = t("createSuccess");
}

function loginUser(){
  const email = $("#emailInput")?.value.trim();
  const password = $("#passwordInput")?.value.trim();
  const message = $("#userMessage");

  if(!email || !password){
    if(message) message.textContent = t("fillFields");
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if(!user){
    if(message) message.textContent = t("loginFail");
    return;
  }

  setActiveUser(email);

  if(message) message.textContent = t("loginSuccess");
  updateUserUI();
}

function logoutUser(){
  clearActiveUser();

  const message = $("#userMessage");
  if(message){
    message.textContent = t("loggedOutMessage");
  }

  updateUserUI();
}

function applySharedLanguage(){
  document.documentElement.lang = "da";

  const emailInput = $("#emailInput");
  const passwordInput = $("#passwordInput");
  const labels = $$(".userLabel");

  if(emailInput) emailInput.placeholder = t("email");
  if(passwordInput) passwordInput.placeholder = t("password");

  if(labels[0]) labels[0].textContent = t("email");
  if(labels[1]) labels[1].textContent = t("password");

  const createBtn = $("#createProfileBtn");
  const loginBtn = $("#loginBtn");
  const logoutBtn = $("#logoutBtn");

  if(createBtn) createBtn.textContent = t("createProfile");
  if(loginBtn) loginBtn.textContent = t("login");
  if(logoutBtn) logoutBtn.textContent = t("logout");

  updateUserUI();
}

function setupSharedEvents(){
  const homeLogo = $("#homeLogo");
  if(homeLogo){
    homeLogo.onclick = () => {
      window.location.href = "index.html";
    };
  }

  const accountBtn = $("#accountBtn");
  if(accountBtn){
    accountBtn.onclick = () => {
      openUserModal();
    };
  }

  const closeUserBtn = $("#closeUserModal");
  if(closeUserBtn){
    closeUserBtn.onclick = () => {
      closeUserModal();
    };
  }

  const userBackdrop = $("#userModalBackdrop");
  if(userBackdrop){
    userBackdrop.onclick = () => {
      closeUserModal();
    };
  }

  const createBtn = $("#createProfileBtn");
  const loginBtn = $("#loginBtn");
  const logoutBtn = $("#logoutBtn");

  if(createBtn){
    createBtn.onclick = () => {
      createProfile();
    };
  }

  if(loginBtn){
    loginBtn.onclick = () => {
      loginUser();
    };
  }

  if(logoutBtn){
    logoutBtn.onclick = () => {
      logoutUser();
    };
  }

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape"){
      closeUserModal();
    }
  });
}

applySharedLanguage();
setupSharedEvents();

if(typeof applyPageLanguage === "function"){
  applyPageLanguage();
}

if(typeof renderRecipe === "function"){
  renderRecipe();
}
