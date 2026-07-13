async function initializeHeaderCharacterSwitcher() {
  const switcher = document.getElementById(
    "headerCharacterSwitcher"
  );

  if (!switcher) return;

  if (typeof supabaseClient === "undefined") {
    console.warn(
      "Не найдено подключение к Supabase."
    );

    return;
  }

  const {
    data: { session },
    error: sessionError
  } = await supabaseClient.auth.getSession();

  if (sessionError) {
    console.error(
      "Ошибка получения сессии:",
      sessionError
    );

    return;
  }

  if (!session?.user) {
    switcher.innerHTML = "";
    switcher.classList.remove("visible");
    return;
  }

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
    .eq("user_id", session.user.id);

  if (error) {
    console.error(
      "Ошибка загрузки доступных персонажей:",
      error
    );

    switcher.innerHTML = "";
    return;
  }

  const characters = (data || [])
    .map(item => {
  
      if (Array.isArray(item.characters)) {
        return item.characters[0] || null;
      }

      return item.characters || null;
    })
    .filter(Boolean);

  if (characters.length === 0) {
    switcher.innerHTML = `
      <a href="auth.html" class="header-no-character">
        Персонаж не привязан
      </a>
    `;

    switcher.classList.add("visible");
    return;
  }

  const savedCharacterId = localStorage.getItem(
    "currentCharacterId"
  );

  const savedCharacterExists = characters.some(
    character =>
      character.id === savedCharacterId
  );

  const activeCharacterId = savedCharacterExists
    ? savedCharacterId
    : characters[0].id;

  localStorage.setItem(
    "currentCharacterId",
    activeCharacterId
  );

  renderHeaderSwitcher(
    switcher,
    characters,
    activeCharacterId
  );
}

function renderHeaderSwitcher(
  switcher,
  characters,
  activeCharacterId
) {
  const activeCharacter = characters.find(
    character =>
      character.id === activeCharacterId
  ) || characters[0];

  switcher.innerHTML = `
    <div class="header-character-control">
      <img
        id="headerCharacterAvatar"
        class="header-character-avatar"
        src="${activeCharacter.avatar || ""}"
        alt="${activeCharacter.name}"
      >

      <select
        id="headerCharacterSelect"
        class="header-character-select"
        aria-label="Выбрать активного персонажа"
      >
        ${characters.map(character => `
          <option
            value="${character.id}"
            ${
              character.id === activeCharacter.id
                ? "selected"
                : ""
            }
          >
            ${character.name}
          </option>
        `).join("")}
      </select>
    </div>
  `;

  switcher.classList.add("visible");

  const select = document.getElementById(
    "headerCharacterSelect"
  );

  const avatar = document.getElementById(
    "headerCharacterAvatar"
  );

  select.addEventListener("change", () => {
    const selectedCharacterId = select.value;

    const selectedCharacter = characters.find(
      character =>
        character.id === selectedCharacterId
    );

    localStorage.setItem(
      "currentCharacterId",
      selectedCharacterId
    );

    if (selectedCharacter && avatar) {
      avatar.src = selectedCharacter.avatar || "";
      avatar.alt = selectedCharacter.name;
    }

    window.location.href =
      `profile.html?id=${encodeURIComponent(
        selectedCharacterId
      )}`;
  });
}

supabaseClient.auth.onAuthStateChange(
  (event, session) => {
    initializeHeaderCharacterSwitcher();
  }
);

initializeHeaderCharacterSwitcher();
