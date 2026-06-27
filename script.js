function getCharacter(id) {
  return characters.find(character => character.id === id);
}

function getPostById(characterId, postId) {
  const character = getCharacter(characterId);

  if (!character) return null;

  const post = character.posts.find(post => post.id === postId);

  if (!post) return null;

  return {
    post,
    author: character
  };
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
        ${post.tags.map(tag => `<span># ${tag}</span>`).join("")}
      </div>

      <div class="date">${post.date}</div>

      ${post.comments && post.comments.length > 0 ? `
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
      ` : ""}
    </article>
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

      <div class="date">${repost.date}</div>
    </article>
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

  const allPosts = [];

  characters.forEach(character => {
  character.posts.forEach(post => {
    allPosts.push({
      type: "post",
      post,
      author: character
    });
  });

  (character.reposts || []).forEach(repost => {
    allPosts.push({
      type: "repost",
      repost,
      author: character
    });
  });
});

 feed.innerHTML = allPosts
  .map(item => {
    if (item.type === "post") {
      return createPost(item.post, item.author);
    }

    return createRepost(item.repost, item.author);
  })
  .join("");
}

function renderProfile() {
  const profileHeader = document.getElementById("profileHeader");
  const profileSidebar = document.getElementById("profileSidebar");
  const profilePosts = document.getElementById("profilePosts");

  if (!profileHeader || !profileSidebar || !profilePosts) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "elen";
  const character = getCharacter(id);

  if (!character) {
    profileHeader.innerHTML = "<h1>Персонаж не найден</h1>";
    return;
  }

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
      <b>${character.posts.length}</b>
      <span>Записей</span>
    </div>

    <div>
      <b>${(character.gallery || []).length}</b>
      <span>Фото</span>
    </div>

    <div>
      <b>${character.friends.length}</b>
      <span>Друзей</span>
    </div>

    <div>
      <b>${character.posts.reduce((sum, post) => sum + ((post.comments || []).length), 0)}</b>
      <span>Комментариев</span>
    </div>
  </div>
</div>

<div class="box">
  <h2>Плейлист</h2>

  <div class="playlist">
    ${(character.playlist || []).map((track, index) => `
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
    `).join("")}
  </div>
</div>

  <div class="box">
    <h2>О себе</h2>
    ${character.about.map(item => `<p>• ${item}</p>`).join("")}
  </div>

  <div class="box">

<h2>Фотоальбом</h2>

<div class="gallery-preview">

${(character.gallery || []).slice(0,6).map(photo=>`

<img src="${photo}">

`).join("")}

</div>

<a class="gallery-link" href="gallery.html?id=${character.id}">
Все фотографии (${(character.gallery || []).length})
</a>

</div>

  <div class="box">
    <h2>Друзья (${character.friends.length})</h2>
    <div class="friends">
      ${character.friends.map(friendId => {
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
`;

  profileHeader.innerHTML = `
    <h1>${character.name}</h1>

    <div class="profile-info">

    <h3>Информация</h3>

    <table class="info-table">

        <tr>
            <td>Пол</td>
            <td>${character.sex}</td>
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

    <p class="status">${character.status}</p>
  `;

  const profileItems = [
  ...character.posts.map(post => ({
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

profilePosts.innerHTML = profileItems
  .map(item => {
    if (item.type === "post") {
      return createPost(item.content, character);
    }

    return createRepost(item.content, character);
  })
  .join("");
}

if (document.getElementById("feed")) {
    renderSuggestions();
    renderFeed();
}

if (document.getElementById("profileHeader")) {
  renderProfile();
  setupCustomPlayers();
}

function renderGalleryPage() {
  const galleryHeader = document.getElementById("galleryHeader");
  const galleryGrid = document.getElementById("galleryGrid");
  const gallerySidebar = document.getElementById("gallerySidebar");

  if (!galleryHeader || !galleryGrid || !gallerySidebar) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "elen";
  const character = getCharacter(id);

  if (!character) {
    galleryHeader.innerHTML = "<h1>Фотоальбом не найден</h1>";
    return;
  }

  const photos = character.gallery || [];

  gallerySidebar.innerHTML = `
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

  galleryHeader.innerHTML = `
    <h1>Фото ${character.name}</h1>
    <p class="gallery-count">Всего фотографий: ${photos.length}</p>
  `;

  galleryGrid.innerHTML = photos.map(photo => `
    <img class="gallery-photo" src="${photo}" alt="Фото ${character.name}">
  `).join("");

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

  closeModal.onclick = (event) => {
    event.stopPropagation();
    modal.classList.add("hidden");
    modalImage.src = "";
  };

  modal.onclick = (event) => {
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

    function formatTime(seconds) {
      if (isNaN(seconds)) return "0:00";

      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60).toString().padStart(2, "0");

      return `${minutes}:${secs}`;
    }

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

renderSuggestions();
renderFeed();
renderProfile();
renderGalleryPage();
setupPhotoModal();
setupCustomPlayers();
