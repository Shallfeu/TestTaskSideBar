const URL = 'https://dummyjson.com/products';
const FIELDS = ['title', 'description', 'price'];

const fetchData = async (limit = 10) => {
  const response = await fetch(`${URL}?limit=${limit}`);
  const data = await response.json();
  return data;
};

const renderDropDown = (barItem, item, fields) => {
  const dropBar = document.createElement('ul');
  dropBar.classList = 'dropdown-content';

  for (let field in item) {
    if (fields.includes(field)) {
      const dropDownItem = document.createElement('li');
      dropDownItem.classList = 'dropdown-content__item';
      dropDownItem.innerHTML = `${field}: ${item[field]}`;
      dropBar.appendChild(dropDownItem);
    }
  }

  barItem.appendChild(dropBar);
};

const renderSideBar = async (products, root) => {
  let sideBar = document.createElement('ul');
  sideBar.classList = 'bar__list';
  // Рендерим эл-ты списка
  for (let el of products) {
    const barItem = document.createElement('li');
    barItem.classList = 'bar__item';
    barItem.innerHTML = el.title;
    renderDropDown(barItem, el, FIELDS);
    sideBar.appendChild(barItem);
  }

  root.appendChild(sideBar);
};

const changeValue = () => {
  const input = document.getElementById('limit');
  const inputBtn = document.querySelector('.limit__btn');
  inputBtn.addEventListener('click', () => {
    localStorage.setItem('entity', input.value);
    location.reload();
  });
  const entity = localStorage.getItem('entity') ? localStorage.getItem('entity') : 10;
  input.value = entity;
  return entity;
};

const start = async () => {
  const root = document.getElementById('root');
  const entity = changeValue();

  // Забираем данные
  const data = await fetchData(entity);
  const products = data.products;

  const sortNameBtn = document.getElementById('name');
  sortNameBtn.addEventListener('click', async () => {
    const sortedProducts = products.sort(
      (a, b) => a.title.toLowerCase().charCodeAt(0) - b.title.toLowerCase().charCodeAt(0),
    );
    document.querySelector('.bar__list').remove();
    await renderSideBar(sortedProducts, root);
  });

  const sortPriceBtn = document.getElementById('price');
  sortPriceBtn.addEventListener('click', async () => {
    const sortedProducts = products.sort((a, b) => a['price'] - b['price']);
    document.querySelector('.bar__list').remove();
    await renderSideBar(sortedProducts, root);
  });

  // Рендерим основное меню
  await renderSideBar(products, root);

  const listElement = document.querySelector('.bar__list');
  const elements = listElement.querySelectorAll('.bar__item');

  // Перебираем все элементы списка и присваиваем нужное значение
  for (const el of elements) {
    el.draggable = true;
  }

  listElement.addEventListener(`dragstart`, (evt) => {
    evt.target.classList.add(`selected`);
  });

  listElement.addEventListener(`dragend`, (evt) => {
    evt.target.classList.remove(`selected`);
  });

  listElement.addEventListener(`dragover`, (evt) => {
    // Разрешаем сбрасывать элементы в эту область
    evt.preventDefault();

    // Находим перемещаемый элемент
    const activeElement = listElement.querySelector(`.selected`);
    // Находим элемент, над которым в данный момент находится курсор
    const currentElement = evt.target;
    // Проверяем, что событие сработало:
    // 1. не на том элементе, который мы перемещаем,
    // 2. именно на элементе списка
    const isMoveable =
      activeElement !== currentElement && currentElement.classList.contains(`bar__item`);

    // Если нет, прерываем выполнение функции
    if (!isMoveable) {
      return;
    }

    // Находим элемент, перед которым будем вставлять
    const nextElement =
      currentElement === activeElement.nextElementSibling
        ? currentElement.nextElementSibling
        : currentElement;

    // Вставляем activeElement перед nextElement
    listElement.insertBefore(activeElement, nextElement);
  });

  const getNextElement = (cursorPosition, currentElement) => {
    // Получаем объект с размерами и координатами
    const currentElementCoord = currentElement.getBoundingClientRect();
    // Находим вертикальную координату центра текущего элемента
    const currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2;

    // Если курсор выше центра элемента, возвращаем текущий элемент
    // В ином случае — следующий DOM-элемент
    const nextElement =
      cursorPosition < currentElementCenter ? currentElement : currentElement.nextElementSibling;

    return nextElement;
  };

  listElement.addEventListener(`dragover`, (evt) => {
    evt.preventDefault();

    const activeElement = listElement.querySelector(`.selected`);
    const currentElement = evt.target;
    const isMoveable =
      activeElement !== currentElement && currentElement.classList.contains(`bar__item`);

    if (!isMoveable) {
      return;
    }

    // evt.clientY — вертикальная координата курсора в момент,
    // когда сработало событие
    const nextElement = getNextElement(evt.clientY, currentElement);

    // Проверяем, нужно ли менять элементы местами
    if (
      (nextElement && activeElement === nextElement.previousElementSibling) ||
      activeElement === nextElement
    ) {
      // Если нет, выходим из функции, чтобы избежать лишних изменений в DOM
      return;
    }

    listElement.insertBefore(activeElement, nextElement);
  });
};

start();
