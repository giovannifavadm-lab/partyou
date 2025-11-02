
export interface ConnectedAccount {
    id: string;
    name: string;
    logoUrl: string;
    username: string;
}

export interface User {
  id: number;
  name: string;
  searchableName: string;
  email: string;
  avatarUrl: string;
  balance: number;
  fullName: string;
  phone: string;
  connectedAccounts: ConnectedAccount[];
}

export interface PriceHistory {
    time: string;
    price: number;
}

export interface Order {
    price: number;
    quantity: number;
}

export interface OrderBook {
    bids: Order[];
    asks: Order[];
    lastPrice: number;
}

export interface Event {
    id: number;
    name: string;
    date: string;
    location: string;
    imageUrl: string;
    description: string;
    attractions: string[];
    structure: string[];
    isFeatured?: boolean;
    isEarlyAccess?: boolean;
    priceHistory: PriceHistory[];
    orderBook: OrderBook;
}

export interface PortfolioItem {
    id: number;
    eventId: number;
    purchasePrice: number;
    quantity: number;
    status: 'Na Carteira' | 'Em Venda' | 'Negociando';
}

export interface PortfoliosByUser {
    [userId: number]: PortfolioItem[];
}

export interface TradeHistoryItem {
    id: number;
    transactionId: string;
    eventId: number;
    eventName: string;
    price: number;
    type: 'Compra' | 'Venda';
    quantity: number;
    date: string;
}

export interface SocialPost {
    id: number;
    user: {
        name: string;
        avatarUrl: string;
    };
    content: string;
    timestamp: string;
    likes: number;
    commentsCount: number;
}

export interface PortfolioHistoryPoint {
    date: string;
    value: number;
}

export interface ProposalDetails {
    eventId: number;
    quantity: number;
    price: number;
    type: 'buy' | 'sell';
}

export interface Notification {
    id: number;
    type: 'trade' | 'event' | 'alert';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    relatedId: number;
    proposalDetails?: ProposalDetails;
    proposalId?: number;
}

export interface ProposalHistoryItem {
  id: number;
  traderId: number;
  eventId: number;
  proposalDetails: ProposalDetails;
  status: 'Aceita' | 'Recusada' | 'Enviada' | 'Expirada' | 'Contraproposta';
  direction: 'outgoing' | 'incoming';
  timestamp: string;
}