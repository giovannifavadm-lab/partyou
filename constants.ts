
import { User, Event, PortfolioItem, TradeHistoryItem, SocialPost, PortfolioHistoryPoint, ConnectedAccount, Notification, PortfoliosByUser, ProposalDetails, ProposalHistoryItem } from './types';

const MOCK_CONNECTED_ACCOUNTS: ConnectedAccount[] = [
    {
        id: 'blacktag',
        name: 'Blacktag',
        logoUrl: 'https://pbs.twimg.com/profile_images/1494019582414778370/lSA2K2nF_400x400.jpg',
        username: 'calouro.trader'
    }
];

export const MOCK_USER: User = {
  id: 5,
  name: 'Calouro Trader',
  searchableName: 'calourotrader',
  email: 'fulano@universidade.edu.br',
  avatarUrl: 'https://picsum.photos/seed/useravatar/100/100',
  balance: 1337.42,
  fullName: 'Fulano de Tal da Silva',
  phone: '+55 11 91234-5678',
  connectedAccounts: MOCK_CONNECTED_ACCOUNTS,
};

export const MOCK_TRADERS: User[] = [
    { id: 1, name: 'Faria Limer do Agro', searchableName: 'farialimerdoagro', email: 'agro@br.com', avatarUrl: 'https://picsum.photos/seed/trader1/100/100', balance: 5000, fullName: 'Agroberto Limer', phone: '+55 11 98765-4321', connectedAccounts: [] },
    { id: 2, name: 'Bixete Investidora', searchableName: 'bixeteinvestidora', email: 'bixete@br.com', avatarUrl: 'https://picsum.photos/seed/trader2/100/100', balance: 2500, fullName: 'Ana Bixete', phone: '+55 11 91111-2222', connectedAccounts: [] },
    { id: 3, name: 'Rei do Camarote', searchableName: 'reidocamarote', email: 'rei@br.com', avatarUrl: 'https://picsum.photos/seed/trader3/100/100', balance: 10000, fullName: 'Reinaldo Azevedo', phone: '+55 11 93333-4444', connectedAccounts: [] },
    { id: 4, name: 'Dona da Atlética', searchableName: 'donadaatletica', email: 'atletica@br.com', avatarUrl: 'https://picsum.photos/seed/trader4/100/100', balance: 7800, fullName: 'Beatriz Atlética', phone: '+55 11 95555-6666', connectedAccounts: [] },
    MOCK_USER,
];


