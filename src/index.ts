// Импорты

import './scss/styles.scss';
import WebLarekApi from './components/store/WebLarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { Events, IOrder } from './types';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import {AppState, CatalogChangeEvent, IProduct} from './components/store/AppData';
import { Page } from './components/store/ui/Page';
import { Modal } from './components/store/ui/Modal';
import { Basket } from './components/store/ui/Basket';
import { Order } from './components/store/ui/Order';
import EventEmitter from './components/base/events';
import { BasketItem, CatalogItem } from './components/store/ui/Product';
import { Success } from './components/store/ui/Success';


const api = new WebLarekApi(API_URL);

// Отслеживаеие логов
EventEmitter.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// Шаблоны
const successOrderTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

// Модель данных приложения
const appData = new AppState({}, EventEmitter);

// Глобальные контейнеры
const page = new Page(document.body, EventEmitter);
const modal = new Modal(
	ensureElement<HTMLElement>('#modal-container'),
	EventEmitter
);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), EventEmitter);
let order: Order = null;

// Забрать карточки с сервера
api.getProducts()
.then(appData.setCatalog.bind(appData))
.catch((err) => {
    console.error(err);
});

// Элементы каталога
EventEmitter.on<CatalogChangeEvent>(Events.ITEMS_CHANGED, () => {
	page.catalog = appData.catalog.map((item) => {
		const product = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
			onClick: () => EventEmitter.emit(Events.OPEN_PREVIEW, item),
		});

		return product.render({
			title: item.title,
			image: CDN_URL + item.image,
			description: item.description,
			price: item.price !== null ? item.price.toString() + ' синапсов' : '',
			category: item.category,
		});
	});

	page.counter = appData.getBusket().length;
});

// Открыть превью товара
EventEmitter.on(Events.OPEN_PREVIEW, (item: IProduct) => {
	appData.setPreview(item);
});

// Изменен открытый выбранный товар
EventEmitter.on(Events.CHANGE_PREVIEW, (item: IProduct) => {
	const card = new CatalogItem(cloneTemplate(cardPreviewTemplate), {
		onClick: () => EventEmitter.emit(Events.ADD_PRODUCT, item),
	});

	modal.render({
		content: card.render({
			title: item.title,
			image: CDN_URL + item.image,
			description: item.description,
			category: item.category,
			price: item.price !== null ? item.price?.toString() + ' синапсов' : '',
			status: {
				status: item.price === null || appData.basket.includes(item.id),
			},
		}),
	});
});

//Корзина

// Добавить элемент в корзину
EventEmitter.on(Events.ADD_PRODUCT, (item: IProduct) => {
	appData.addProductInBasket(item);
	modal.close();
});

// Открыть корзину
EventEmitter.on(Events.BASKET_OPEN, () => {
	const items = appData.getBusket().map((item, index) => {
		const product = new BasketItem(cloneTemplate(cardBasketTemplate), {
			onClick: () => EventEmitter.emit(Events.REMOVE_PRODUCT, item),
		});
		return product.render({
			index: index + 1,
			title: item.title,
			description: item.description,
			price: item.price?.toString() || '0',
			category: item.category,
		});
	});
	modal.render({
		content: createElement<HTMLElement>('div', {}, [
			basket.render({
				items,
				total: appData.getTotalPrice(),
			}),
		]),
	});
});

// Удаление карточек из корзины
EventEmitter.on(Events.REMOVE_PRODUCT, (item: IProduct) => {
	appData.removeProductFromBasket(item);
});

// Отправление формы заказа
EventEmitter.on(/(^order|^contacts):submit/, () => {
	if (!appData.order.email || !appData.order.address || !appData.order.phone)
		return EventEmitter.emit('order:open');
	const items = appData.getBusket();
	api.createOrder({
			...appData.order,
			items: items.map((i) => i.id),
			total: appData.getTotalPrice(),
		})
		.then((result) => {
			const success = new Success(cloneTemplate(successOrderTemplate), {
				onClick: () => {
					modal.close();
					EventEmitter.emit(Events.CLEAR_ORDER);
				},
			});

			modal.render({
				content: success.render({
					title: !result.error ? 'Заказ оформлен' : 'Ошибка оформления заказа',
					description: !result.error
						? `Списано ${result.total} синапсов`
						: result.error,
				}),
			});
		})
		.catch((err) => {
			console.error(err);
		})
		.finally(() => {
			EventEmitter.emit(Events.CLEAR_ORDER);
		});
});

// Очистка корзины
EventEmitter.on(Events.CLEAR_ORDER, () => {
	appData.clearBasket();
	appData.clearOrder();
});

// Валидация форм

// Изменилось состояние валидации формы
EventEmitter.on(Events.FORM_ERRORS_CHANGE, (errors: Partial<IOrder>) => {
	const { email, phone, address, payment } = errors;
	order.valid = !address && !email && !phone && !payment;
	order.errors = Object.values(errors)
		.filter((i) => !!i)
		.join('; ');
});

// Изменилось одно из полей
EventEmitter.on(
	/(^order|^contacts)\..*:change/,
	(data: { field: keyof Omit<IOrder, 'items' | 'total'>; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

// Открыть форму заказа
EventEmitter.on(Events.ORDER_OPEN, () => {
	if (order) order = null;
	const step = !appData.order.address && !appData.order.payment ? 0 : 1;
	order = new Order(
		cloneTemplate(!step ? orderTemplate : contactsTemplate),
		EventEmitter
	);
	const data = !step ? { address: '' } : { phone: '', email: '' };
	modal.render({
		content: order.render({
			...data,
			valid: false,
			errors: [],
		}),
	});
});

EventEmitter.on(Events.SET_PAYMENT_TYPE, (data: { paymentType: string }) => {
	appData.setOrderField('payment', data.paymentType);
});

// Блокировка прокрутки страницы при открытом попапе
EventEmitter.on(Events.MODAL_OPEN, () => {
	page.locked = true;
});

// Разблокировка прокрутки страницы при закрытом попапе
EventEmitter.on(Events.MODAL_CLOSE, () => {
	page.locked = false;
	appData.clearOrder();
});
