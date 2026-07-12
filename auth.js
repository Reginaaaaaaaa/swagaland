const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showLoginButton = document.getElementById(
  "showLoginButton"
);

const showRegisterButton = document.getElementById(
  "showRegisterButton"
);

const loggedOutBlock = document.getElementById(
  "loggedOutBlock"
);

const loggedInBlock = document.getElementById(
  "loggedInBlock"
);

const currentUserEmail = document.getElementById(
  "currentUserEmail"
);

const ownedCharacters = document.getElementById(
  "ownedCharacters"
);

const logoutButton = document.getElementById(
  "logoutButton"
);

const authMessage = document.getElementById(
  "authMessage"
);

function showMessage(message, isError = false) {
  authMessage.textContent = message;

  authMessage.classList.toggle(
    "error",
    isError
  );
}

function showLoginForm() {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");

  showLoginButton.classList.add("active");
  showRegisterButton.classList.remove("active");

  showMessage("");
}

function showRegisterForm() {
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");

  showRegisterButton.classList.add("active");
  showLoginButton.classList.remove("active");

  showMessage("");
}

async function loadOwnedCharacters(userId) {
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
    .eq("user_id", userId);

  if (error) {
    console.error(
      "Ошибка загрузки персонажей:",
      error
    );

    ownedCharacters.innerHTML = `
      <p>Не удалось загрузить персонажей.</p>
    `;

    return;
  }

  if (!data || data.length === 0) {
    ownedCharacters.innerHTML = `
      <p>
        К аккаунту пока не привязан ни один персонаж.
      </p>
    `;

    return;
  }

  ownedCharacters.innerHTML = `
    <h2>Мои персонажи</h2>

    ${data.map(item => {
      const character = item.characters;

      if (!character) return "";

      return `
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
      `;
    }).join("")}
  `;
}

async function updateAuthInterface(session) {
  const user = session?.user;

  if (!user) {
    loggedOutBlock.classList.remove("hidden");
    loggedInBlock.classList.add("hidden");

    currentUserEmail.textContent = "";
    ownedCharacters.innerHTML = "";

    return;
  }

  loggedOutBlock.classList.add("hidden");
  loggedInBlock.classList.remove("hidden");

  currentUserEmail.textContent = user.email || "";

  await loadOwnedCharacters(user.id);
}

showLoginButton.addEventListener(
  "click",
  showLoginForm
);

showRegisterButton.addEventListener(
  "click",
  showRegisterForm
);

registerForm.addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    const displayName = document
      .getElementById("registerName")
      .value
      .trim();

    const email = document
      .getElementById("registerEmail")
      .value
      .trim();

    const password = document
      .getElementById("registerPassword")
      .value;

    showMessage("Создаём аккаунт...");

    const { data, error } =
      await supabaseClient.auth.signUp({
        email,
        password,

        options: {
          data: {
            display_name: displayName
          }
        }
      });

    if (error) {
      showMessage(error.message, true);
      return;
    }

    registerForm.reset();

    if (data.session) {
      showMessage("Аккаунт создан.");
      await updateAuthInterface(data.session);
    } else {
      showMessage(
        "Аккаунт создан. Проверь почту и подтверди регистрацию."
      );
    }
  }
);

loginForm.addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    const email = document
      .getElementById("loginEmail")
      .value
      .trim();

    const password = document
      .getElementById("loginPassword")
      .value;

    showMessage("Входим...");

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      showMessage(
        "Не удалось войти. Проверь почту и пароль.",
        true
      );

      console.error(error);
      return;
    }

    loginForm.reset();

    showMessage("Вход выполнен.");

    await updateAuthInterface(data.session);
  }
);

logoutButton.addEventListener(
  "click",
  async () => {
    const { error } =
      await supabaseClient.auth.signOut();

    if (error) {
      showMessage(error.message, true);
      return;
    }

    showMessage("Ты вышла из аккаунта.");

    await updateAuthInterface(null);
  }
);

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
