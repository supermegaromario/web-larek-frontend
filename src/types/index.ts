export interface ICard {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export interface Products {
	total: number;
	items: ICard[];
}

export interface IOrderResult {
	id: string[];
	total: number;
	error?: string;
}

export interface IOrder {
	email: string;
	phone: string;
	address: string;
	payment: string;
	total: number;
	items: string[];
}

export interface ICardsData {
	cards: ICard[];
	preview: string | null;
	getCard(cardId: string): ICard;
	checkValidation(data: Record<keyof TBasketPopup, string>): boolean;
}

export interface IWebLakerApi {
	getProducts: () => Promise<Products>;
	getProduct: (id: string) => Promise<ICard>;
	createOrder: (order: IOrder) => Promise<IOrderResult>;
}

export type TCardInfo = Pick<ICard, 'category' | 'title' | 'image' | 'price'>;
export type TCardPopup = Pick<
	ICard,
	'category' | 'title' | 'image' | 'price' | 'description'
>;
export type TBasketPopup = Pick<ICard, 'title' | 'price'>;
export type FormErrors = Partial<Record<keyof IOrder, string>>;

export const Events = {
	['OPEN_PREVIEW']: 'product:open-preview',
	['CHANGE_PREVIEW']: 'product:changed-preview',
	['ITEMS_CHANGED']: 'items:changed',
	['ADD_PRODUCT']: 'cart:add-product',
	['REMOVE_PRODUCT']: 'cart:remove-product',
	['CREATE_ORDER']: 'cart:create_order',
	['ORDER_OPEN']: 'order:open',
	['CLEAR_ORDER']: 'clear:order',
	['BASKET_OPEN']: 'cart:open',
	['FORM_ERRORS_CHANGE']: 'formErrors:changed',
	['SET_PAYMENT_TYPE']: 'order:setPaymentType',
	['MODAL_OPEN']: 'modal:open',
	['MODAL_CLOSE']: 'modal:close',
};
