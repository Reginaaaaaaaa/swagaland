const characters = [
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
        text: "---",
        image: "",
        tags: ["-", "--"],
        music: null,
        date: "27.05.2026"
      }
    ]
  },
  {
    id: "Freya",
    name: "Фрейя Хальгрен",
    avatar: "images/avatars/loren.jpg",
    sex: "женский",
    relationship: "ЫЫЫЫЫЫ",
    city: "Не указано",
    status: "Рисую то, что не умеет молчать.",
    about: [
      "Краски повсюду",
      "Люблю утро только на картинах",
      "Мечтаю о большой мастерской"
    ],
    friends: ["elen"],
    posts: [
      {
        text: "Новый скетч. Кажется, он смотрит на меня первым.",
        image: "images/posts/loren-post-1.jpg",
        tags: ["Арт", "Скетч"],
        music: null,
        date: "26.05.2026"
      }
    ]
  }
];
