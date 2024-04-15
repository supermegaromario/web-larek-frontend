export interface ICard {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
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
	total: number;
	items: string[];
}

export interface ICardsData {
	cards: ICard[];
	preview: string | null;
    getCard(cardId: string): ICard;
    checkValidation(data: Record<keyof TBasketPopup, string>): boolean;
}

export type TCardInfo = Pick<ICard, 'category' | 'title' | 'image' | 'price'>;
export type TCardPopup = Pick<
	ICard,
	'category' | 'title' | 'image' | 'price' | 'description'
>;
export type TBasketPopup = Pick<ICard, 'title' | 'price'>;
