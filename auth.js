const loginForm = document.getElementById("loginForm");
const loggedOutBlock = document.getElementById("loggedOutBlock");
const loggedInBlock = document.getElementById("loggedInBlock");
const ownedCharacter = document.getElementById("ownedCharacter");
const logoutButton = document.getElementById("logoutButton");
const authMessage = document.getElementById("authMessage");

/*
 * Служебный домен.
 * Пользователь его не видит.
 */
const AUTH_EMAIL_DOMAIN = "characters.example";

function showMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.classList.toggle("error", isError);
}

/*
 * Превращаем логин Felix в служебный email:
 * felix@characters.example
 */
function loginToEmail(login) {
  const normalizedLogin = login
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");

  return `${normalizedLogin}@${AUTH_EMAIL_DOMAIN}`;
}

async function loadOwnedCharacter(userId) {
  const { data, error } = await supabaseClient
    .from("character_owners")
    .select(`
      character_id,
      characters (
        id,
        name,
        avatar
      )
    `)
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Ошибка загрузки персонажа:", error);

    ownedCharacter.innerHTML = `
      <p>Не удалось определить персонажа аккаунта.</p>
    `;

    return;
  }

  if (!data || !data.characters) {
    ownedCharacter.innerHTML = `
      <p>
        К этому аккаунту пока не привязан персонаж.
      </p>
    `;

    return;
  }

  const character = data.characters;

  /*
   * Запоминаем ID текущего персонажа.
   * Позже он понадобится панели редактирования.
   */
  localStorage.setItem(
    "currentCharacterId",
    character.id
  );

  ownedCharacter.innerHTML = `
    <a
      class="owned-character"
      href="profile.html?id=${character.id}"
    >
      <img
        src="${character.avatar}"
        alt="${character.name}"
      >

      <span>${character.name}</span>
    </a>

    <p>
      <a href="profile.html?id=${character.id}">
        Перейти в профиль →
      </a>
    </p>
  `;
}

async function updateAuthInterface(session) {
  const user = session?.user;

  if (!user) {
    loggedOutBlock.classList.remove("hidden");
    loggedInBlock.classList.add("hidden");

    ownedCharacter.innerHTML = "";
    localStorage.removeItem("currentCharacterId");

    return;
  }

  loggedOutBlock.classList.add("hidden");
  loggedInBlock.classList.remove("hidden");

  await loadOwnedCharacter(user.id);
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();

  const login = document
    .getElementById("loginName")
    .value
    .trim();

  const password = document
    .getElementById("loginPassword")
    .value;

  if (!login || !password) {
    showMessage("Введи логин и пароль.", true);
    return;
  }

  const email = loginToEmail(login);

  showMessage("Входим...");

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    console.error(error);

    showMessage(
      "Неверный логин или пароль.",
      true
    );

    return;
  }

  loginForm.reset();

  showMessage("Вход выполнен.");

  await updateAuthInterface(data.session);
});

logoutButton.addEventListener("click", async () => {
  const { error } =
    await supabaseClient.auth.signOut();

  if (error) {
    console.error(error);
    showMessage("Не удалось выйти из аккаунта.", true);
    return;
  }

  showMessage("Ты вышел из аккаунта.");

  await updateAuthInterface(null);
});

async function initializeAuthPage() {
  const {
    data: { session },
    error
  } = await supabaseClient.auth.getSession();

  if (error) {
    console.error(error);
  }

  await updateAuthInterface(session);
}

supabaseClient.auth.onAuthStateChange(
  (event, session) => {
    updateAuthInterface(session);
  }
);

initializeAuthPage();
