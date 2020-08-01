'use strict';

const EVENT_MAPPING = { left: 'dislike', up: 'superlike', right: 'like' };
const MOVE_THRESHOLD = 100;
const TIME_SHRESHOLD = 500;

const supportsWebP = (function() {
  return new Promise(function(resolve) {
    const image = new Image();
    image.onerror = () => resolve(false);
    image.onload = () => resolve(image.width === 1);
    image.src =
      'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  }).catch(() => false);
})();

let app;

class App {
  constructor(model) {
    this.workspace = document.getElementById('workspace');
    this.model = model;
    this.isBlocked = false;
    this.currentUser = -1;

    const firstCard = this.next();
    this.addSwipeListener(firstCard);
    this.workspace.appendChild(firstCard);

    this.model.forEach(user => {
      new Image().src = App.preloadImgSrc(user);
    });
  }

  static preloadImgSrc(user) {
    const ext = supportsWebP ? 'webp' : 'jpg';

    return `img/${user.img}.${ext}`;
  }

  buildPictureNode(user) {
    const webpNode = document.createElement('source');
    webpNode.setAttribute('srcset', `img/${user.img}.webp 400w, img/${user.img}-x2.webp 800w`);
    webpNode.setAttribute('type', 'image/webp');

    const jpgNode = document.createElement('source');
    jpgNode.setAttribute('srcset', `img/${user.img}.jpg 400w, img/${user.img}-x2.jpg 800w`);
    jpgNode.setAttribute('type', 'image/jpeg');

    const imgNode = document.createElement('img');
    imgNode.setAttribute('src', `img/${user.img}-x2.jpg`);
    imgNode.setAttribute('alt', `Фото ${user.name}`);
    imgNode.setAttribute('title', `Фото ${user.name}`);
    imgNode.classList.add('card__photo');

    const pictureNode = document.createElement('picture');
    pictureNode.append(webpNode, jpgNode, imgNode);

    return pictureNode;
  }

  addSwipeListener(node) {
    handleSwipe(node, swipeType => {
      const action = EVENT_MAPPING[swipeType];
      if (action) {
        this.grade(action);
      }
    });
  }

  next() {
    if (++this.currentUser === this.model.length) {
      this.currentUser = 0;
    }
    const newUser = this.model[this.currentUser];

    const cardNode = document.createElement('div');
    cardNode.classList.add('card');
    if (!this.currentUser) {
      cardNode.classList.add('card_current');
    }

    const pictureNode = this.buildPictureNode(newUser);

    const detailsNode = document.createElement('div');
    detailsNode.classList.add('card__details');

    const nameNode = document.createElement('h1');
    nameNode.classList.add('card__name');
    nameNode.append(newUser.name);

    const ageNode = document.createElement('span');
    ageNode.classList.add('card__age');
    ageNode.append(newUser.age);

    const bioNode = document.createElement('p');
    bioNode.classList.add('card__bio');
    bioNode.append(newUser.description);

    nameNode.appendChild(ageNode);
    detailsNode.append(nameNode, bioNode);
    cardNode.append(pictureNode, detailsNode);

    return cardNode;
  }

  dismiss(choice) {
    const currentCard = this.workspace.getElementsByClassName('card_current')[0];
    const newCard = this.next();

    newCard.classList.add('card_current');
    this.addSwipeListener(newCard);
    this.workspace.insertBefore(newCard, currentCard);

    currentCard.classList.remove('card_current');
    currentCard.classList.add(`card_${choice}d`);
    currentCard.addEventListener('animationend', () => {
      currentCard.remove();
      this.isBlocked = false;
    });
  }

  grade(choice) {
    if (!this.isBlocked) {
      this.isBlocked = true;
      this.dismiss(choice);
    }
  }
}

function handleSwipe(element, callback) {
  let startX;
  let startY;
  let startTime;

  element.addEventListener('touchstart', e => {
    startX = e.changedTouches[0].pageX;
    startY = e.changedTouches[0].pageY;
    startTime = new Date().getTime();

    e.preventDefault();
  });

  element.addEventListener('touchmove', e => {
    e.preventDefault();
  });

  element.addEventListener('touchend', e => {
    const deltaX = e.changedTouches[0].pageX - startX;
    const deltaY = e.changedTouches[0].pageY - startY;
    const deltaXAbs = Math.abs(deltaX);
    const deltaYAbs = Math.abs(deltaY);
    const deltaTime = new Date().getTime() - startTime;

    if (deltaTime <= TIME_SHRESHOLD) {
      let swipeType;
      if (deltaXAbs >= MOVE_THRESHOLD && deltaYAbs <= MOVE_THRESHOLD) {
        swipeType = deltaX < 0 ? 'left' : 'right';
      } else if (deltaYAbs >= MOVE_THRESHOLD && deltaXAbs <= MOVE_THRESHOLD) {
        swipeType = deltaY < 0 ? 'up' : 'down';
      }
      callback(swipeType);
    }

    e.preventDefault();
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const users = [
    {
      name: 'Бет',
      img: 'beth',
      age: '10 месяцев',
      description: 'Обнимашки, пицца, мемы'
    },
    {
      name: 'Кэролин',
      img: 'caroline',
      age: '11 месяцев',
      description: 'Использую СвиноТиндер, чтобы периодически чистить дисплей телефона'
    },
    {
      name: 'Диана',
      img: 'diana',
      age: '9 месяцев',
      description: 'Это могли бы быть мы с тобой, но ты мне не пишешь'
    },
    {
      name: 'Глория',
      img: 'gloria',
      age: '2 года',
      description: 'Чай — это суп из листьев.'
    },
    {
      name: 'Джуна',
      img: 'juna',
      age: '8 месяцев',
      description: 'пишите кто умеет писать'
    },
    {
      name: 'Кейт',
      img: 'kate',
      age: '1 год 4 месяца',
      description: 'Смотрю на того, кто поставил мне дизлайк. Не шевелись.'
    },
    {
      name: 'Лиза',
      img: 'lisa',
      age: '4 года',
      description: 'Я иногда моргаю, люблю дышать'
    },
    {
      name: 'Люси',
      img: 'lucy',
      age: '1 год',
      description: 'Подошёл, уверенно взял за руку'
    },
    {
      name: 'Рокси',
      img: 'roxy',
      age: '3 года',
      description: 'Люблю хурму'
    },
    {
      name: 'Саманта',
      img: 'samantha',
      age: '1 год',
      description:
        'Учёные были в шоке! Оказывается, если не свайпать вправо, в организме появляются...'
    }
  ];
  app = new App(users);

  for (const action of Object.values(EVENT_MAPPING)) {
    document.getElementById(`${action}-button`).addEventListener('click', () => {
      app.grade(action);
    });
  }
});
