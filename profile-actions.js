async function userOwnsCharacter(characterId) {
  const {
    data: { session },
    error: sessionError
  } = await supabaseClient.auth.getSession();

  if (sessionError) {
    console.error("Ошибка получения сессии:", sessionError);
    return false;
  }

  if (!session?.user) {
    return false;
  }

  const { data, error } = await supabaseClient
    .from("character_owners")
    .select("character_id")
    .eq("user_id", session.user.id)
    .eq("character_id", characterId)
    .maybeSingle();

  if (error) {
    console.error("Ошибка проверки владельца:", error);
    return false;
  }

  return Boolean(data);
}

async function initProfileActions(character) {
  const profileHeader = document.getElementById("profileHeader");

  if (!profileHeader || !character) return;

  const canEdit = await userOwnsCharacter(character.id);

  if (!canEdit) return;

  const oldControls = document.getElementById("profileOwnerControls");

  if (oldControls) {
    oldControls.remove();
  }

  const controls = document.createElement("div");
  controls.id = "profileOwnerControls";
  controls.className = "profile-owner-controls";

  controls.innerHTML = `
    <button id="editProfileButton" type="button">
      Редактировать профиль
    </button>

    <button id="createPostButton" type="button">
      + Создать запись
    </button>
  `;

  profileHeader.appendChild(controls);

  createProfileEditModal(character);
  createPostModal(character);

  document
    .getElementById("editProfileButton")
    .addEventListener("click", () => {
      openModal("editProfileModal");
    });

  document
    .getElementById("createPostButton")
    .addEventListener("click", () => {
      openModal("createPostModal");
    });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);

  if (!modal) return;

  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);

  if (!modal) return;

  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function createProfileEditModal(character) {
  const oldModal = document.getElementById("editProfileModal");

  if (oldModal) {
    oldModal.remove();
  }

  const modal = document.createElement("div");
  modal.id = "editProfileModal";
  modal.className = "edit-modal hidden";

  modal.innerHTML = `
    <div class="edit-modal-window">
      <button
        class="edit-modal-close"
        type="button"
        data-close-modal="editProfileModal"
        aria-label="Закрыть"
      >
        ×
      </button>

      <h2>Редактировать профиль</h2>

      <form id="editProfileForm" class="edit-form">
        <label for="editStatus">Статус</label>

        <textarea
          id="editStatus"
          maxlength="300"
        >${character.status || ""}</textarea>

        <label for="editCity">Город</label>

        <input
          id="editCity"
          type="text"
          value="${escapeAttribute(character.city || "")}"
        >

        <label for="editRelationship">Отношения</label>

        <input
          id="editRelationship"
          type="text"
          value="${escapeAttribute(character.relationship || "")}"
        >

        <label for="editAbout">
          О себе, каждый пункт с новой строки
        </label>

        <textarea id="editAbout">${
          (character.about || []).join("\n")
        }</textarea>

        <div
          id="editProfileMessage"
          class="form-message"
        ></div>

        <button type="submit">
          Сохранить изменения
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  setupModalClosing(modal);

  document
    .getElementById("editProfileForm")
    .addEventListener("submit", event => {
      saveProfileChanges(event, character);
    });
}

async function saveProfileChanges(event, character) {
  event.preventDefault();

  const message = document.getElementById(
    "editProfileMessage"
  );

  const status = document
    .getElementById("editStatus")
    .value
    .trim();

  const city = document
    .getElementById("editCity")
    .value
    .trim();

  const relationship = document
    .getElementById("editRelationship")
    .value
    .trim();

  const about = document
    .getElementById("editAbout")
    .value
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean);

  message.textContent = "Сохраняем...";

  const { error } = await supabaseClient
    .from("characters")
    .update({
      status,
      city,
      relationship,
      about
    })
    .eq("id", character.id);

  if (error) {
    console.error("Ошибка изменения профиля:", error);

    message.textContent =
      "Не удалось сохранить изменения.";

    message.classList.add("error");
    return;
  }

  message.classList.remove("error");
  message.textContent = "Профиль обновлён.";

  window.setTimeout(() => {
    window.location.reload();
  }, 500);
}

function createPostModal(character) {
  const oldModal = document.getElementById("createPostModal");

  if (oldModal) {
    oldModal.remove();
  }

  const modal = document.createElement("div");
  modal.id = "createPostModal";
  modal.className = "edit-modal hidden";

  modal.innerHTML = `
    <div class="edit-modal-window">
      <button
        class="edit-modal-close"
        type="button"
        data-close-modal="createPostModal"
        aria-label="Закрыть"
      >
        ×
      </button>

      <h2>Новая запись</h2>

      <form id="createPostForm" class="edit-form">
        <label for="newPostText">Текст записи</label>

        <textarea
          id="newPostText"
          required
        ></textarea>

        <label for="newPostImage">
          Путь к изображению
        </label>

        <input
          id="newPostImage"
          type="text"
          placeholder="images/posts/photo.jpg"
        >

        <label for="newPostTags">
          Теги через запятую
        </label>

        <input
          id="newPostTags"
          type="text"
          placeholder="друзья, музыка, вечер"
        >

        <label for="newPostMusicTitle">
          Название прикреплённой музыки
        </label>

        <input
          id="newPostMusicTitle"
          type="text"
          placeholder="Britney Spears — Toxic"
        >

        <label for="newPostMusicFile">
          Путь к музыкальному файлу
        </label>

        <input
          id="newPostMusicFile"
          type="text"
          placeholder="music/Toxic.mp3"
        >

        <label for="newPostDate">Дата публикации</label>

        <input
          id="newPostDate"
          type="date"
          required
        >

        <div
          id="createPostMessage"
          class="form-message"
        ></div>

        <button type="submit">
          Опубликовать
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const dateInput = document.getElementById("newPostDate");

  if (dateInput) {
    dateInput.value = new Date()
      .toISOString()
      .slice(0, 10);
  }

  setupModalClosing(modal);

  document
    .getElementById("createPostForm")
    .addEventListener("submit", event => {
      publishNewPost(event, character);
    });
}