export const MOCK_EVENTS: Event[] = [
  {
    id: 10,
    name: 'InterUSP 2024 🏆',
    date: '15 NOV',
    location: 'Cidade Universitária, SP',
    imageUrl: 'https://picsum.photos/seed/interusp/600/400',
    description: 'A maior e mais tradicional competição universitária do Brasil. Uma semana de jogos, integração e festas que entram para a história.',
    attractions: ['Alok', 'L7nnon', 'Bateria Convidada'],
    structure: ['Arena Principal', 'Tenda Eletrônica', 'Palco Baterias'],
    isFeatured: true,
    priceHistory: [
      { time: 'D-7', price: 250 },
      { time: 'D-6', price: 260 },
      { time: 'D-5', price: 265 },
      { time: 'D-4', price: 280 },
      { time: 'D-3', price: 275 },
      { time: 'D-2', price: 290 },
      { time: 'D-1', price: 310 },
      { time: 'Hoje', price: 300 },
    ],
    orderBook: {
      bids: [
        { price: 298.50, quantity: 15 },
        { price: 298.00, quantity: 22 },
      ],
      asks: [
        { price: 300.00, quantity: 13 },
        { price: 301.50, quantity: 17 },
      ],
      lastPrice: 300.00,
    },
  },
  {
    id: 11,
    name: 'Economíadas Caipira 🌽',
    date: '12 DEZ',
    location: 'Araraquara, SP',
    imageUrl: 'https://picsum.photos/seed/eco/600/400',
    description: 'Onde a Faria Lima encontra o campo. Os melhores jogos e as festas mais insanas do circuito de Economia, com o charme do interior.',
    attractions: ['Gusttavo Lima', 'Dennis DJ', 'Turma do Pagode'],
    structure: ['Open Bar Premium', 'Palco Mundo', 'Tenda Funk'],
    isFeatured: true,
    priceHistory: [
      { time: 'D-7', price: 180 },
      { time: 'D-6', price: 185 },
      { time: 'D-5', price: 195 },
      { time: 'D-4', price: 190 },
      { time: 'D-3', price: 200 },
      { time: 'D-2', price: 215 },
      { time: 'D-1', price: 220 },
      { time: 'Hoje', price: 225 },
    ],
    orderBook: {
      bids: [
        { price: 224.00, quantity: 30 },
        { price: 223.50, quantity: 45 },
      ],
      asks: [
        { price: 225.00, quantity: 28 },
        { price: 226.00, quantity: 33 },
      ],
      lastPrice: 225.00,
    },
  },
    {
    id: 12,
    name: 'Gioconda Venuta 🎭',
    date: '18 NOV',
    location: 'Canindé, SP',
    imageUrl: 'https://picsum.photos/seed/gioconda/600/400',
    description: 'A tradicional festa à fantasia da Cásper Líbero. Uma noite de mistério, criatividade e os melhores hits do momento.',
    attractions: ['Pedro Sampaio', 'Banda Eva', 'DJ GBR'],
    structure: ['Pista Fantasia', 'Camarote Open Bar', 'Food Trucks'],
    isEarlyAccess: true,
    priceHistory: [ { time: 'Lote 1', price: 80 } ],
    orderBook: {
      bids: [ { price: 79.00, quantity: 50 } ],
      asks: [ { price: 80.00, quantity: 150 } ],
      lastPrice: 80.00,
    },
  },
  {
    id: 13,
    name: 'GVjada 🍻',
    date: '22 NOV',
    location: 'Nos Trilhos, SP',
    imageUrl: 'https://picsum.photos/seed/gvjada/600/400',
    description: 'A festa mais aguardada da FGV está de volta! Open bar de qualidade, gente bonita e a vibe que só a GV tem.',
    attractions: ['Matuê', 'KVSH', 'MC Ryan SP'],
    structure: ['Open Bar Premium', 'Palco Principal', 'Área de descanso'],
    isEarlyAccess: true,
    priceHistory: [ { time: 'Lote 1', price: 120 } ],
    orderBook: {
      bids: [ { price: 118.00, quantity: 40 } ],
      asks: [ { price: 120.00, quantity: 200 } ],
      lastPrice: 120.00,
    },
  },
  {
    id: 14,
    name: 'Caricada 💥',
    date: '30 NOV',
    location: 'Fabriketa, SP',
    imageUrl: 'https://picsum.photos/seed/caricada/600/400',
    description: 'A integração mais explosiva de Comunicação e Engenharia. Prepare-se para uma festa que vai dar o que falar.',
    attractions: ['Teto', 'Wiu', 'Baterias da CA e do Grêmio'],
    structure: ['Open Bar', 'Pista Integração', 'Duelo de Baterias'],
    isEarlyAccess: true,
    priceHistory: [ { time: 'Lote Promo', price: 90 } ],
    orderBook: {
      bids: [ { price: 89.00, quantity: 80 } ],
      asks: [ { price: 90.00, quantity: 180 } ],
      lastPrice: 90.00,
    },
  },
   {
    id: 15,
    name: 'Saidera 🍻',
    date: '05 DEZ',
    location: 'Arena Anhembi, SP',
    imageUrl: 'https://picsum.photos/seed/saidera/600/400',
    description: 'A festa de encerramento do semestre que você respeita. Open bar, as melhores atrações e a última chance de integrar antes das férias.',
    attractions: ['Jorge & Mateus', 'Vintage Culture', 'MC Hariel'],
    structure: ['Open Bar Pista', 'Camarote Premium', 'Palco 360'],
    isEarlyAccess: true,
    priceHistory: [ { time: 'Lote 1', price: 150 } ],
    orderBook: {
      bids: [ { price: 148.00, quantity: 100 } ],
      asks: [ { price: 150.00, quantity: 300 } ],
      lastPrice: 150.00,
    },
  },
  {
    id: 1,
    name: 'BIXO EM ÓRBITA 🚀',
    date: '25 OUT',
    location: 'Centro de Eventos X',
    imageUrl: 'https://picsum.photos/seed/event1/600/400',
    description: 'A maior festa de recepção de calouros da galáxia! Prepare-se para uma noite de gravidade zero com os melhores DJs interplanetários.',
    attractions: ['DJ Cometa', 'Banda Supernova', 'MC Buraco Negro'],
    structure: ['Open Bar Premium', 'Área de Descompressão', 'Pista Alienígena'],
    isFeatured: true,
    priceHistory: [
      { time: 'D-7', price: 50 },
      { time: 'D-6', price: 55 },
      { time: 'D-5', price: 65 },
      { time: 'D-4', price: 62 },
      { time: 'D-3', price: 70 },
      { time: 'D-2', price: 85 },
      { time: 'D-1', price: 95 },
      { time: 'Hoje', price: 110 },
    ],
    orderBook: {
      bids: [
        { price: 108.50, quantity: 5 },
        { price: 108.00, quantity: 12 },
        { price: 107.50, quantity: 8 },
      ],
      asks: [
        { price: 110.00, quantity: 3 },
        { price: 110.50, quantity: 7 },
        { price: 111.00, quantity: 10 },
      ],
      lastPrice: 110.00,
    },
  },
  {
    id: 2,
    name: 'CHURRAS DO AGRO 🤠',
    date: '28 OUT',
    location: 'República da Agronomia',
    imageUrl: 'https://picsum.photos/seed/event2/600/400',
    description: 'Aôôô, trem bão! O churrasco mais bruto do sistema, com open de carne e cerveja gelada até o sol raiar.',
    attractions: ['Trio Bota & Chapéu', 'DJ Tratorzão', 'Violeiros do Sertão'],
    structure: ['Open Churrasco', 'Open Cerveja', 'Touro Mecânico'],
    priceHistory: [
      { time: 'D-7', price: 80 },
      { time: 'D-6', price: 82 },
      { time: 'D-5', price: 81 },
      { time: 'D-4', price: 85 },
      { time: 'D-3', price: 90 },
      { time: 'D-2', price: 92 },
      { time: 'D-1', price: 95 },
      { time: 'Hoje', price: 98 },
    ],
    orderBook: {
      bids: [
        { price: 97.50, quantity: 20 },
        { price: 97.00, quantity: 15 },
      ],
      asks: [
        { price: 98.00, quantity: 18 },
        { price: 98.50, quantity: 25 },
      ],
      lastPrice: 98.00,
    },
  },
  {
    id: 3,
    name: 'FANTASIA DA ATLÉTICA 🏆',
    date: '02 NOV',
    location: 'Ginásio Poliesportivo',
    imageUrl: 'https://picsum.photos/seed/event3/600/400',
    description: 'A festa mais insana do ano está de volta! Vista sua melhor fantasia e venha celebrar as vitórias da nossa atlética.',
    attractions: ['Bateria FURIOSA', 'DJ Campeão', 'Concurso de Fantasias'],
    structure: ['Open Bar de Corote', 'Pista Principal', 'Camarote dos Campeões'],
    priceHistory: [
      { time: 'D-7', price: 40 },
      { time: 'D-6', price: 40 },
      { time: 'D-5', price: 45 },
      { time: 'D-4', price: 50 },
      { time: 'D-3', price: 52 },
      { time: 'D-2', price: 58 },
      { time: 'D-1', price: 65 },
      { time: 'Hoje', price: 70 },
    ],
    orderBook: {
      bids: [
        { price: 69.00, quantity: 30 },
        { price: 68.50, quantity: 40 },
      ],
      asks: [
        { price: 70.00, quantity: 22 },
        { price: 71.00, quantity: 35 },
      ],
      lastPrice: 70.00,
    },
  },
  {
    id: 4,
    name: 'Quintaneja da Federal 🎶',
    date: '27 OUT',
    location: 'Salão Principal da A.A.A.',
    imageUrl: 'https://picsum.photos/seed/event4/600/400',
    description: 'A sua dose semanal de sertanejo universitário. Cerveja gelada, moda de viola e a melhor vibe para começar o fim de semana mais cedo.',
    attractions: ['Dupla Zé & Tonho', 'DJ Agroboy'],
    structure: ['Bar Promocional', 'Pista de Dança'],
    priceHistory: [
      { time: 'D-7', price: 25 },
      { time: 'D-6', price: 28 },
      { time: 'D-5', price: 30 },
      { time: 'D-4', price: 30 },
      { time: 'D-3', price: 35 },
      { time: 'D-2', price: 40 },
      { time: 'D-1', price: 42 },
      { time: 'Hoje', price: 45 },
    ],
    orderBook: {
      bids: [
        { price: 44.50, quantity: 50 },
        { price: 44.00, quantity: 60 },
      ],
      asks: [
        { price: 45.00, quantity: 45 },
        { price: 45.50, quantity: 55 },
      ],
      lastPrice: 45.00,
    },
  },
  {
    id: 5,
    name: 'Calourada Insana 🤪',
    date: '10 NOV',
    location: 'Quadra da Atlética',
    imageUrl: 'https://picsum.photos/seed/event5/600/400',
    description: 'A recepção oficial dos bixos! Integração, jogos etílicos e a primeira grande festa da sua vida universitária.',
    attractions: ['Bateria Endiabrada', 'DJ Calouro', 'Concurso de Calouros'],
    structure: ['Open Corote', 'Paredão de Som'],
    priceHistory: [
      { time: 'D-7', price: 30 },
      { time: 'D-6', price: 30 },
      { time: 'D-5', price: 32 },
      { time: 'D-4', price: 35 },
      { time: 'D-3', price: 40 },
      { time: 'D-2', price: 45 },
      { time: 'D-1', price: 48 },
      { time: 'Hoje', price: 50 },
    ],
    orderBook: {
      bids: [
        { price: 49.00, quantity: 100 },
        { price: 48.50, quantity: 120 },
      ],
      asks: [
        { price: 50.00, quantity: 80 },
        { price: 51.00, quantity: 90 },
      ],
      lastPrice: 50.00,
    },
  },
];

