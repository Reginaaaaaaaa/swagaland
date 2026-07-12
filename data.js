let characters = [
  {
    id: "Felix",
    name: "Феликс Стрейн",
    avatar: "images/avatars/Felix_avatar.png",
    sex: "мужской",
    relationship: "ЫЫЫЫЫЫ",
    city: "Не указано",
    status: "рэп баттл это моя жизнь",
    about: [
      "Рэпер",
      "Скейтер",
      "Можете просить автограф уже сейчас"
    ],
    friends: ["Brianna", "Nandi", "Freya"],

    relations: [
  {
    character: "Brianna",
    type: "Дружба",
    note: "лучшие друзья и соучастники хаоса"
  },
  {
    character: "Nandi",
    type: "Дружба",
    note: "рэп-братство"
  },
  {
    character: "Freya",
    type: "Знакомые",
    note: "общаются через общий круг"
  }
],
    
    gallery: [
      "images/gallery/Felix_Post2.png",
      "images/gallery/Felix_Post.jpg"
    ],

    playlist: [
  {
    artist: "Britney Spears",
    title: "Toxic",
    file: "music/Toxic.mp3"
    }
  ],
    
    posts: [
      {
        id: "Felix_Post2",
        text: "Да, наша компания друзей пусть и небольшая, зато мы все с серьезными отклонениями!",
        image: "images/posts/Felix_Post2.png",
        tags: ["Дружба", "ПомойкаГэнг"],
        music: null,
        date: "24.06.2026"
      },
      {
        text: "Хайповых вайбов в ваш дом",
        image: "images/posts/Felix_Post.jpg",
        tags: ["Сваганосцы", "Биф_Машины"],
        music: {
          title: "Soft Rain",
          file: "music/soft-rain.mp3"
        },
        date: "29.05.2026",
        comments: [
          {
            author: "Nandi",
            text: "Вечной сваги тебе, бро!"
          }
        ]
    },
    ]
  },
  {
    id: "Brianna",
    name: "Бри Миллер",
    avatar: "images/avatars/Bri_avatar.png",
    sex: "женский",
    relationship: "ЫЫЫЫЫЫ",
    city: "Не указано",
    status: "---",
    about: [
      "----"
    ],
    friends: ["Felix", "Nandi", "Freya"],

     reposts: [
    {
      fromCharacter: "Felix",
      postId: "Felix_Post2",
      comment: null,
      date: "24.06.2026"
    }
  ],
    
    posts: [
    ]
  },
  {
    id: "Nandi",
    name: "Нанди Сьюэлл",
    avatar: "images/avatars/Nandi_avatar.png",
    sex: "мужской",
    relationship: "ЫЫЫЫЫЫ",
    city: "Не указано",
    status: "----",
    about: [
      "----",
    ],
    friends: ["Felix", "Freya", "Brianna"],

    reposts: [
    {
      fromCharacter: "Felix",
      postId: "Felix_Post2",
      comment: null,
      date: "24.06.2026"
    }
  ],
    
    posts: [
      {
        text: null,
        image: "images/posts/Nandi_Post.png",
        tags: ["БингБонг", "НетНаркотикам"],
        music: null,
        date: "29.06.2026"
      }
    ]
  },
  {
    id: "Freya",
    name: "Фрейя Хальгрен",
    avatar: "images/avatars/Freya_avatar.png",
    sex: "женский",
    relationship: "ЫЫЫЫЫЫ",
    city: "Не указано",
    status: "---",
    about: [
      "---"
    ],
    friends: ["Felix", "Brianna", "Nandi"],
    posts: [
      {
        text: "-",
        image: "images/posts/loren-post-1.jpg",
        tags: ["--"],
        music: null,
        date: "26.05.2026"
      }
    ]
  },
  {
    id: "Jane",
    name: "Джейн Роуз",
    avatar: "images/avatars/--.png",
    sex: "женский",
    relationship: "ЫЫЫЫЫЫ",
    city: "Не указано",
    status: "---",
    about: [
      "23 года",
      "тату-мастер"
    ],
    friends: ["Felix", "Brianna", "Nandi", "Freya"],
    posts: [
      {
        text: "-",
        image: "images/posts/loren-post-1.jpg",
        tags: ["--"],
        music: null,
        date: "26.05.2026"
      }
    ]
  }
];

let news = [
  {
    title: "Открытие сайта",
    text: "Добро пожаловать в блог. Здесь будут появляться важные новости, анонсы и обновления проекта.",
    date: "28.06.2026",
    tags: ["анонс", "сайт"],
    image: ""
  },
  {
    title: "Добавлены профили персонажей",
    text: "Теперь у каждого персонажа есть личная страница, посты, друзья, фотоальбом и плейлист.",
    date: "28.06.2026",
    tags: ["обновление"],
    image: ""
  }
];

const sitePlaylist = [
  {
    artist: "Britney Spears",
    title: "Toxic",
    file: "music/Toxic.mp3"
  },
  {
    artist: "Example Artist",
    title: "Example Song",
    file: "music/Toxic.mp3"
  }
];
