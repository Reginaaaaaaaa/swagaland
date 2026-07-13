const loginForm = document.getElementById("loginForm");
const loggedOutBlock = document.getElementById("loggedOutBlock");
const loggedInBlock = document.getElementById("loggedInBlock");
const ownedCharacters = document.getElementById("ownedCharacters");
const logoutButton = document.getElementById("logoutButton");
const authMessage = document.getElementById("authMessage");

const AUTH_EMAIL_DOMAIN = "characters.example";

function showMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.classList.toggle("error", isError);
}

function loginToEmail(login) {
  const normalizedLogin = login
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");

  return `${normalizedLogin}@${AUTH_EMAIL_DOMAIN}`;
}

function setActiveCharacter(characterId) {
  localStorage.setItem("currentCharacterId", characterId);

  document
    .querySelectorAll(".owned-character")
    .forEach(card => {
      card.classList.toggle(
        "active",
        card.dataset.characterId === characterId
      );
    });
}

async function loadOwnedCharacters(userId) {
  const { data, error } = await supabaseClient
    .from("character_owners")
    .select(`
      character_id,
      characters (
        id,
        name,
        avatar,
        status
      )
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Ошибка загрузки персонажей:", error);

    ownedCharacters.innerHTML = `
      <p>Не удалось загрузить персонажей аккаунта.</p>
    `;

    return;
  }

  const validItems = (data || []).filter(
    item => item.characters
  );

  if (validItems.length === 0) {
    ownedCharacters.innerHTML = `
      <p>К этому аккаунту пока не привязан персонаж.</p>
    `;

    localStorage.removeItem("currentCharacterId");
    return;
  }

  const savedCharacterId =
    localStorage.getItem("currentCharacterId");

  const savedCharacterExists = validItems.some(
    item => item.characters.id === savedCharacterId
  );

  const activeCharacterId = savedCharacterExists
    ? savedCharacterId
    : validItems[0].characters.id;

  localStorage.setItem(
    "currentCharacterId",
    activeCharacterId
  );

  ownedCharacters.innerHTML = `
    <h2>Мои персонажи</h2>

    <p class="character-switcher-description">
      Выбери персонажа, под которым хочешь продолжить.
    </p>

    <div class="owned-characters-list">
      ${validItems.map(item => {
        const character = item.characters;
        const isActive =
          character.id === activeCharacterId;

        return `
          <button
            class="owned-character ${isActive ? "active" : ""}"
            type="button"
            data-character-id="${character.id}"
          >
            <img
              src="${character.avatar}"
              alt="${character.name}"
            >

            <span class="owned-character-info">
              <strong>${character.name}</strong>

              ${
                character.status
                  ? `<small>${character.status}</small>`
                  : ""
              }
            </span>

            <span class="owned-character-check">
              ${isActive ? "✓" : ""}
            </span>
          </button>
        `;
      }).join("")}
    </div>

    <a
      id="openActiveCharacter"
      class="open-active-character"
      href="profile.html?id=${activeCharacterId}"
    >
      Перейти в профиль выбранного персонажа →
    </a>
  `;

  document
    .querySelectorAll(".owned-character")
    .forEach(button => {
      button.addEventListener("click", () => {
        const characterId =
          button.dataset.characterId;

        setActiveCharacter(characterId);

        const openProfileLink =
          document.getElementById(
            "openActiveCharacter"
          );

        if (openProfileLink) {
          openProfileLink.href =
            `profile.html?id=${characterId}`;
        }

        document
          .querySelectorAll(
            ".owned-character-check"
          )
          .forEach(check => {
            check.textContent = "";
          });

        const currentCheck =
          button.querySelector(
            ".owned-character-check"
          );

        if (currentCheck) {
          currentCheck.textContent = "✓";
        }
      });
    });
}

async function updateAuthInterface(session) {
  const user = session?.user;

  if (!user) {
    loggedOutBlock.classList.remove("hidden");
    loggedInBlock.classList.add("hidden");

    ownedCharacters.innerHTML = "";
    localStorage.removeItem("currentCharacterId");

    return;
  }

  loggedOutBlock.classList.add("hidden");
  loggedInBlock.classList.remove("hidden");

  await loadOwnedCharacters(user.id);
}

loginForm.addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    const login = document
      .getElementById("loginName")
      .value
      .trim();

    const password = document
      .getElementById("loginPassword")
      .value;

    if (!login || !password) {
      showMessage(
        "Введи логин и пароль.",
        true
      );

      return;
    }

    const email = loginToEmail(login);

    showMessage("Входим...");

    const { data, error } =
      await supabaseClient.auth
        .signInWithPassword({
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

    await updateAuthInterface(
      data.session
    );
  }
);

logoutButton.addEventListener(
  "click",
  async () => {
    const { error } =
      await supabaseClient.auth.signOut();

    if (error) {
      console.error(error);

      showMessage(
        "Не удалось выйти из аккаунта.",
        true
      );

      return;
    }

    showMessage("Ты вышел из аккаунта.");

    await updateAuthInterface(null);
  }
);

async function initializeAuthPage() {
  const {
    data: { session },
    error
  } = await supabaseClient.auth
    .getSession();

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