const USER_PORTFOLIO: PortfolioItem[] = [
  {
    id: 101,
    eventId: 1,
    purchasePrice: 65.00,
    quantity: 2,
    status: 'Na Carteira',
  },
  {
    id: 105,
    eventId: 1,
    purchasePrice: 70.00,
    quantity: 1,
    status: 'Em Venda',
  },
  {
    id: 102,
    eventId: 3,
    purchasePrice: 45.00,
    quantity: 5,
    status: 'Na Carteira',
  },
  {
    id: 103,
    eventId: 3,
    purchasePrice: 58.00,
    quantity: 3,
    status: 'Em Venda',
  },
  {
    id: 104,
    eventId: 2,
    purchasePrice: 90.00,
    quantity: 4,
    status: 'Negociando',
  },
   {
    id: 106,
    eventId: 10,
    purchasePrice: 280.00,
    quantity: 3,
    status: 'Na Carteira',
  },
];

// Simulating portfolios for other traders for the trading feature
export const MOCK_ALL_PORTFOLIOS: PortfoliosByUser = {
    1: [ // Faria Limer do Agro
        { id: 201, eventId: 10, purchasePrice: 290, quantity: 5, status: 'Na Carteira' },
        { id: 202, eventId: 2, purchasePrice: 88, quantity: 10, status: 'Em Venda' },
        { id: 203, eventId: 11, purchasePrice: 200, quantity: 2, status: 'Na Carteira' },
    ],
    2: [ // Bixete Investidora
        { id: 301, eventId: 1, purchasePrice: 60, quantity: 8, status: 'Na Carteira' },
        { id: 302, eventId: 12, purchasePrice: 80, quantity: 4, status: 'Na Carteira' },
    ],
    3: [ // Rei do Camarote
        { id: 401, eventId: 10, purchasePrice: 250, quantity: 10, status: 'Na Carteira' },
        { id: 402, eventId: 15, purchasePrice: 150, quantity: 6, status: 'Na Carteira' },
    ],
    4: [ // Dona da Atlética
        { id: 501, eventId: 3, purchasePrice: 40, quantity: 20, status: 'Na Carteira' },
        { id: 502, eventId: 14, purchasePrice: 90, quantity: 5, status: 'Em Venda' },
    ],
    [MOCK_USER.id]: USER_PORTFOLIO, // Calouro Trader (current user)
};

