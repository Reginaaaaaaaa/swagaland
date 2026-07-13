const MAX_ORIGINAL_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_UPLOAD_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

let selectedPostImageFile = null;
let selectedPostImagePreviewUrl = null;

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

        <label>Фотография</label>

<div
  id="postImageDropzone"
  class="post-image-dropzone"
  tabindex="0"
>
  <input
    id="newPostImage"
    class="post-image-input"
    type="file"
    accept="image/jpeg,image/png,image/webp"
  >

  <div class="post-image-placeholder">
    <strong>Перетащи фотографию сюда</strong>
    <span>или нажми, чтобы выбрать файл</span>
  </div>
</div>

<div
  id="postImagePreview"
  class="post-image-preview hidden"
>
  <img
    id="postImagePreviewPicture"
    src=""
    alt="Предпросмотр фотографии"
  >

  <button
    id="removePostImage"
    class="remove-post-image"
    type="button"
  >
    × Удалить фотографию
  </button>
</div>

<div
  id="postImageMessage"
  class="form-message"
></div>

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

        <label>Дата публикации</label>

<div class="post-date-row">

  <select id="newPostDay">
    ${Array.from({ length: 31 }, (_, i) => `
      <option value="${i + 1}">
        ${i + 1}
      </option>
    `).join("")}
  </select>

  <select id="newPostMonth">

    <option value="1">января</option>
    <option value="2">февраля</option>
    <option value="3">марта</option>
    <option value="4">апреля</option>
    <option value="5">мая</option>
    <option value="6">июня</option>
    <option value="7">июля</option>
    <option value="8">августа</option>
    <option value="9">сентября</option>
    <option value="10">октября</option>
    <option value="11">ноября</option>
    <option value="12">декабря</option>

  </select>

</div>

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

  selectedPostImageFile = null;
clearPostImagePreview();

setupPostImagePicker();

  const now = new Date();

document.getElementById("newPostDay").value =
    now.getDate();

document.getElementById("newPostMonth").value =
    now.getMonth() + 1;

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

function setupPostImagePicker() {
  const dropzone = document.getElementById(
    "postImageDropzone"
  );

  const input = document.getElementById(
    "newPostImage"
  );

  const removeButton = document.getElementById(
    "removePostImage"
  );

  if (!dropzone || !input || !removeButton) return;

  dropzone.addEventListener("click", () => {
    input.click();
  });

  dropzone.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      input.click();
    }
  });

  input.addEventListener("click", event => {
    event.stopPropagation();
  });

  input.addEventListener("change", async () => {
    const file = input.files?.[0];

    if (!file) return;

    await handleSelectedPostImage(file);
  });

  dropzone.addEventListener("dragover", event => {
    event.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", async event => {
    event.preventDefault();
    dropzone.classList.remove("dragover");

    const file = event.dataTransfer.files?.[0];

    if (!file) return;

    await handleSelectedPostImage(file);
  });

  removeButton.addEventListener("click", () => {
    clearPostImageSelection();
  });
}

async function handleSelectedPostImage(file) {
  const message = document.getElementById(
    "postImageMessage"
  );

  if (message) {
    message.textContent = "";
    message.classList.remove("error");
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    showPostImageError(
      "Можно загружать только JPG, PNG или WEBP."
    );

    clearPostImageSelection();
    return;
  }

  if (file.size > MAX_ORIGINAL_IMAGE_SIZE) {
    showPostImageError(
      "Фотография должна занимать не более 10 МБ."
    );

    clearPostImageSelection();
    return;
  }

  try {
    selectedPostImageFile =
      await preparePostImage(file);

    if (
      selectedPostImageFile.size >
      MAX_UPLOAD_IMAGE_SIZE
    ) {
      throw new Error("IMAGE_TOO_LARGE");
    }

    showPostImagePreview(selectedPostImageFile);
  } catch (error) {
    console.error(
      "Ошибка обработки фотографии:",
      error
    );

    showPostImageError(
      "Не удалось подготовить фотографию. Выбери другое изображение."
    );

    clearPostImageSelection(false);
  }
}

function showPostImageError(text) {
  const message = document.getElementById(
    "postImageMessage"
  );

  if (!message) return;

  message.textContent = text;
  message.classList.add("error");
}

function showPostImagePreview(file) {
  const preview = document.getElementById(
    "postImagePreview"
  );

  const picture = document.getElementById(
    "postImagePreviewPicture"
  );

  const dropzone = document.getElementById(
    "postImageDropzone"
  );

  if (!preview || !picture) return;

  clearPostImagePreview();

  selectedPostImagePreviewUrl =
    URL.createObjectURL(file);

  picture.src = selectedPostImagePreviewUrl;

  preview.classList.remove("hidden");

  if (dropzone) {
    dropzone.classList.add("has-image");
  }
}

function clearPostImagePreview() {
  if (selectedPostImagePreviewUrl) {
    URL.revokeObjectURL(
      selectedPostImagePreviewUrl
    );

    selectedPostImagePreviewUrl = null;
  }

  const preview = document.getElementById(
    "postImagePreview"
  );

  const picture = document.getElementById(
    "postImagePreviewPicture"
  );

  if (preview) {
    preview.classList.add("hidden");
  }

  if (picture) {
    picture.src = "";
  }
}

