# Проектная работа "Веб-ларек"
 

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
## Данные и типы данных, используемые в приложении

### Карточка товара
```
export interface ICard {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}
```

### Результат заказа
```
export interface IOrderResult {
	id: string[];
	total: number;
	error?: string;
}
```

### Интерфейс оформления заказа
```
export interface IOrder {
    payment: PaymentType;
    address: string;
    email: string;
    number: string;
    total: number;
    items: string[];
}
```

### Данные в корзине
```
export interface IOrder {
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}
```

### Данные товара в карточке
```
export type TCardInfo = Pick<
	IProduct,
	'category' | 'title' | 'image' | 'price'
>;
```

### Данные товара в попапе открытя карточки
```
export type TCardPopup = Pick<
	ICard,
	'category' | 'title' | 'image' | 'price' | 'description'
>;
```

### Данные товара в попапе корзины
```
export type TBasketPopup = Pick<ICard, 'title' | 'price'>;
```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:
- слой представления, отвечает за отображение данных на странице,
- слой данных, отвечает за хранение и изменение данных
- презентер, отвечает за связь представления и данных.

### Базовый код

#### Класс Component<T>
Базовый класс для компонентов интерфейса,  реализует методы изменения текста, изображения, переключение класса.
Класс является дженериком и в переменной Т принимает тип данных компонентов.
Конструктор принимает элемент с которым будет происходить взаимодействие.
`constructor(container: HTMLElement)` - принимает элемент контейнера, в который будет помещен компонент.
Методы:
- `setText`, `setImage`, `toggleClass` для изменения состояния элементов.
- `render` для заполнения свойств элемента и получения его в формате HTMLElement.

#### Класс Model<T>
Реализует методы отслеживания изменений компонентов.
Конструктор принимает компонент для отслеживания.
Методы:
- `emitChanges` сообщает об изменение модели

#### Класс Арі
Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы:
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.
- `handleResponse` - это метод, который используется для обработки ответа от сервера. Он вызывается после выполнения запроса и позволяет изменить или дополнить ответ перед его отправкой клиенту.

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие

### Слой данных

#### Класс BasketUI
Класс отвечает за отображение корзины
Конструктор класса принимает HTMLElement и экземпляр класса EventEmitter для инициации событий при изменении данных.
В полях класса хранятся следующие данные:
- `total` - общая стоимость товаров в корзине
- `items` - список товаров в корзине

Также класс предоставляет набор методов для взаимодействия с этими данными.
 - `getBasketItems(): IBasketItem[] | null` - возвращает массив товаров корзины
 - `getBasketItem(basketItemId: string): IBasketItem`  - возвращает карточку товара в корзине по её id
 - `deleteBasketItem(basketItemId: string, payload: Function | null): void` - удаляет продукт из корзины
 - `createOrder(order: IOrder):IOrderResult` - оформление заказа
 - `validateOrder(field: keyof IOrder):boolean` - валидация форм заказа

 #### Класс Form<T>
Абстрактный класс наследуемый от абстрактного класса Component для создания формы, ее отображения и управления.
Конструктор на вход принимает HTMLFormElement и EventEmitter для взаимодействия с другими компонентами.
Ключевые свойства и методы:
- `valid` - переключатель доступности кнопки submit формы
- `errors` - ошибки полученные при валидации формы
- `render()` - метод для отображения формы в контейнере
- `onInputChange()` - метод реагирующий на изменение инпутов формы
- `onInputChange` - для отслеживания изменения свойств формы.
- `render` - для заполнения свойств элемента и получения его в формате HTMLElement.

#### Класс Modal
Класс отвечает за отображение попапа (модального окна)
Конструктор класса принимает HTMLElement для отображения в попапе и EventEmitter для взаимодействия с другими компонентами.
В полях класса хранятся следующие данные:
- `content: HTMLElement` - компонент который отображается в модальном окне
- `open()` открыть модальное окно
- `close()` закрыть модальное окно
- `render()` отобразить модальное окно в компоненте

#### OrderForm
Выполняет функцию отображения заказа в контейнере и управления им.
Конструктор на вход принимает HTMLElement (шаблон страницы заказа) и action - действия на кнопку.
Если в шаблоне присутствуют кнопки с специальным стилем button_alt то реагирует на их изменение (по типу радио).
В полях класса хранятся следующие данные:
- `payment` - способ оплаты заказчиком
- `address` - адрес заказчика
- `email` - электронная почта заказчика
- `phone` - номер телефона заказчика

#### Класс Page
Выполняет функцию отображения главной страницы приложения.
Конструктор на вход принимает HTMLElement (body) и EventEmitter для взаимодействия с другими компонентами.
В полях класса хранятся следующие данные:
- `counter` - счетчик товаров в корзине
- `catalog` - католог с карточками товаров
- `locked` - состояние блокировки прокрутки страницы

#### Класс Product
Отвечает за отображение карточки продукта и используется для отображения на странице сайта.
Выполняет функцию шаблона продукта, управления им и отображением.
Конструктор на вход принимает имя стиля компонента, контейнер шаблона (HTMLElement) и action функции при нажатии кнопки.
В полях класса хранятся следующие данные:
- `id` - уникальный индификатор продукта
- `title` - название продукта
- `category` - категория продукта
- `price` - цена продукта
- `image` - ссылка на изображение продукта
- `description` - описание продукта

#### Success
Выполняет функцию отображения результата выполнения заказа.
Конструктор на вход принимает HTMLElement (шаблон окна результата) и action функция кнопки
В полях класса хранятся следующие данные:
- `title` - заголовок окна.
- `description` - описание результата.

### Слой коммуникации

#### Класс AppApi
Принимает в конструктор экземпляр класса Api и предоставляет методы реализующие взаимодействие с бэкендом сервиса.

## Взаимодействие компонентов
Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

### Ивенты
const Events = {
 ['ITEMS_CHANGED'] : 'items:changed',
 ['ADD_PRODUCT'] : 'cart:add-product',
 ['REMOVE_PRODUCT'] : 'cart:remove-product',
 ['CREATE_ORDER'] : 'cart:create_order',
 ['OPEN_PREVIEW'] : 'product:open-preview',
 ['CHANGED_PREVIEW'] : 'product:changed-preview',
 ['BASKET_OPEN'] : 'cart:open',
 ['FORM_ERRORS_CHANGE'] : 'formErrors:changed',
 ['ORDER_OPEN'] : 'order:open',
 ['SET_PAYMENT_TYPE'] : 'order:setPaymentType',
 ['MODAL_OPEN'] : 'modal:open',
 ['MODAL_CLOSE'] : 'modal:close',
};