export const MOCK_PORTFOLIO: PortfolioItem[] = USER_PORTFOLIO;


// FIX: Manually sorted the trade history array by date descending and removed the `.sort()` call.
// This resolves a TypeScript error where contextual typing was not being applied to the array literal
// before the method call, causing the `type` property to be inferred as `string` instead of `'Compra' | 'Venda'`.
export const MOCK_TRADE_HISTORY: TradeHistoryItem[] = [
  {
    id: 206,
    transactionId: 'TXN84315',
    eventId: 1,
    eventName: 'BIXO EM ÓRBITA 🚀',
    price: 95.00,
    type: 'Venda',
    quantity: 3,
    date: '23/10/2024',
  },
  {
    id: 204,
    transactionId: 'TXN79244',
    eventId: 2,
    eventName: 'CHURRAS DO AGRO 🤠',
    price: 81.00,
    type: 'Venda',
    quantity: 2,
    date: '22/10/2024',
  },
  {
    id: 203,
    transactionId: 'TXN79102',
    eventId: 2,
    eventName: 'CHURRAS DO AGRO 🤠',
    price: 85.00,
    type: 'Compra',
    quantity: 2,
    date: '21/10/2024',
  },
  {
    id: 205,
    transactionId: 'TXN78881',
    eventId: 1,
    eventName: 'BIXO EM ÓRBITA 🚀',
    price: 55.00,
    type: 'Compra',
    quantity: 3,
    date: '20/10/2024',
  },
  {
    id: 202,
    transactionId: 'TXN78880',
    eventId: 3,
    eventName: 'FANTASIA DA ATLÉTICA 🏆',
    price: 65.00,
    type: 'Venda',
    quantity: 10,
    date: '20/10/2024',
  },
  {
    id: 201,
    transactionId: 'TXN78554',
    eventId: 3,
    eventName: 'FANTASIA DA ATLÉTICA 🏆',
    price: 40.00,
    type: 'Compra',
    quantity: 10,
    date: '18/10/2024',
  }
];