function clearPostImageSelection(
  clearMessage = true
) {
  selectedPostImageFile = null;

  clearPostImagePreview();

  const input = document.getElementById(
    "newPostImage"
  );

  const dropzone = document.getElementById(
    "postImageDropzone"
  );

  const message = document.getElementById(
    "postImageMessage"
  );

  if (input) {
    input.value = "";
  }

  if (dropzone) {
    dropzone.classList.remove("has-image");
  }

  if (message && clearMessage) {
    message.textContent = "";
    message.classList.remove("error");
  }
}

async function preparePostImage(file) {
  const image = await loadImageFile(file);

  const width = image.naturalWidth;
  const height = image.naturalHeight;

  const largestSide = Math.max(width, height);

  if (
    largestSide <= MAX_IMAGE_DIMENSION &&
    file.size <= MAX_UPLOAD_IMAGE_SIZE
  ) {
    return file;
  }

  let maxDimension = MAX_IMAGE_DIMENSION;

  const qualitySteps = [
    0.9,
    0.87,
    0.84
  ];

  for (const quality of qualitySteps) {
    const optimizedFile =
      await resizeImageToWebp(
        image,
        file.name,
        maxDimension,
        quality
      );

    if (
      optimizedFile.size <=
      MAX_UPLOAD_IMAGE_SIZE
    ) {
      return optimizedFile;
    }
  }

  maxDimension = 1400;

  const smallerFile =
    await resizeImageToWebp(
      image,
      file.name,
      maxDimension,
      0.84
    );

  if (
    smallerFile.size <=
    MAX_UPLOAD_IMAGE_SIZE
  ) {
    return smallerFile;
  }

  throw new Error("IMAGE_TOO_LARGE");
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error("Не удалось открыть изображение")
      );
    };

    image.src = url;
  });
}

function resizeImageToWebp(
  image,
  originalName,
  maxDimension,
  quality
) {
  return new Promise((resolve, reject) => {
    const originalWidth = image.naturalWidth;
    const originalHeight = image.naturalHeight;

    const scale = Math.min(
      1,
      maxDimension /
        Math.max(
          originalWidth,
          originalHeight
        )
    );

    const width = Math.round(
      originalWidth * scale
    );

    const height = Math.round(
      originalHeight * scale
    );

    const canvas = document.createElement(
      "canvas"
    );

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      reject(
        new Error("Не удалось создать изображение")
      );

      return;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(
      image,
      0,
      0,
      width,
      height
    );

    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(
            new Error(
              "Не удалось обработать изображение"
            )
          );

          return;
        }

        const baseName =
          originalName
            .replace(/\.[^.]+$/, "")
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .slice(0, 60) || "photo";

        const optimizedFile = new File(
          [blob],
          `${baseName}.webp`,
          {
            type: "image/webp",
            lastModified: Date.now()
          }
        );

        resolve(optimizedFile);
      },
      "image/webp",
      quality
    );
  });
}

async function uploadPostImage(
  file,
  characterId
) {
  const extension =
    file.type === "image/png"
      ? "png"
      : file.type === "image/jpeg"
        ? "jpg"
        : "webp";

  const fileId =
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}`;

  const filePath =
    `${characterId}/${fileId}.${extension}`;

  const { error: uploadError } =
    await supabaseClient.storage
      .from("post-images")
      .upload(
        filePath,
        file,
        {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false
        }
      );

  if (uploadError) {
    throw uploadError;
  }

  const { data } =
    supabaseClient.storage
      .from("post-images")
      .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    await deleteUploadedPostImage(
      filePath
    );

    throw new Error(
      "Не удалось получить ссылку на файл"
    );
  }

  return {
    publicUrl: data.publicUrl,
    path: filePath
  };
}

async function deleteUploadedPostImage(
  filePath
) {
  if (!filePath) return;

  const { error } =
    await supabaseClient.storage
      .from("post-images")
      .remove([filePath]);

  if (error) {
    console.error(
      "Не удалось удалить файл:",
      error
    );
  }
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

 const day =
    document.getElementById("newPostDay").value;

const month =
    document.getElementById("newPostMonth").value;

const year =
    new Date().getFullYear();

const publishedAt =
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

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

let uploadedImage = null;

try {
  if (selectedPostImageFile) {
    uploadedImage = await uploadPostImage(
      selectedPostImageFile,
      character.id
    );
  }

  const { error } = await supabaseClient
    .from("posts")
    .insert({
      id: postId,
      character_id: character.id,
      text,
      image:
        uploadedImage?.publicUrl || null,
      tags,
      music,
      comments: [],
      published_at: publishedAt
    });

  if (error) {
    throw error;
  }

  message.classList.remove("error");
  message.textContent =
    "Запись опубликована.";

  selectedPostImageFile = null;
  clearPostImagePreview();

  window.setTimeout(() => {
    window.location.reload();
  }, 500);
} catch (error) {
  console.error(
    "Ошибка публикации:",
    error
  );
  if (uploadedImage?.path) {
    await deleteUploadedPostImage(
      uploadedImage.path
    );
  }

  message.textContent =
    "Не удалось опубликовать запись.";

  message.classList.add("error");
}

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
