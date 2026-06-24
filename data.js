const characters = [
  {
    id: "elen",
    name: "Элен Мур",
    avatar: "images/avatars/elen.jpg",
    sex: "женский",
    position: "Финансовый аудитор",
    birthday: "8 января",
    status: "Каждый несет в себе Тень, и чем меньше она воплощена в сознательной жизни индивида, тем она чернее и плотнее.",
    about: [
      "Люблю дождь",
      "Немного ночная сова",
      "Meow :3"
    ],
    friends: ["william", "mortenax", "loren"],
    posts: [
      {
        text: "На улице дождь, а Альва передает вам доброе утро ☁",
        image: "images/posts/elen-post-1.jpg",
        tags: ["Ленивое утро", "Лапки", "Альва"],
        music: {
          title: "Soft Rain",
          file: "music/soft-rain.mp3"
        },
        date: "29.05.2026"
      },
      {
        text: "Сегодня идеальный день, чтобы спрятаться под пледом и делать вид, что мир не загрузился.",
        image: "",
        tags: ["Дождь", "Настроение"],
        music: null,
        date: "30.05.2026"
      }
    ]
  },
  {
    id: "william",
    name: "Виллиам Николз",
    avatar: "images/avatars/william.jpg",
    sex: "мужской",
    position: "Архивариус",
    birthday: "14 марта",
    status: "Иногда молчание говорит громче любых признаний.",
    about: [
      "Люблю старые книги",
      "Пью чай слишком драматично",
      "Не доверяю солнечным дням"
    ],
    friends: ["elen", "mortenax"],
    posts: [
      {
        text: "Нашел старую запись. Не уверен, что хотел ее найти.",
        image: "images/posts/william-post-1.jpg",
        tags: ["Архив", "Тайны"],
        music: null,
        date: "28.05.2026"
      }
    ]
  },
  {
    id: "mortenax",
    name: "Мортенакс Блэйд",
    avatar: "images/avatars/mortenax.jpg",
    sex: "мужской",
    position: "Исследователь",
    birthday: "22 октября",
    status: "Некоторые двери лучше не открывать. Поэтому я их и открываю.",
    about: [
      "Хожу там, где не надо",
      "Собираю странные истории",
      "Сплю редко"
    ],
    friends: ["elen", "william"],
    posts: [
      {
        text: "Если карта не показывает место, значит оно самое интересное.",
        image: "",
        tags: ["Путь", "Запретное"],
        music: null,
        date: "27.05.2026"
      }
    ]
  },
  {
    id: "loren",
    name: "Лорен Наполи",
    avatar: "images/avatars/loren.jpg",
    sex: "женский",
    position: "Художница",
    birthday: "3 июня",
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