export const MOCK_SOCIAL_POSTS: SocialPost[] = [
    {
        id: 301,
        user: { name: 'Faria Limer do Agro', avatarUrl: 'https://picsum.photos/seed/trader1/100/100' },
        content: 'Acabei de vender meus ingressos do Churras do Agro com 20% de lucro. O mercado está volátil, mas quem tem informação, domina. 📈 #partYOU #stonks',
        timestamp: 'há 15 minutos',
        likes: 42,
        commentsCount: 8,
    },
    {
        id: 302,
        user: { name: 'Bixete Investidora', avatarUrl: 'https://picsum.photos/seed/trader2/100/100' },
        content: 'Gente, a análise de IA pra BIXO EM ÓRBITA tá falando que vai subir mais! Será que eu compro mais um lote? 🤔 Alguém tem algum call?',
        timestamp: 'há 1 hora',
        likes: 112,
        commentsCount: 23,
    },
    {
        id: 303,
        user: { name: 'Rei do Camarote', avatarUrl: 'https://picsum.photos/seed/trader3/100/100' },
        content: 'Quem vai de camarote na InterUSP? O open bar vai pagar o investimento no ingresso fácil! 🔥 Bora que o foguete não tem ré!',
        timestamp: 'há 3 horas',
        likes: 250,
        commentsCount: 56,
    }
];

