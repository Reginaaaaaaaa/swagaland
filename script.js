function getCharacter(id) {
  return characters.find(character => character.id === id);
}

function getDefaultCharacter() {
  return characters[0] || null;
}

function getCurrentCharacter() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return getCharacter(id) || getDefaultCharacter();
}

function getPostById(characterId, postId) {
  const character = getCharacter(characterId);
  if (!character) return null;

  const post = (character.posts || []).find(post => post.id === postId);
  if (!post) return null;

  return { post, author: character };
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${secs}`;
}

function formatPostDate(date) {
  if (!date) return "";

  const parts = date.split(".");

  if (parts.length < 2) return date;

  return `${parts[0]}.${parts[1]}`;
}

function createPost(post, author) {
  return `
    <article class="post">
      <div class="post-author">
        <img src="${author.avatar}" alt="${author.name}">
        <a href="profile.html?id=${author.id}">${author.name}</a>
      </div>

      <p class="post-text">${post.text}</p>

      ${post.image ? `<img class="post-image" src="${post.image}" alt="Пост ${author.name}">` : ""}

      ${post.music ? `
        <div class="music">
          <span>🎵 ${post.music.title}</span>
          <audio controls src="${post.music.file}"></audio>
        </div>
      ` : ""}

      <div class="tags">
        ${(post.tags || []).map(tag => `<span># ${tag}</span>`).join("")}
      </div>

     <div class="date">${formatPostDate(post.date)}</div>

      ${createComments(post)}
    </article>
  `;
}

function createComments(post) {
  if (!post.comments || post.comments.length === 0) return "";

  return `
    <div class="comments">
      <h4>Комментарии</h4>

      ${post.comments.map(comment => {
        const commentAuthor = getCharacter(comment.author);

        if (!commentAuthor) {
          return `
            <div class="comment">
              <div class="comment-body">
                <b>Неизвестный пользователь</b>
                <p>${comment.text}</p>
              </div>
            </div>
          `;
        }

        return `
          <div class="comment">
            <a href="profile.html?id=${commentAuthor.id}">
              <img src="${commentAuthor.avatar}" alt="${commentAuthor.name}">
            </a>

            <div class="comment-body">
              <a href="profile.html?id=${commentAuthor.id}">
                <b>${commentAuthor.name}</b>
              </a>
              <p>${comment.text}</p>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function createRepost(repost, repostAuthor) {
  const original = getPostById(repost.fromCharacter, repost.postId);

  if (!original) {
    return `
      <article class="post repost">
        <p>Репост не найден.</p>
      </article>
    `;
  }

  return `
    <article class="post repost">
      <div class="repost-label">
        <b>${repostAuthor.name}</b> сделал(а) репост записи 
        <a href="profile.html?id=${original.author.id}">${original.author.name}</a>
      </div>

      ${repost.comment ? `<p class="repost-comment">${repost.comment}</p>` : ""}

      <div class="repost-original">
        ${createPost(original.post, original.author)}
      </div>

      <div class="date">${formatPostDate(repost.date)}</div>
    </article>
  `;
}

function createSmallPlayer(track) {
  return `
    <div class="track custom-track">
      <div class="track-title">♪ ${track.artist} — ${track.title}</div>

      ${track.file ? `
        <audio class="custom-audio" src="${track.file}"></audio>

        <div class="player-controls">
          <button class="play-button" type="button">▶</button>

          <div class="player-main">
            <input class="seek-bar" type="range" value="0" min="0" max="100">
            <div class="time-row">
              <span class="current-time">0:00</span>
              <span class="duration">0:00</span>
            </div>
          </div>
        </div>

        <div class="volume-row">
          <span>Громкость</span>
          <input class="volume-bar" type="range" value="70" min="0" max="100">
        </div>
      ` : ""}
    </div>
  `;
}

function renderSuggestions() {
  const block = document.getElementById("suggestions");
  if (!block) return;

  block.innerHTML = characters.map(character => `
    <a class="suggestion" href="profile.html?id=${character.id}">
      <img src="${character.avatar}" alt="${character.name}">
      <span>${character.name}</span>
    </a>
  `).join("");
}

function renderFeed() {
  const feed = document.getElementById("feed");
  if (!feed) return;

  const allItems = [];

  characters.forEach(character => {
    (character.posts || []).forEach(post => {
      allItems.push({
        type: "post",
        post,
        author: character
      });
    });

    (character.reposts || []).forEach(repost => {
      allItems.push({
        type: "repost",
        repost,
        author: character
      });
    });
  });

  feed.innerHTML = allItems.map(item => {
    if (item.type === "post") {
      return createPost(item.post, item.author);
    }

    return createRepost(item.repost, item.author);
  }).join("");
}

function renderProfile() {
  const profileHeader = document.getElementById("profileHeader");
  const profileSidebar = document.getElementById("profileSidebar");
  const profilePosts = document.getElementById("profilePosts");

  if (!profileHeader || !profileSidebar || !profilePosts) return;

  const character = getCurrentCharacter();

  if (!character) {
    profileHeader.innerHTML = "<h1>Персонаж не найден</h1>";
    return;
  }

 renderProfileSidebar(character);
renderProfileHeader(character);
renderProfilePosts(character);
renderProfileRightbar(character);
renderMiniCalendar(character);
setupCustomPlayers();
}

function renderProfileSidebar(character) {
  const profileSidebar = document.getElementById("profileSidebar");

  const commentsCount = (character.posts || []).reduce((sum, post) => {
    return sum + ((post.comments || []).length);
  }, 0);

  const previewTracks = (character.playlist || []).slice(0, 3);

  profileSidebar.innerHTML = `
    <div class="profile-card">
      <img class="big-avatar" src="${character.avatar}" alt="${character.name}">
      <h2>${character.name}</h2>
      <p class="online-status">● Сейчас онлайн</p>
    </div>

    <div class="box">
      <h2>Статистика</h2>

      <div class="mini-stats">
        <div>
          <b>${(character.posts || []).length}</b>
          <span>Записей</span>
        </div>

        <div>
          <b>${(character.gallery || []).length}</b>
          <span>Фото</span>
        </div>

        <div>
          <b>${(character.friends || []).length}</b>
          <span>Друзей</span>
        </div>

        <div>
          <b>${commentsCount}</b>
          <span>Комментариев</span>
        </div>
      </div>
    </div>

    <div class="box">
      <h2>О себе</h2>
      ${(character.about || []).map(item => `<p>• ${item}</p>`).join("")}
    </div>

    <div class="box">
      <h2>Плейлист</h2>

      <div class="playlist">
        ${previewTracks.map(track => createSmallPlayer(track)).join("")}
      </div>

      <a class="gallery-link" href="playlist.html?id=${character.id}">
        Открыть весь плейлист (${(character.playlist || []).length})
      </a>
    </div>

    <div class="box">
      <h2>Друзья (${(character.friends || []).length})</h2>

      <div class="friends">
        ${(character.friends || []).map(friendId => {
          const friend = getCharacter(friendId);
          if (!friend) return "";

          return `
            <a href="profile.html?id=${friend.id}">
              <img src="${friend.avatar}" alt="${friend.name}">
              <span>${friend.name}</span>
            </a>
          `;
        }).join("")}
      </div>
    </div>

    <div class="box">
      <h2>Фотоальбом</h2>

      <div class="gallery-preview">
        ${(character.gallery || []).slice(0, 6).map(photo => `
          <a href="gallery.html?id=${character.id}">
            <img src="${photo}" alt="Фото ${character.name}">
          </a>
        `).join("")}
      </div>

      <a class="gallery-link" href="gallery.html?id=${character.id}">
        Все фотографии (${(character.gallery || []).length})
      </a>
    </div>

    <div class="box">
      <h2>Архив</h2>
      <div id="miniCalendar"></div>
    </div>
  `;
}

function renderProfileHeader(character) {
  const profileHeader = document.getElementById("profileHeader");

  profileHeader.innerHTML = `
    <h1>${character.name}</h1>

    <div class="profile-info">
      <h3>Информация</h3>

      <table class="info-table">
        <tr>
          <td>Пол</td>
          <td>${character.sex || "Не указано"}</td>
        </tr>

        <tr>
          <td>Отношения</td>
          <td>${character.relationship || "Не указано"}</td>
        </tr>

        <tr>
          <td>Город</td>
          <td>${character.city || "Не указан"}</td>
        </tr>
      </table>
    </div>

    <p class="status">${character.status || ""}</p>
  `;
}

function getProfileItems(character) {
  return [
    ...(character.posts || []).map(post => ({
      type: "post",
      date: post.date,
      content: post
    })),
    ...(character.reposts || []).map(repost => ({
      type: "repost",
      date: repost.date,
      content: repost
    }))
  ];
}

function renderProfilePosts(character, filterDate = null) {
  const profilePosts = document.getElementById("profilePosts");
  if (!profilePosts) return;

  let items = getProfileItems(character);

  if (filterDate !== null) {
    items = items.filter(item => {
      if (!item.date) return false;

      const [day, month, year] = item.date.split(".").map(Number);

      return (
        day === filterDate.day &&
        month === filterDate.month &&
        year === filterDate.year
      );
    });
  }

  if (items.length === 0) {
    profilePosts.innerHTML = `
      <article class="post">
        <p>Записей нет.</p>
      </article>
    `;
    return;
  }

  profilePosts.innerHTML = items.map(item => {
    if (item.type === "post") {
      return createPost(item.content, character);
    }

    return createRepost(item.content, character);
  }).join("");
}

let calendarOffset = 0;

function renderMiniCalendar(character) {
  const container = document.getElementById("miniCalendar");
  if (!container) return;

  const baseDate = new Date();
  const calendarDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + calendarOffset,
    1
  );

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель",
    "Май", "Июнь", "Июль", "Август",
    "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  const week = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const items = getProfileItems(character);

  const activeDays = items
    .filter(item => item.date)
    .map(item => item.date.split(".").map(Number))
    .filter(([day, itemMonth, itemYear]) => {
      return itemMonth === month + 1 && itemYear === year;
    })
    .map(([day]) => day);

  let html = `
    <div class="calendar-nav">
      <button id="prevMonth" type="button">‹</button>
      <div class="calendar-title">${monthNames[month]} ${year}</div>
      <button id="nextMonth" type="button">›</button>
    </div>
  `;

  html += `<div class="calendar-grid">`;

  week.forEach(day => {
    html += `<div class="calendar-week">${day}</div>`;
  });

  const offset = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < offset; i++) {
    html += `<div></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const active = activeDays.includes(day);

    html += `
      <button 
        class="calendar-day ${active ? "has-post" : ""}" 
        type="button"
        data-day="${day}"
        data-month="${month + 1}"
        data-year="${year}">
        ${day}
      </button>
    `;
  }

  html += "</div>";

  html += `
    <button id="showAllPosts" class="show-all-posts" type="button">
      показать все записи
    </button>
  `;

  container.innerHTML = html;

  document.getElementById("prevMonth").onclick = () => {
    calendarOffset--;
    renderMiniCalendar(character);
  };

  document.getElementById("nextMonth").onclick = () => {
    calendarOffset++;
    renderMiniCalendar(character);
  };

  document.querySelectorAll(".calendar-day.has-post").forEach(button => {
    button.addEventListener("click", () => {
      renderProfilePosts(character, {
        day: Number(button.dataset.day),
        month: Number(button.dataset.month),
        year: Number(button.dataset.year)
      });
    });
  });

  document.getElementById("showAllPosts").onclick = () => {
    renderProfilePosts(character);
  };
}

function renderGalleryPage() {
  const galleryHeader = document.getElementById("galleryHeader");
  const galleryGrid = document.getElementById("galleryGrid");
  const gallerySidebar = document.getElementById("gallerySidebar");

  if (!galleryHeader || !galleryGrid || !gallerySidebar) return;

  const character = getCurrentCharacter();

  if (!character) {
    galleryHeader.innerHTML = "<h1>Фотоальбом не найден</h1>";
    return;
  }

  const photos = character.gallery || [];

  gallerySidebar.innerHTML = createSimpleSidebar(character);

  galleryHeader.innerHTML = `
    <h1>Фото ${character.name}</h1>
    <p class="gallery-count">Всего фотографий: ${photos.length}</p>
  `;

  galleryGrid.innerHTML = photos.map(photo => `
    <img class="gallery-photo" src="${photo}" alt="Фото ${character.name}">
  `).join("");

  setupPhotoModal();
}

function renderPlaylistPage() {
  const playlistHeader = document.getElementById("playlistHeader");
  const playlistList = document.getElementById("playlistList");
  const playlistSidebar = document.getElementById("playlistSidebar");

  if (!playlistHeader || !playlistList || !playlistSidebar) return;

  const character = getCurrentCharacter();

  if (!character) {
    playlistHeader.innerHTML = "<h1>Плейлист не найден</h1>";
    return;
  }

  const tracks = character.playlist || [];

  playlistSidebar.innerHTML = createSimpleSidebar(character);

  playlistHeader.innerHTML = `
    <h1>Музыка ${character.name}</h1>
    <p class="gallery-count">Всего треков: ${tracks.length}</p>
  `;

  playlistList.innerHTML = tracks.map((track, index) => `
    <div class="playlist-page-track custom-track">
      <div class="track-number">${index + 1}</div>

      <div class="track-info">
        ${createSmallPlayer(track)}
      </div>
    </div>
  `).join("");

  setupCustomPlayers();
}

function createSimpleSidebar(character) {
  return `
    <div class="profile-card">
      <img class="big-avatar" src="${character.avatar}" alt="${character.name}">
      <h2>${character.name}</h2>
      <p class="online-status">● Сейчас онлайн</p>
    </div>

    <div class="box">
      <h2>Навигация</h2>
      <p><a href="profile.html?id=${character.id}">← Вернуться в профиль</a></p>
      <p><a href="feed.html">← Общая лента</a></p>
    </div>
  `;
}

function setupPhotoModal() {
  const modal = document.getElementById("photoModal");
  const modalImage = document.getElementById("modalImage");
  const closeModal = document.getElementById("closeModal");

  if (!modal || !modalImage || !closeModal) return;

  document.querySelectorAll(".gallery-photo").forEach(photo => {
    photo.onclick = () => {
      modalImage.src = photo.src;
      modal.classList.remove("hidden");
    };
  });

  closeModal.onclick = event => {
    event.stopPropagation();
    modal.classList.add("hidden");
    modalImage.src = "";
  };

  modal.onclick = event => {
    if (event.target === modal) {
      modal.classList.add("hidden");
      modalImage.src = "";
    }
  };
}

function setupCustomPlayers() {
  const tracks = document.querySelectorAll(".custom-track");

  tracks.forEach(track => {
    const audio = track.querySelector(".custom-audio");
    const playButton = track.querySelector(".play-button");
    const seekBar = track.querySelector(".seek-bar");
    const volumeBar = track.querySelector(".volume-bar");
    const currentTimeText = track.querySelector(".current-time");
    const durationText = track.querySelector(".duration");

    if (!audio || !playButton || !seekBar || !volumeBar) return;

    audio.volume = volumeBar.value / 100;

    audio.addEventListener("loadedmetadata", () => {
      durationText.textContent = formatTime(audio.duration);
    });

    playButton.addEventListener("click", () => {
      document.querySelectorAll(".custom-audio").forEach(otherAudio => {
        if (otherAudio !== audio) {
          otherAudio.pause();

          const otherTrack = otherAudio.closest(".custom-track");
          const otherButton = otherTrack.querySelector(".play-button");

          if (otherButton) otherButton.textContent = "▶";
        }
      });

      if (audio.paused) {
        audio.play();
        playButton.textContent = "Ⅱ";
      } else {
        audio.pause();
        playButton.textContent = "▶";
      }
    });

    audio.addEventListener("timeupdate", () => {
      if (!audio.duration) return;

      seekBar.value = (audio.currentTime / audio.duration) * 100;
      currentTimeText.textContent = formatTime(audio.currentTime);
    });

    seekBar.addEventListener("input", () => {
      if (!audio.duration) return;

      audio.currentTime = (seekBar.value / 100) * audio.duration;
    });

    volumeBar.addEventListener("input", () => {
      audio.volume = volumeBar.value / 100;
    });

    audio.addEventListener("ended", () => {
      playButton.textContent = "▶";
      seekBar.value = 0;
      currentTimeText.textContent = "0:00";
    });
  });
}

function renderRelationsPage() {
  const relationsHeader = document.getElementById("relationsHeader");
  const relationsMap = document.getElementById("relationsMap");
  const relationsSidebar = document.getElementById("relationsSidebar");

  if (!relationsHeader || !relationsMap || !relationsSidebar) return;

  const character = getCurrentCharacter();

  if (!character) {
    relationsHeader.innerHTML = "<h1>Карта связей не найдена</h1>";
    return;
  }

  const relations = character.relations || [];

  relationsSidebar.innerHTML = createSimpleSidebar(character);

  relationsHeader.innerHTML = `
    <h1>Карта связей: ${character.name}</h1>
    <p class="gallery-count">Связей: ${relations.length}</p>
  `;

  relationsMap.innerHTML = `
    <div class="relations-map">
      <div class="center-person">
        <img src="${character.avatar}" alt="${character.name}">
        <strong>${character.name}</strong>
      </div>

      <div class="relations-list">
        ${relations.map(relation => {
          const relatedCharacter = getCharacter(relation.character);

          if (!relatedCharacter) return "";

          return `
            <div class="relation-card">
              <a class="relation-person" href="profile.html?id=${relatedCharacter.id}">
                <img src="${relatedCharacter.avatar}" alt="${relatedCharacter.name}">
                <span>${relatedCharacter.name}</span>
              </a>

              <div class="relation-line">
                <span>${relation.type}</span>
              </div>

              <p>${relation.note || ""}</p>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderProfileRightbar(character) {
  const profileRightbar = document.getElementById("profileRightbar");

  if (!profileRightbar) return;

  const relations = character.relations || [];

  profileRightbar.innerHTML = `
    <div class="box">
      <h2>Карта связей</h2>

      ${
        relations.length > 0
          ? relations.map(relation => {
              const relatedCharacter = getCharacter(relation.character);

              if (!relatedCharacter) return "";

              return `
                <div class="relation-mini-card">
                  <a href="profile.html?id=${relatedCharacter.id}">
                    <img src="${relatedCharacter.avatar}" alt="${relatedCharacter.name}">
                    <span>${relatedCharacter.name}</span>
                  </a>

                  <div class="relation-mini-type">${relation.type}</div>

                  ${relation.note ? `<p>${relation.note}</p>` : ""}
                </div>
              `;
            }).join("")
          : "<p>Связи пока не указаны.</p>"
      }

      <a class="gallery-link" href="relations.html?id=${character.id}">
        Открыть карту полностью →
      </a>
    </div>
  `;
}

function createNewsPost(item) {
  return `
    <article class="post news-post">
      <div class="news-label">важное объявление</div>

      <h2>${item.title}</h2>

      <p class="post-text">${item.text}</p>

      ${item.image ? `<img class="post-image" src="${item.image}" alt="${item.title}">` : ""}

      <div class="tags">
        ${(item.tags || []).map(tag => `<span># ${tag}</span>`).join("")}
      </div>

      <div class="date">${formatPostDate(item.date)}</div>
    </article>
  `;
}

function renderNewsFeed() {
  const newsFeed = document.getElementById("newsFeed");
  if (!newsFeed) return;

  newsFeed.innerHTML = (news || [])
    .map(item => createNewsPost(item))
    .join("");
}

if (document.getElementById("feed")) {
  renderSuggestions();
  renderFeed();
}

if (document.getElementById("newsFeed")) {
  renderNewsFeed();
}

if (document.getElementById("profileHeader")) {
  renderProfile();
}

if (document.getElementById("galleryHeader")) {
  renderGalleryPage();
}

if (document.getElementById("playlistHeader")) {
  renderPlaylistPage();
}

if (document.getElementById("relationsHeader")) {
  renderRelationsPage();
}