async function publishNewPost(event, character) {
  event.preventDefault();

  const message = document.getElementById(
    "createPostMessage"
  );

  const text = document
    .getElementById("newPostText")
    .value
    .trim();

  const image = document
    .getElementById("newPostImage")
    .value
    .trim();

  const tags = document
    .getElementById("newPostTags")
    .value
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean);

  const musicTitle = document
    .getElementById("newPostMusicTitle")
    .value
    .trim();

  const musicFile = document
    .getElementById("newPostMusicFile")
    .value
    .trim();

  const publishedAt = document
    .getElementById("newPostDate")
    .value;

  if (!text) {
    message.textContent = "Напиши текст записи.";
    message.classList.add("error");
    return;
  }

  const music =
    musicTitle && musicFile
      ? {
          title: musicTitle,
          file: musicFile
        }
      : null;

  const postId = createPostId(character.id);

  message.classList.remove("error");
  message.textContent = "Публикуем...";

  const { error } = await supabaseClient
    .from("posts")
    .insert({
      id: postId,
      character_id: character.id,
      text,
      image: image || null,
      tags,
      music,
      comments: [],
      published_at: publishedAt
    });

  if (error) {
    console.error("Ошибка публикации:", error);

    message.textContent =
      "Не удалось опубликовать запись.";

    message.classList.add("error");
    return;
  }

  message.classList.remove("error");
  message.textContent = "Запись опубликована.";

  window.setTimeout(() => {
    window.location.reload();
  }, 500);
}

function createPostId(characterId) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${characterId}_${crypto.randomUUID()}`;
  }

  return `${characterId}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function setupModalClosing(modal) {
  modal
    .querySelectorAll("[data-close-modal]")
    .forEach(button => {
      button.addEventListener("click", () => {
        closeModal(button.dataset.closeModal);
      });
    });

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeModal(modal.id);
    }
  });
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