export const MOCK_PORTFOLIO_HISTORY: PortfolioHistoryPoint[] = [
    { date: 'Set 1', value: 1200 },
    { date: 'Set 8', value: 1250 },
    { date: 'Set 15', value: 1180 },
    { date: 'Set 22', value: 1350 },
    { date: 'Set 29', value: 1400 },
    { date: 'Out 6', value: 1550 },
    { date: 'Out 13', value: 1500 },
    { date: 'Out 20', value: 1680 },
];

export const MOCK_PROPOSAL_HISTORY: ProposalHistoryItem[] = [
     {
        id: 5,
        traderId: 1, // Faria Limer
        eventId: 10, // InterUSP
        proposalDetails: { eventId: 10, quantity: 2, price: 305.00, type: 'buy' },
        status: 'Enviada',
        direction: 'incoming',
        timestamp: 'há 5 min'
    },
    {
        id: 1,
        traderId: 1, // Faria Limer
        eventId: 11, // Economíadas
        proposalDetails: { eventId: 11, quantity: 2, price: 218.00, type: 'sell' },
        status: 'Aceita',
        direction: 'outgoing',
        timestamp: 'há 1 dia'
    },
    {
        id: 2,
        traderId: 2, // Bixete Investidora
        eventId: 1, // BIXO EM ÓRBITA
        proposalDetails: { eventId: 1, quantity: 5, price: 105.00, type: 'buy' },
        status: 'Recusada',
        direction: 'incoming',
        timestamp: 'há 2 dias'
    },
    {
        id: 3,
        traderId: 3, // Rei do Camarote
        eventId: 10, // InterUSP
        proposalDetails: { eventId: 10, quantity: 1, price: 310.00, type: 'sell' },
        status: 'Enviada',
        direction: 'outgoing',
        timestamp: 'há 5 horas'
    },
    {
        id: 4,
        traderId: 4, // Dona da Atlética
        eventId: 3, // FANTASIA DA ATLÉTICA
        proposalDetails: { eventId: 3, quantity: 10, price: 68.00, type: 'buy' },
        status: 'Expirada',
        direction: 'incoming',
        timestamp: 'há 4 dias'
    },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 2,
        type: 'trade',
        title: 'Nova Proposta de Negociação',
        message: 'Faria Limer do Agro quer COMPRAR 2 ingressos da InterUSP por R$305.00 cada.',
        timestamp: 'há 5 min',
        isRead: false,
        relatedId: 1, // Faria Limer
        proposalId: 5,
        proposalDetails: {
            eventId: 10, // InterUSP
            quantity: 2,
            price: 305.00,
            type: 'buy',
        },
    },
    {
        id: 3,
        type: 'event',
        title: 'Acesso Antecipado Aberto!',
        message: 'As vendas para a GVjada começaram. Garanta o seu lote promo!',
        timestamp: 'há 1 hora',
        isRead: false,
        relatedId: 13,
    },
    {
        id: 4,
        type: 'alert',
        title: 'InterUSP Começa Amanhã!',
        message: 'O mercado para a InterUSP fecha em 24h. Faça seus últimos trades.',
        timestamp: 'há 3 horas',
        isRead: true,
        relatedId: 10,
    },
];
