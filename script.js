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
    <img class="big-avatar" src="${character.avatar}" alt="${character.name}">
    
    <div class="box">
      <h2>Обо мне</h2>
      ${character.about.map(item => `<p>${item}</p>`).join("")}
    </div>

    <div class="box">
      <h2>Друзья</h2>
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

    <div class="info">
      <span><b>Пол</b> ${character.sex}</span>
      <span><b>Статус отношений</b> ${character.relationship || "Не указано"}</span>
      <span><b>Город</b> ${character.birthday}</span>
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

  setupPostForm(character);
}

if (document.getElementById("feed")) {
    renderSuggestions();
    renderFeed();
}

if (document.getElementById("profileHeader")) {
    renderProfile();
  
}
