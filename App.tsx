

import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { User, Event, PortfolioItem, OrderBook, PriceHistory, Order, TradeHistoryItem, SocialPost, PortfolioHistoryPoint, ConnectedAccount, Notification, ProposalDetails, PortfoliosByUser, ProposalHistoryItem } from './types';
import { MOCK_USER, MOCK_EVENTS, MOCK_PORTFOLIO, MOCK_TRADE_HISTORY, MOCK_TRADERS, MOCK_SOCIAL_POSTS, MOCK_PORTFOLIO_HISTORY, MOCK_NOTIFICATIONS, MOCK_ALL_PORTFOLIOS, MOCK_PROPOSAL_HISTORY } from './constants';
import { PartYouLogo, CalendarIcon, TicketIcon, TradingIcon, LogoutIcon, SparklesIcon, CopyIcon, CloseIcon, UserIcon, ArrowUpIcon, ArrowDownIcon, ChartBarIcon, SearchIcon, UsersIcon, HeartIcon, ChatIcon, EditIcon, CameraIcon, SaveIcon, FilterIcon, PlusCircleIcon, ZapIcon, QuestionMarkCircleIcon, BellIcon, CreditCardIcon, BanknotesIcon, PixIcon, CheckCircleIcon, ClipboardListIcon } from './components/icons';

type Theme = 'light' | 'dark';
type LoginStep = 'idle' | 'loading';
type PaymentMethod = 'pix' | 'card' | 'bank';
type WithdrawalMethod = 'pix' | 'bank';
type ProfileTab = 'profile' | 'history';
type Mode = 'trader' | 'casual';


// --- HELPER & REUSABLE COMPONENTS ---

const CustomRechartsTooltip = React.memo(({ active, payload, label, valueFormatter }: { active?: boolean; payload?: any[]; label?: string; valueFormatter: (value: number) => string; }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 rounded-md border border-gray-300 dark:border-gray-700 shadow-lg">
                <p className="font-bold text-gray-800 dark:text-gray-200 mb-1 text-sm">{label}</p>
                <p className="font-semibold text-base" style={{ color: payload[0].color || payload[0].stroke }}>
                    {valueFormatter(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
});

const Tooltip = React.memo(({ content, children }: { content: React.ReactNode; children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const tooltipContentRef = useRef<HTMLDivElement>(null);

    const [style, setStyle] = useState<React.CSSProperties>({});
    const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
    const [position, setPosition] = useState<'top' | 'bottom'>('top');

    const handleToggle = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    }, []);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, handleClickOutside]);
    
    useLayoutEffect(() => {
        if (isOpen && tooltipContentRef.current && wrapperRef.current) {
            const tooltipNode = tooltipContentRef.current;
            const wrapperNode = wrapperRef.current;
            
            const tooltipRect = tooltipNode.getBoundingClientRect();
            const wrapperRect = wrapperNode.getBoundingClientRect();
            
            const newStyle: React.CSSProperties = {};
            const newArrowStyle: React.CSSProperties = {};
            
            const MARGIN = 8;
            const PADDING = 16; // Screen edge padding

            const spaceAbove = wrapperRect.top;
            const tooltipHeightWithMargin = tooltipRect.height + MARGIN;
            
            let pos: 'top' | 'bottom' = 'top';
            if (spaceAbove < tooltipHeightWithMargin) {
                 pos = 'bottom';
            }
            setPosition(pos);
            
            if (pos === 'top') {
                newStyle.bottom = '100%';
                newStyle.marginBottom = `${MARGIN}px`;
            } else {
                newStyle.top = '100%';
                newStyle.marginTop = `${MARGIN}px`;
            }
            
            let left = wrapperRect.width / 2 - tooltipRect.width / 2;
            const finalLeftAbsolute = wrapperRect.left + left;
            if (finalLeftAbsolute < PADDING) { 
                left = -wrapperRect.left + PADDING;
            } else if (finalLeftAbsolute + tooltipRect.width > window.innerWidth - PADDING) {
                left = window.innerWidth - PADDING - wrapperRect.left - tooltipRect.width;
            }

            newStyle.left = `${left}px`;
            setStyle(newStyle);

            const arrowLeftCenter = wrapperRect.width / 2 - left;
            const clampedArrowLeft = Math.max(8, Math.min(arrowLeftCenter, tooltipRect.width - 8));
            newArrowStyle.left = `${clampedArrowLeft}px`;
            setArrowStyle(newArrowStyle);
        }
    }, [isOpen]);


    return (
        <div className="relative flex items-center" ref={wrapperRef}>
            <div onClick={handleToggle} className="cursor-pointer">
                {children}
            </div>
            {isOpen && (
                <div
                    ref={tooltipContentRef}
                    style={style}
                    className="absolute w-max max-w-[calc(100vw-32px)] sm:max-w-xs p-3 bg-gray-800 dark:bg-gray-950 text-white text-sm rounded-lg shadow-lg z-20 border border-gray-700 dark:border-gray-800 animate-fade-in-down text-left"
                >
                    {content}
                    <div 
                        style={arrowStyle}
                        className={`absolute -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent ${
                            position === 'top' 
                            ? 'top-full border-t-8 border-t-gray-800 dark:border-t-gray-950' 
                            : 'bottom-full border-b-8 border-b-gray-800 dark:border-b-gray-950'
                        }`}
                    ></div>
                </div>
            )}
        </div>
    );
});


const Toast = React.memo(({ message, onClose }: { message: string, onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-5 right-5 bg-lime-400 text-black font-bold p-4 rounded-lg shadow-lg z-50 animate-fade-in-down">
            {message}
        </div>
    );
});

const SkeletonLoader = React.memo(({ className }: { className?: string }) => (
    <div className={`bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md ${className}`}></div>
));

const Modal = React.memo(({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-40 animate-fade-in overflow-y-auto p-4 flex justify-center" 
            onClick={onClose}
        >
            <div 
                 className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 w-full max-w-md relative animate-slide-up my-auto"
                 onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors transform active:scale-90">
                    <CloseIcon className="w-5 h-5" />
                </button>
                {children}
            </div>
        </div>
    );
});

const PriceChart = React.memo(({ data }: { data: PriceHistory[] }) => (
    <div className="h-64 md:h-80 w-full bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-[#2d2d2d]" />
                <XAxis dataKey="time" stroke="#6b7280" className="dark:stroke-[#888]" />
                <YAxis stroke="#6b7280" className="dark:stroke-[#888]" domain={['dataMin - 10', 'dataMax + 10']} />
                <RechartsTooltip 
                    content={<CustomRechartsTooltip valueFormatter={(value: number) => `R$ ${value.toFixed(2)}`} />}
                    cursor={{ stroke: 'rgb(163 230 53 / 0.5)', strokeWidth: 1.5, strokeDasharray: "3 3" }} 
                />
                <Line type="monotone" dataKey="price" stroke="#a3e635" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
));

const FilterModal = React.memo(({ isOpen, onClose, onApply, currentFilters }: { isOpen: boolean, onClose: () => void, onApply: (filters: any) => void, currentFilters: any }) => {
    const [localFilters, setLocalFilters] = useState(currentFilters);

    useEffect(() => {
        setLocalFilters(currentFilters);
    }, [currentFilters, isOpen]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalFilters((prev: any) => ({ ...prev, [name]: value }));
    }, []);

    const handleApplyClick = useCallback(() => {
        onApply(localFilters);
        onClose();
    }, [onApply, localFilters, onClose]);
    
    const handleClear = useCallback(() => {
        const clearedFilters = { location: '', maxPrice: '', date: '' };
        setLocalFilters(clearedFilters);
        onApply(clearedFilters);
        onClose();
    }, [onApply, onClose]);


    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Filtrar Eventos</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Localidade</label>
                    <input
                        type="text"
                        name="location"
                        value={localFilters.location}
                        onChange={handleChange}
                        placeholder="Ex: São Paulo, SP"
                        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 mt-1 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Faixa de Preço (até R$)</label>
                    <input
                        type="number"
                        name="maxPrice"
                        value={localFilters.maxPrice}
                        onChange={handleChange}
                        placeholder="Ex: 150"
                        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 mt-1 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Data Limite</label>
                    <input
                        type="text"
                        name="date"
                        value={localFilters.date}
                        onChange={handleChange}
                        placeholder="Ex: NOV, 25 OUT"
                        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 mt-1 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                </div>
            </div>
            <div className="mt-8 flex space-x-4">
                <button onClick={handleClear} className="w-1/2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition transform active:scale-95">
                    Limpar
                </button>
                <button onClick={handleApplyClick} className="w-1/2 bg-lime-400 text-black font-bold py-3 rounded-lg hover:bg-lime-300 transition transform active:scale-95 active:brightness-90">
                    Aplicar Filtros
                </button>
            </div>
        </Modal>
    );
});

const NumberInputStepper = React.memo(({ value, onChange, min = 0, step = 1, price = false, max = Infinity }: { value: number, onChange: (newValue: number) => void, min?: number, step?: number, price?: boolean, max?: number }) => {
    const handleAdjust = useCallback((adjustment: number) => {
        let newValue = value + adjustment;
        if (price) {
            newValue = parseFloat(newValue.toFixed(2));
        }
        onChange(Math.min(max, Math.max(min, newValue)));
    }, [value, price, onChange, max, min]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(Math.min(max, Math.max(min, Number(e.target.value))));
    }, [onChange, max, min]);

    const handleDecrement = useCallback(() => handleAdjust(-step), [handleAdjust, step]);
    const handleIncrement = useCallback(() => handleAdjust(step), [handleAdjust, step]);

    return (
        <div className="flex items-center gap-2">
            <button onClick={handleDecrement} className="w-10 h-11 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-md font-bold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition transform active:scale-90">-</button>
            <input 
                type="number" 
                value={value} 
                onChange={handleInputChange} 
                className="w-full text-center bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-400" 
                min={min}
                max={max === Infinity ? undefined : max}
                step={price ? "0.01" : "1"}
            />
            <button onClick={handleIncrement} className="w-10 h-11 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-md font-bold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition transform active:scale-90">+</button>
        </div>
    );
});

const EventSelector = React.memo(({ events, selectedEventId, onSelect, disabled }: { events: Event[], selectedEventId: number | string, onSelect: (id: number) => void, disabled: boolean }) => {
    if (disabled) {
         const selectedEvent = events.find(e => e.id === selectedEventId);
         if (!selectedEvent) return null;
         return (
             <div className="w-full flex items-center gap-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 opacity-70">
                 <img src={selectedEvent.imageUrl} alt={selectedEvent.name} className="w-14 h-14 rounded-md object-cover flex-shrink-0" />
                 <div>
                     <p className="font-bold text-gray-900 dark:text-white">{selectedEvent.name}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400">{selectedEvent.date}</p>
                 </div>
             </div>
         )
    }
    
    if (events.length === 0) {
        return <p className="text-center text-sm text-gray-500 dark:text-gray-400 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">Nenhum evento disponível para seleção.</p>;
    }
    return (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {events.map(event => {
                const handleSelect = () => onSelect(event.id);
                return (
                    <button
                        key={event.id}
                        onClick={handleSelect}
                        className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-all duration-200 border-2 ${selectedEventId === event.id ? 'bg-lime-400/20 border-lime-400' : 'bg-gray-100 dark:bg-gray-800 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                    >
                        <img src={event.imageUrl} alt={event.name} className="w-14 h-14 rounded-md object-cover flex-shrink-0" />
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">{event.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{event.date}</p>
                        </div>
                    </button>
                )
            })}
        </div>
    );
});

// --- SCREEN COMPONENTS ---

const LoginScreen = React.memo(({ onLogin, loginStep }: { onLogin: () => void, loginStep: LoginStep }) => {
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onLogin();
    }, [onLogin]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 circuit-party-bg animate-fade-in">
            <div className="w-full max-w-sm text-center relative z-10">
                <PartYouLogo className="justify-center mb-12" />
                <h2 className="text-2xl font-bold mb-8 text-gray-600 dark:text-gray-200">Onde a festa encontra o mercado.</h2>
                
                {loginStep === 'idle' && (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                        <input
                            type="email"
                            placeholder="Email Universitário"
                            defaultValue="fulano@universidade.edu.br"
                            className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
                        />
                        <input
                            type="password"
                            placeholder="Senha"
                            defaultValue="********"
                            className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
                        />
                        <button
                            type="submit"
                            className="w-full bg-lime-400 text-black font-bold py-3 rounded-lg hover:bg-lime-300 transition-all duration-300 transform hover:scale-105 active:scale-95 active:brightness-90"
                        >
                            ENTRAR
                        </button>
                    </form>
                )}
                
                <div className="flex justify-center items-center" style={{minHeight: '228px'}}>
                    {loginStep === 'loading' && (
                        <div className="w-16 h-16 border-4 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
                    )}
                </div>

            </div>
        </div>
    );
});

const NotificationItem = React.memo(({ notification, onClick }: { notification: Notification, onClick: (notification: Notification) => void }) => {
    const iconMap = {
        trade: <TradingIcon className="w-5 h-5 text-blue-500" />,
        event: <ZapIcon className="w-5 h-5 text-lime-500" />,
        alert: <CalendarIcon className="w-5 h-5 text-yellow-500" />,
    };

    const handleClick = useCallback(() => onClick(notification), [onClick, notification]);

    return (
        <div onClick={handleClick} className={`p-4 flex gap-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-lime-400/10 dark:bg-lime-500/10' : ''}`}>
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
                {iconMap[notification.type]}
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{notification.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.timestamp}</p>
            </div>
            {!notification.isRead && <div className="flex-shrink-0 w-2 h-2 bg-lime-500 rounded-full self-center mr-2"></div>}
        </div>
    );
});

const ProposalHistoryItemCard = React.memo(({ item, traders, events }: { item: ProposalHistoryItem, traders: User[], events: Event[] }) => {
    const trader = traders.find(t => t.id === item.traderId);
    const event = events.find(e => e.id === item.eventId);

    if (!trader || !event) return null;

    const statusMap = {
        'Aceita': { text: 'Aceita', color: 'text-green-500 bg-green-100 dark:bg-green-800/50 dark:text-green-300' },
        'Recusada': { text: 'Recusada', color: 'text-red-500 bg-red-100 dark:bg-red-800/50 dark:text-red-300' },
        'Enviada': { text: 'Enviada', color: 'text-blue-500 bg-blue-100 dark:bg-blue-800/50 dark:text-blue-300' },
        'Contraproposta': { text: 'Contraproposta', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-800/50 dark:text-yellow-300' },
        'Expirada': { text: 'Expirada', color: 'text-gray-500 bg-gray-100 dark:bg-gray-700/80 dark:text-gray-400' },
    };

    const isOutgoing = item.direction === 'outgoing';
    const actionText = item.proposalDetails.type === 'buy' ? 'comprar' : 'vender';
    const title = isOutgoing ? `Proposta para ${actionText} enviada para` : `Proposta para ${actionText} recebida de`;

    return (
        <div className="p-4 flex gap-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
            <img src={trader.avatarUrl} alt={trader.name} className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-grow overflow-hidden">
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {title} <span className="font-semibold text-gray-800 dark:text-gray-200">{trader.name}</span>
                </p>
                <p className="font-bold text-sm my-1 truncate">{event.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                    {item.proposalDetails.quantity}x @ R$ {item.proposalDetails.price.toFixed(2)}
                </p>
            </div>
            <div className="flex flex-col items-end justify-between flex-shrink-0 min-w-[100px] text-right">
                 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusMap[item.status].color}`}>
                    {statusMap[item.status].text}
                </span>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{item.timestamp}</p>
            </div>
        </div>
    );
});

const Header = React.memo(({ user, onLogout, onNavigate, currentView, notifications, setNotifications, onNotificationClick, proposalHistory, allTraders, allEvents, currentMode, onSetMode }: { user: User, onLogout: () => void, onNavigate: (view: string, options?: { searchTab?: 'traders' | 'events', profileTab?: ProfileTab }) => void, currentView: string, notifications: Notification[], setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>, onNotificationClick: (notification: Notification) => void, proposalHistory: ProposalHistoryItem[], allTraders: User[], allEvents: Event[], currentMode: Mode, onSetMode: (mode: Mode) => void }) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const historyRef = useRef<HTMLDivElement>(null);

    const hasUnread = useMemo(() => notifications.some(n => !n.isRead), [notifications]);
    const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);
    const [animateBell, setAnimateBell] = useState(false);
    const prevUnreadCount = useRef(unreadCount);
    
    const handleNavigateEvents = useCallback(() => onNavigate('events'), [onNavigate]);
    const handleNavigatePortfolio = useCallback(() => onNavigate('portfolio'), [onNavigate]);
    const handleNavigateSocial = useCallback(() => onNavigate('social'), [onNavigate]);
    const handleNavigateSearch = useCallback(() => onNavigate('search'), [onNavigate]);
    const handleNavigateProfile = useCallback(() => onNavigate('profile'), [onNavigate]);
    const handleSetModeTrader = useCallback(() => onSetMode('trader'), [onSetMode]);
    const handleSetModeCasual = useCallback(() => onSetMode('casual'), [onSetMode]);
    const toggleHistory = useCallback(() => setIsHistoryOpen(prev => !prev), []);
    const toggleNotifications = useCallback(() => setIsNotificationsOpen(prev => !prev), []);
    const handleViewFullHistory = useCallback(() => {
        setIsHistoryOpen(false);
        onNavigate('profile', { profileTab: 'history' });
    }, [onNavigate]);

    useEffect(() => {
        if (unreadCount > prevUnreadCount.current) {
            setAnimateBell(true);
            const timer = setTimeout(() => setAnimateBell(false), 600);
            return () => clearTimeout(timer);
        }
        prevUnreadCount.current = unreadCount;
    }, [unreadCount]);

    const handleMarkAllRead = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    }, [notifications, setNotifications]);
    
    const handleItemClick = useCallback((notification: Notification) => {
        onNotificationClick(notification);
        setIsNotificationsOpen(false);
    }, [onNotificationClick]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
            setIsNotificationsOpen(false);
        }
        if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
            setIsHistoryOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);
    
    const ModeSwitcher = useCallback(() => (
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 text-xs md:text-sm">
            <button
                onClick={handleSetModeTrader}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all transform active:scale-95 ${currentMode === 'trader' ? 'bg-white dark:bg-black shadow-md' : 'text-gray-500 dark:text-gray-400'}`}
            >
                <ChartBarIcon className="w-4 h-4" />
                <span className="hidden md:inline">Trader</span>
            </button>
            <button
                onClick={handleSetModeCasual}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all transform active:scale-95 ${currentMode === 'casual' ? 'bg-white dark:bg-black shadow-md' : 'text-gray-500 dark:text-gray-400'}`}
            >
                <TicketIcon className="w-4 h-4" />
                <span className="hidden md:inline">Casual</span>
            </button>
        </div>
    ), [currentMode, handleSetModeTrader, handleSetModeCasual]);

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-2 md:p-4 z-30 transition-colors duration-500">
            <div className="container mx-auto flex justify-between items-center">
                <button onClick={handleNavigateEvents} className="transition-transform transform active:scale-95">
                    <PartYouLogo />
                </button>
                <nav className="hidden md:flex items-center space-x-6">
                    <button onClick={handleNavigateEvents} className={`font-semibold transition transform active:scale-95 ${currentView === 'events' ? 'text-lime-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>Eventos</button>
                    <button onClick={handleNavigatePortfolio} className={`font-semibold transition transform active:scale-95 ${currentView === 'portfolio' ? 'text-lime-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>Carteira</button>
                    <button onClick={handleNavigateSocial} className={`font-semibold transition transform active:scale-95 ${currentView === 'social' ? 'text-lime-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>Social</button>
                    <button onClick={handleNavigateSearch} className={`font-semibold transition transform active:scale-95 ${currentView === 'search' ? 'text-lime-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>Pesquisar</button>
                    <button onClick={handleNavigateProfile} className={`font-semibold transition transform active:scale-95 ${currentView === 'profile' ? 'text-lime-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>Perfil</button>
                </nav>
                <div className="flex items-center space-x-2 md:space-x-4">
                     <button
                        onClick={handleNavigateProfile}
                        className="relative group flex items-center rounded-lg p-2 -m-2 transition-transform active:scale-95 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800/50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ease-out origin-center"></div>
                        <div className="relative z-10 flex items-center space-x-2 md:space-x-4">
                            <div className="hidden md:block text-right">
                                <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm md:text-base">{user.name}</p>
                                <p className="text-xs md:text-sm text-lime-400 font-mono">R$ {user.balance.toFixed(2)}</p>
                            </div>
                            <img src={user.avatarUrl} alt="User Avatar" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-lime-400" />
                        </div>
                    </button>
                    
                    <ModeSwitcher />

                    <div className="relative" ref={historyRef}>
                        <button onClick={toggleHistory} className="text-gray-400 hover:text-gray-800 dark:hover:text-white transition transform active:scale-90 relative">
                           <ClipboardListIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        {isHistoryOpen && (
                             <div className="absolute top-full right-0 mt-3 w-80 md:w-96 max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 z-50 animate-fade-in-down overflow-hidden">
                                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
                                    <h4 className="font-bold text-gray-900 dark:text-white">Histórico Recente</h4>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {proposalHistory.length > 0 ? (
                                        <>
                                            <div className="hidden md:block">
                                                {proposalHistory.map(item => (
                                                    <ProposalHistoryItemCard key={item.id} item={item} traders={allTraders} events={allEvents} />
                                                ))}
                                            </div>
                                            <div className="md:hidden">
                                                {proposalHistory.slice(0, 3).map(item => (
                                                    <ProposalHistoryItemCard key={item.id} item={item} traders={allTraders} events={allEvents} />
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Nenhuma proposta no histórico.</p>
                                    )}
                                </div>
                                {proposalHistory.length > 3 && (
                                    <div className="md:hidden p-2 border-t border-gray-200 dark:border-gray-800">
                                        <button 
                                            onClick={handleViewFullHistory}
                                            className="w-full text-center text-sm font-semibold text-lime-500 hover:bg-lime-400/10 p-2 rounded-md transition-colors"
                                        >
                                            Ver Histórico Completo
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="relative" ref={notificationsRef}>
                        <button onClick={toggleNotifications} className={`text-gray-400 hover:text-gray-800 dark:hover:text-white transition transform active:scale-90 relative ${animateBell ? 'animate-shake' : ''}`}>
                            <BellIcon className="w-5 h-5 md:w-6 md:h-6" />
                            {hasUnread && <span className="absolute -top-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-black"></span>}
                        </button>
                        {isNotificationsOpen && (
                            <div className="absolute top-full right-0 mt-3 w-80 max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 z-50 animate-fade-in-down overflow-hidden">
                                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
                                    <h4 className="font-bold text-gray-900 dark:text-white">Notificações</h4>
                                    {hasUnread && (
                                        <button onClick={handleMarkAllRead} className="text-xs font-semibold text-lime-500 hover:text-lime-400 transition transform active:scale-95">Marcar como lido</button>
                                    )}
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map(notification => (
                                            <NotificationItem key={notification.id} notification={notification} onClick={handleItemClick} />
                                        ))
                                    ) : (
                                        <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Nenhuma notificação por aqui.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={onLogout} className="text-gray-400 hover:text-gray-800 dark:hover:text-white transition transform active:scale-90">
                        <LogoutIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
});

const BottomNav = React.memo(({ onNavigate, currentView }: { onNavigate: (view: string, options?: { searchTab: 'traders' | 'events', profileTab?: ProfileTab }) => void, currentView: string }) => {
    const handleNavigateEvents = useCallback(() => onNavigate('events'), [onNavigate]);
    const handleNavigatePortfolio = useCallback(() => onNavigate('portfolio'), [onNavigate]);
    const handleNavigateSocial = useCallback(() => onNavigate('social'), [onNavigate]);
    const handleNavigateSearch = useCallback(() => onNavigate('search'), [onNavigate]);
    const handleNavigateProfile = useCallback(() => onNavigate('profile'), [onNavigate]);

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-1 flex justify-around z-30 transition-colors duration-500">
            <button onClick={handleNavigateEvents} className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all w-1/5 transform active:scale-90 ${currentView === 'events' ? 'text-lime-400' : 'text-gray-600 dark:text-gray-400'}`}>
                <TicketIcon className="w-5 h-5" />
                <span className="text-xs font-semibold">Eventos</span>
            </button>
            <button onClick={handleNavigatePortfolio} className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all w-1/5 transform active:scale-90 ${currentView === 'portfolio' ? 'text-lime-400' : 'text-gray-600 dark:text-gray-400'}`}>
                <TradingIcon className="w-5 h-5" />
                <span className="text-xs font-semibold">Carteira</span>
            </button>
            <button onClick={handleNavigateSocial} className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all w-1/5 transform active:scale-90 ${currentView === 'social' ? 'text-lime-400' : 'text-gray-600 dark:text-gray-400'}`}>
                <UsersIcon className="w-5 h-5" />
                <span className="text-xs font-semibold">Social</span>
            </button>
            <button onClick={handleNavigateSearch} className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all w-1/5 transform active:scale-90 ${currentView === 'search' ? 'text-lime-400' : 'text-gray-600 dark:text-gray-400'}`}>
                <SearchIcon className="w-5 h-5" />
                <span className="text-xs font-semibold">Pesquisar</span>
            </button>
            <button onClick={handleNavigateProfile} className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all w-1/5 transform active:scale-90 ${currentView === 'profile' ? 'text-lime-400' : 'text-gray-600 dark:text-gray-400'}`}>
                <UserIcon className="w-5 h-5" />
                <span className="text-xs font-semibold">Perfil</span>
            </button>
        </nav>
    );
});

const EventCard = React.memo(({ event, onSelect, isWishlisted, onToggleWishlist, mode }: { event: Event, onSelect: () => void, isWishlisted: boolean, onToggleWishlist: (e: React.MouseEvent) => void, mode: Mode }) => {
    const priceHistory = event.priceHistory;
    const lastPrice = priceHistory[priceHistory.length - 1]?.price || 0;
    const secondLastPrice = priceHistory[priceHistory.length - 2]?.price || lastPrice;
    const priceChange = lastPrice - secondLastPrice;
    const priceChangePercent = secondLastPrice > 0 ? (priceChange / secondLastPrice) * 100 : 0;
    
    const changeColor = priceChange >= 0 ? 'text-green-500' : 'text-red-500';
    
    return (
    <div
        onClick={onSelect}
        className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 cursor-pointer transition-all duration-300 hover:border-lime-400 hover:-translate-y-1 group active:scale-[0.98] active:border-lime-500"
    >
        <button onClick={onToggleWishlist} className="absolute top-3 right-3 z-10 p-2 bg-black/30 rounded-full text-white hover:text-red-500 hover:bg-black/50 transition transform active:scale-90">
            <HeartIcon className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
        <img src={event.imageUrl} alt={event.name} className="w-full h-24 sm:h-32 object-cover" />
        <div className="p-4">
            <h3 className="text-lg font-bold truncate group-hover:text-lime-400">{event.name}</h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span>{event.date} - {event.location}</span>
            </div>
            <div className="mt-4 flex justify-between items-end">
                <span className="text-xl font-bold text-lime-400">R$ {event.orderBook.lastPrice.toFixed(2)}</span>
                {mode === 'trader' && (
                    <div className="text-right">
                        <div className={`flex items-center justify-end text-sm font-semibold ${changeColor}`}>
                            {priceChange >= 0 ? <ArrowUpIcon className="w-4 h-4 mr-0.5" /> : <ArrowDownIcon className="w-4 h-4 mr-0.5" />}
                            <span>{priceChangePercent.toFixed(2)}%</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">em 24h</span>
                    </div>
                )}
            </div>
        </div>
    </div>
    );
});

const FeaturedEventCarousel = React.memo(({ events, onSelectEvent, wishlist, onToggleWishlist }: { events: Event[], onSelectEvent: (event: Event) => void, wishlist: number[], onToggleWishlist: (eventId: number) => void }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleNext = useCallback(() => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
            setIsTransitioning(false);
        }, 500); // Half of the animation duration
    }, [events.length]);

    useEffect(() => {
        if (events.length > 1) {
            const timer = setInterval(handleNext, 5000);
            return () => clearInterval(timer);
        }
    }, [handleNext, events.length]);
    
    if (!events.length) return null;

    const event = events[currentIndex];
    const isWishlisted = wishlist.includes(event.id);

    const handleEventClick = useCallback(() => onSelectEvent(event), [onSelectEvent, event]);
    const handleWishlistToggle = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleWishlist(event.id);
    }, [onToggleWishlist, event.id]);

    return (
        <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:border-lime-400 hover:-translate-y-1 active:scale-[0.99]">
             <div onClick={handleEventClick} className="absolute inset-0 cursor-pointer group">
                <div className={`absolute inset-0 transition-opacity duration-1000 ${isTransitioning ? 'animate-crossfade-out' : 'animate-crossfade-in'}`}>
                    <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" key={event.id} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                     <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                        <h3 className="text-2xl font-bold text-white truncate group-hover:text-lime-400 transition-colors">{event.name}</h3>
                        <div className="flex items-center text-sm text-gray-300 mt-1">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            <span>{event.date} - {event.location}</span>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                            <span className="text-3xl font-bold text-lime-400">R$ {event.orderBook.lastPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleWishlistToggle}
                className="absolute top-4 right-4 z-20 p-2 bg-black/30 rounded-full text-white hover:text-red-500 hover:bg-black/50 transition transform active:scale-90"
                aria-label="Adicionar aos favoritos"
            >
                <HeartIcon className={`w-6 h-6 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            
            <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
                {events.map((_, index) => (
                    <div key={index} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-lime-400' : 'bg-gray-600'}`}></div>
                ))}
            </div>
        </div>
    );
});

const EarlyAccessCard = React.memo(({ event, onSelect, isWishlisted, onToggleWishlist }: { event: Event; onSelect: () => void; isWishlisted: boolean; onToggleWishlist: (e: React.MouseEvent) => void; }) => (
    <div onClick={onSelect} className="relative w-64 h-32 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-105 active:scale-100">
        <button onClick={onToggleWishlist} className="absolute top-2 left-2 z-10 p-1.5 bg-black/30 rounded-full text-white hover:text-red-500 hover:bg-black/50 transition transform active:scale-90">
             <HeartIcon className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
        <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <p className="font-bold truncate">{event.name}</p>
            <p className="text-xs text-lime-300 font-semibold">LOTE PROMO</p>
        </div>
        <div className="absolute top-2 right-2 bg-lime-400 text-black text-xs font-bold px-2 py-1 rounded-full">
            NOVO
        </div>
    </div>
));

const EarlyAccessSection = React.memo(({ events, onSelectEvent, wishlist, onToggleWishlist }: { events: Event[], onSelectEvent: (event: Event) => void, wishlist: number[], onToggleWishlist: (eventId: number) => void }) => (
    <div>
        <h2 className="text-2xl md:text-3xl font-black text-black dark:text-white mb-4 flex items-center gap-2">Acesso Antecipado <ZapIcon className="w-6 h-6 md:w-7 md:h-7 text-lime-400" /></h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {events.map(event => {
                const handleSelect = () => onSelectEvent(event);
                const handleToggle = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    onToggleWishlist(event.id);
                };
                return (
                    <EarlyAccessCard 
                        key={event.id} 
                        event={event} 
                        onSelect={handleSelect}
                        isWishlisted={wishlist.includes(event.id)}
                        onToggleWishlist={handleToggle}
                    />
                );
            })}
        </div>
    </div>
));


const EventListScreen = React.memo(({ events, onSelectEvent, onNavigateToSearch, wishlist, onToggleWishlist, mode }: { events: Event[], onSelectEvent: (event: Event) => void, onNavigateToSearch: () => void, wishlist: number[], onToggleWishlist: (eventId: number) => void, mode: Mode }) => {
    const featuredEvents = useMemo(() => events.filter(e => e.isFeatured), [events]);
    const earlyAccessEvents = useMemo(() => events.filter(e => e.isEarlyAccess && !e.isFeatured), [events]);
    const regularEvents = useMemo(() => events.filter(e => !e.isFeatured && !e.isEarlyAccess), [events]);
    
    return (
        <div className="space-y-8 animate-fade-in relative z-10">
            <button
                onClick={onNavigateToSearch}
                className="w-full flex items-center space-x-3 text-left bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg pl-4 pr-4 py-3 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 hover:border-gray-400 dark:hover:border-gray-500 transition active:bg-gray-100 dark:active:bg-gray-800"
                aria-label="Pesquisar festas"
            >
                <SearchIcon className="w-5 h-5" />
                <span>Pesquisar festas, locais...</span>
            </button>
            
            {featuredEvents.length > 0 && (
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-black dark:text-white mb-4">Eventos em Destaque ✨</h2>
                    <FeaturedEventCarousel events={featuredEvents} onSelectEvent={onSelectEvent} wishlist={wishlist} onToggleWishlist={onToggleWishlist} />
                </div>
            )}

            {earlyAccessEvents.length > 0 && (
                <EarlyAccessSection events={earlyAccessEvents} onSelectEvent={onSelectEvent} wishlist={wishlist} onToggleWishlist={onToggleWishlist} />
            )}
            
            <div>
                 <h2 className="text-2xl md:text-3xl font-black text-black dark:text-white mb-4">Todos os Eventos</h2>
                 {regularEvents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regularEvents.map(event => {
                            const handleSelect = () => onSelectEvent(event);
                            const handleToggle = (e: React.MouseEvent) => {
                                e.stopPropagation();
                                onToggleWishlist(event.id);
                            };
                            return (
                                <EventCard 
                                    key={event.id} 
                                    event={event} 
                                    onSelect={handleSelect}
                                    isWishlisted={wishlist.includes(event.id)}
                                    onToggleWishlist={handleToggle}
                                    mode={mode}
                                />
                            );
                        })}
                    </div>
                 ) : (
                    <div className="text-center py-12 bg-gray-100 dark:bg-gray-900 rounded-xl">
                        <p className="text-gray-500 dark:text-gray-400">Nenhum evento encontrado.</p>
                    </div>
                 )}
            </div>
        </div>
    );
});

const TradeModal = React.memo(({ isOpen, onClose, orderType, event, onConfirmTrade, portfolio, mode }: { isOpen: boolean, onClose: () => void, orderType: 'COMPRAR' | 'VENDER', event: Event | null, onConfirmTrade: (type: 'COMPRAR' | 'VENDER', quantity: number, price: number) => void, portfolio: PortfolioItem[], mode: Mode }) => {
    const lastPrice = event?.orderBook.lastPrice ?? 0;
    const [type, setType] = useState<'Mercado' | 'Limitada'>('Mercado');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(lastPrice);

    const colorClass = orderType === 'COMPRAR' ? 'text-green-500' : 'text-red-500';
    const buttonClass = orderType === 'COMPRAR' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';

    const total = useMemo(() => {
        const p = type === 'Mercado' ? lastPrice : price;
        return p * quantity;
    }, [type, price, quantity, lastPrice]);

    const maxSellable = useMemo(() => {
        if (orderType === 'VENDER' && event) {
            return portfolio
                .filter(item => item.eventId === event.id)
                .reduce((sum, item) => sum + item.quantity, 0);
        }
        return Infinity;
    }, [orderType, event, portfolio]);

    const handleConfirm = useCallback(() => {
        const finalPrice = type === 'Mercado' ? lastPrice : price;
        onConfirmTrade(orderType, quantity, finalPrice);
        onClose();
    }, [type, lastPrice, price, onConfirmTrade, orderType, quantity, onClose]);
    
    useEffect(() => {
       if(isOpen) {
           setType('Mercado');
           setQuantity(1);
           setPrice(lastPrice);
       }
    }, [isOpen, lastPrice]);

    if (!event) return null;

    const mercadoTooltipContent = (
        <div className="space-y-2 text-left">
            <p className="font-bold text-base text-lime-300">Ordem Imediata / A Mercado</p>
            <p className="text-gray-300">
                Sua ordem é executada <strong>imediatamente</strong> pelo melhor preço disponível no mercado.
            </p>
            <p className="text-gray-300">
                É a forma mais rápida de comprar ou vender, mas o preço final pode variar um pouco.
            </p>
        </div>
    );

    const limitadaTooltipContent = (
        <div className="space-y-2 text-left">
            <p className="font-bold text-base text-lime-300">Ordem Programada / Limitada</p>
            <p className="text-gray-300">
                Você define o preço <strong>exato</strong> que deseja pagar (compra) ou receber (venda).
            </p>
            <p className="text-gray-300">
                A ordem só será executada se o mercado atingir esse preço. Oferece mais controle, mas sem garantia de execução.
            </p>
        </div>
    );
    
    const mercadoLabel = mode === 'casual' ? 'Imediata' : 'A Mercado';
    const limitadaLabel = mode === 'casual' ? 'Programada' : 'Limitada';

    const handleSetTypeMercado = useCallback(() => setType('Mercado'), []);
    const handleSetTypeLimitada = useCallback(() => setType('Limitada'), []);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className={`text-2xl font-bold mb-4 ${colorClass}`}>{orderType} INGRESSO</h2>
            <p className="text-lg font-semibold mb-6 text-black dark:text-white">{event.name}</p>
            
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6 gap-1">
                <div className="w-1/2 relative">
                    <button onClick={handleSetTypeMercado} className={`w-full py-2 pl-4 pr-8 rounded-md font-semibold transition transform active:scale-95 text-center ${type === 'Mercado' ? 'bg-lime-400 text-black' : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}>{mercadoLabel}</button>
                    <div className="absolute top-1/2 right-2 -translate-y-1/2">
                        <Tooltip content={mercadoTooltipContent}>
                            <QuestionMarkCircleIcon className="w-5 h-5 text-gray-500" />
                        </Tooltip>
                    </div>
                </div>
                <div className="w-1/2 relative">
                    <button onClick={handleSetTypeLimitada} className={`w-full py-2 pl-4 pr-8 rounded-md font-semibold transition transform active:scale-95 text-center ${type === 'Limitada' ? 'bg-lime-400 text-black' : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}>{limitadaLabel}</button>
                    <div className="absolute top-1/2 right-2 -translate-y-1/2">
                        <Tooltip content={limitadaTooltipContent}>
                            <QuestionMarkCircleIcon className="w-5 h-5 text-gray-500" />
                        </Tooltip>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {type === 'Limitada' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Preço (R$)</label>
                        <NumberInputStepper value={price} onChange={setPrice} min={0} step={0.5} price />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Quantidade</label>
                    <NumberInputStepper value={quantity} onChange={setQuantity} min={1} max={maxSellable} />
                     {orderType === 'VENDER' && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                            Você possui {maxSellable} para vender.
                        </p>
                    )}
                </div>
            </div>
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 font-semibold">Total Estimado</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">R$ {total.toFixed(2)}</span>
            </div>
            <button onClick={handleConfirm} className={`w-full ${buttonClass} text-white font-bold py-3 rounded-lg mt-6 transition transform hover:scale-105 active:scale-95 active:brightness-90`}>
                Confirmar Ordem
            </button>
        </Modal>
    );
});

const OrderBookComponent = React.memo(({ book, onOpenModal }: { book: OrderBook, onOpenModal: (type: 'COMPRAR' | 'VENDER') => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const handleOpenBuyModal = useCallback(() => onOpenModal('COMPRAR'), [onOpenModal]);
    const handleOpenSellModal = useCallback(() => onOpenModal('VENDER'), [onOpenModal]);
    const toggleExpanded = useCallback(() => setIsExpanded(prev => !prev), []);

    const maxQuantity = useMemo(() => Math.max(
        ...book.bids.map(o => o.quantity),
        ...book.asks.map(o => o.quantity)
    ) || 1, [book]);

    const { spread, spreadPercent } = useMemo(() => {
        const bestAsk = book.asks[0]?.price || 0;
        const bestBid = book.bids[0]?.price || 0;
        const spreadValue = bestAsk > 0 && bestBid > 0 ? bestAsk - bestBid : 0;
        const spreadPercentValue = bestAsk > 0 ? (spreadValue / bestAsk) * 100 : 0;
        return { spread: spreadValue, spreadPercent: spreadPercentValue };
    }, [book]);

    const sortedAsks = useMemo(() => [...book.asks].sort((a, b) => a.price - b.price), [book.asks]);
    
    const spreadTooltipContent = (
         <div className="space-y-2">
            <p className="font-bold text-base text-lime-300">O que é o Spread?</p>
            <p className="text-gray-300">
                É a diferença, <strong>neste exato momento</strong>, entre o melhor preço de venda e o melhor preço de compra.
            </p>
            <p className="text-gray-300">
                Um <span className="font-bold text-white">spread menor</span> geralmente indica maior liquidez e um mercado mais ativo.
            </p>
             <div className="pt-2 mt-2 border-t border-gray-700/50">
                 <p className="text-xs text-gray-400">
                    Este valor é calculado em <span className="font-semibold text-white">tempo real</span> e muda a cada nova ordem que entra no livro.
                 </p>
            </div>
        </div>
    );

    const orderBookContent = (
         <div className="grid grid-cols-2 gap-3 font-mono">
            <div>
                <h4 className="text-center text-xs font-bold text-green-500 mb-2 uppercase tracking-wider">Compra</h4>
                <div className="flex justify-between px-1 pb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700">
                    <span>Qtde.</span>
                    <span>Preço (R$)</span>
                </div>
                <div className="mt-1">
                    {book.bids.map((bid, i) => (
                        <div key={`bid-${i}`} className="relative flex justify-between items-center px-1 py-2 group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150 cursor-default">
                            <div 
                                className="absolute top-0 bottom-0 right-0 bg-green-500/10"
                                style={{ width: `${(bid.quantity / maxQuantity) * 100}%` }}
                            />
                            <span className="z-10 text-gray-500 dark:text-gray-400">{bid.quantity}</span>
                            <span className="z-10 font-semibold text-green-500 dark:text-green-400">{bid.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-center text-xs font-bold text-red-500 mb-2 uppercase tracking-wider">Venda</h4>
                <div className="flex justify-between px-1 pb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-700">
                    <span>Preço (R$)</span>
                    <span>Qtde.</span>
                </div>
                <div className="mt-1">
                    {sortedAsks.map((ask, i) => (
                        <div key={`ask-${i}`} className="relative flex justify-between items-center px-1 py-2 group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150 cursor-default">
                            <div 
                                className="absolute top-0 bottom-0 left-0 bg-red-500/10" 
                                style={{ width: `${(ask.quantity / maxQuantity) * 100}%` }}
                            />
                            <span className="z-10 font-semibold text-red-500 dark:text-red-400">{ask.price.toFixed(2)}</span>
                            <span className="z-10 text-gray-500 dark:text-gray-400">{ask.quantity}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-sm">
            <div className="hidden md:block text-center mb-4">
                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Último Preço</p>
                <p className="text-3xl font-black text-lime-400 font-mono">R$ {book.lastPrice.toFixed(2)}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                    <span>Spread: R$ {spread.toFixed(2)} ({spreadPercent.toFixed(2)}%)</span>
                    <Tooltip content={spreadTooltipContent}>
                       <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-pointer" />
                    </Tooltip>
                </div>
            </div>
            
            <div className="md:hidden">
                 <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Último Preço</p>
                        <p className="text-2xl font-black text-lime-400 leading-tight font-mono">R$ {book.lastPrice.toFixed(2)}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                           <span>Spread: R$ {spread.toFixed(2)} ({spreadPercent.toFixed(2)}%)</span>
                           <Tooltip content={spreadTooltipContent}>
                               <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-pointer" />
                           </Tooltip>
                        </div>
                    </div>
                     <button onClick={toggleExpanded} className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 p-2 -m-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        <span>{isExpanded ? 'Ocultar' : 'Ver Ordens'}</span>
                        <ArrowDownIcon className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            <div className={`mt-4 ${isExpanded ? 'block animate-fade-in-down' : 'hidden'} md:block`}>
                {orderBookContent}
            </div>
            
            <div className="flex space-x-4 mt-4 md:mt-6">
                <button onClick={handleOpenBuyModal} className="w-1/2 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-transform transform hover:scale-105 active:scale-95 active:brightness-90">COMPRAR</button>
                <button onClick={handleOpenSellModal} className="w-1/2 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-transform transform hover:scale-105 active:scale-95 active:brightness-90">VENDER</button>
            </div>
        </div>
    );
});

const SimpleTradePanel = React.memo(({ book, onOpenModal }: { book: OrderBook, onOpenModal: (type: 'COMPRAR' | 'VENDER') => void }) => {
    const handleOpenBuyModal = useCallback(() => onOpenModal('COMPRAR'), [onOpenModal]);
    const handleOpenSellModal = useCallback(() => onOpenModal('VENDER'), [onOpenModal]);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <p className="text-base text-gray-500 dark:text-gray-400 font-semibold">Preço Atual</p>
            <p className="text-4xl font-black text-lime-400 my-2">R$ {book.lastPrice.toFixed(2)}</p>
            <div className="flex space-x-4 mt-6">
                <button onClick={handleOpenBuyModal} className="w-1/2 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-transform transform hover:scale-105 active:scale-95 active:brightness-90">COMPRAR</button>
                <button onClick={handleOpenSellModal} className="w-1/2 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-transform transform hover:scale-105 active:scale-95 active:brightness-90">VENDER</button>
            </div>
        </div>
    );
});


const EventDetailScreen = React.memo(({ event, onBack, showToast, isWishlisted, onToggleWishlist, onMarketTrade, portfolio, mode }: { event: Event, onBack: () => void, showToast: (message: string) => void, isWishlisted: boolean, onToggleWishlist: (eventId: number) => void, onMarketTrade: (event: Event, type: 'COMPRAR' | 'VENDER', quantity: number, price: number) => void, portfolio: PortfolioItem[], mode: Mode }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
    const [tradeModalType, setTradeModalType] = useState<'COMPRAR' | 'VENDER'>('COMPRAR');
    
    const handleCloseTradeModal = useCallback(() => setIsTradeModalOpen(false), []);

    const handleAnalysis = useCallback(() => {
        setIsAnalyzing(true);
        setAnalysis(null);
        setTimeout(() => {
            setAnalysis(`A vibe pra "${event.name}" tá QUENTE! O preço subiu 15% nos últimos 2 dias, indicando FOMO generalizado. A resistência em R$111.00 é forte, mas se romper, pode buscar a lua. A galera tá querendo comprar forte em R$108.50. Fica de olho! Se for pra entrar, talvez seja a hora. #partYOUstonks`);
            setIsAnalyzing(false);
        }, 2500);
    }, [event.name]);

    const handleOpenModal = useCallback((type: 'COMPRAR' | 'VENDER') => {
        setTradeModalType(type);
        setIsTradeModalOpen(true);
    }, []);
    
    const handleConfirmTrade = useCallback((type: 'COMPRAR' | 'VENDER', quantity: number, price: number) => {
        onMarketTrade(event, type, quantity, price);
    }, [onMarketTrade, event]);
    
    const handleToggle = useCallback(() => onToggleWishlist(event.id), [onToggleWishlist, event.id]);

    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="text-lime-400 font-semibold mb-6 transition transform active:scale-95">&larr; Voltar para Eventos</button>
            <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex flex-col md:flex-row gap-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                        <img src={event.imageUrl} alt={event.name} className="w-full md:w-1/3 h-auto object-cover rounded-lg" />
                        <div>
                            <div className="flex justify-between items-start gap-4">
                                <h2 className="text-2xl md:text-3xl font-black text-black dark:text-white">{event.name}</h2>
                                <button
                                    onClick={handleToggle}
                                    className="p-2 -mr-2 -mt-1 text-gray-400 hover:text-red-500 transition-colors transform active:scale-90 flex-shrink-0"
                                    aria-label="Adicionar aos favoritos"
                                >
                                    <HeartIcon className={`w-7 h-7 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                </button>
                            </div>
                            <p className="text-lime-400 font-semibold mt-1">{event.date} @ {event.location}</p>
                            <p className="text-gray-600 dark:text-gray-300 mt-4">{event.description}</p>
                            <div className="mt-4 space-y-2 text-sm">
                                <p><strong className="text-gray-500 dark:text-gray-400">Atrações:</strong> <span className="text-gray-700 dark:text-gray-300">{event.attractions.join(', ')}</span></p>
                                <p><strong className="text-gray-500 dark:text-gray-400">Estrutura:</strong> <span className="text-gray-700 dark:text-gray-300">{event.structure.join(', ')}</span></p>
                            </div>
                        </div>
                    </div>
                    <PriceChart data={event.priceHistory} />
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-black dark:text-white">Análise com IA</h3>
                            <button onClick={handleAnalysis} disabled={isAnalyzing} className="flex items-center space-x-2 bg-lime-400 text-black font-bold py-2 px-4 rounded-lg hover:bg-lime-300 transition disabled:bg-gray-600 disabled:cursor-not-allowed transform active:scale-95 active:brightness-90">
                                <SparklesIcon className="w-5 h-5" />
                                <span>{isAnalyzing ? 'Analisando...' : 'Analisar Preço'}</span>
                            </button>
                        </div>
                        <div className="mt-4 text-gray-600 dark:text-gray-300">
                            {isAnalyzing && (
                                <div className="space-y-3">
                                    <SkeletonLoader className="h-4 w-full" />
                                    <SkeletonLoader className="h-4 w-5/6" />
                                    <SkeletonLoader className="h-4 w-3/4" />
                                </div>
                            )}
                            {analysis && <p className="leading-relaxed">{analysis}</p>}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                     {mode === 'trader' ? (
                        <OrderBookComponent book={event.orderBook} onOpenModal={handleOpenModal} />
                    ) : (
                        <SimpleTradePanel book={event.orderBook} onOpenModal={handleOpenModal} />
                    )}
                </div>
            </div>
            <TradeModal isOpen={isTradeModalOpen} onClose={handleCloseTradeModal} orderType={tradeModalType} event={event} onConfirmTrade={handleConfirmTrade} portfolio={portfolio} mode={mode} />
        </div>
    );
});

const PortfolioPerformanceChart = React.memo(({ data }: { data: PortfolioHistoryPoint[] }) => (
    <div className="h-80 w-full bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a3e635" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-[#2d2d2d]" />
                <XAxis dataKey="date" stroke="#6b7280" className="dark:stroke-[#888]" />
                <YAxis stroke="#6b7280" className="dark:stroke-[#888]" />
                <RechartsTooltip 
                    content={<CustomRechartsTooltip valueFormatter={(value: number) => `R$ ${value.toFixed(2)}`} />}
                    cursor={{ stroke: 'rgb(163 230 53 / 0.5)', strokeWidth: 1.5, strokeDasharray: "3 3" }}
                />
                <Area type="monotone" dataKey="value" stroke="#a3e635" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
            </AreaChart>
        </ResponsiveContainer>
    </div>
));

const TransactionDetailModal = React.memo(({ isOpen, onClose, trade, onSelectEvent }: { isOpen: boolean, onClose: () => void, trade: TradeHistoryItem | null, onSelectEvent: (event: Event) => void }) => {
    if (!isOpen || !trade) return null;

    const event = MOCK_EVENTS.find(e => e.id === trade.eventId);
    const typeColor = trade.type === 'Compra' ? 'text-green-500' : 'text-red-500';
    const typeBgColor = trade.type === 'Compra' ? 'bg-green-500/10' : 'bg-red-500/10';

    const handleViewEvent = useCallback(() => {
        if (event) {
            onClose();
            onSelectEvent(event);
        }
    }, [event, onClose, onSelectEvent]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">Detalhes da Transação</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 font-mono mb-6">{trade.transactionId}</p>

            <div className="space-y-4">
                 <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Evento</p>
                    <p className="font-bold text-lg text-black dark:text-white">{trade.eventName}</p>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tipo</p>
                        <p className={`font-bold text-lg ${typeColor}`}>{trade.type}</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Data</p>
                        <p className="font-semibold text-lg text-black dark:text-white">{trade.date}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Quantidade</p>
                        <p className="font-semibold text-lg text-black dark:text-white">{trade.quantity}</p>
                    </div>
                     <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Preço Unitário</p>
                        <p className="font-mono font-semibold text-lg text-black dark:text-white">R$ {trade.price.toFixed(2)}</p>
                    </div>
                </div>
                 <div className={`p-4 rounded-lg border-2 ${typeColor} ${typeBgColor}`}>
                    <p className="text-sm font-semibold">Valor Total</p>
                    <p className="font-bold font-mono text-2xl">R$ {(trade.price * trade.quantity).toFixed(2)}</p>
                </div>
            </div>

            {event && (
                 <button onClick={handleViewEvent} className="w-full mt-6 bg-lime-400 text-black font-bold py-3 rounded-lg hover:bg-lime-300 transition transform active:scale-95 active:brightness-90">
                    Ver Evento
                </button>
            )}
        </Modal>
    );
});

const TransactionHistory = React.memo(({ history, onSelectTrade }: { history: TradeHistoryItem[], onSelectTrade: (trade: TradeHistoryItem) => void }) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <h3 className="p-4 text-xl font-bold border-b border-gray-200 dark:border-gray-800 text-black dark:text-white">Histórico de Transações</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Evento</th>
                            <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Tipo</th>
                            <th className="p-4 font-semibold hidden sm:table-cell text-gray-600 dark:text-gray-300">Data</th>
                            <th className="p-4 font-semibold hidden sm:table-cell text-right text-gray-600 dark:text-gray-300">Preço Unit.</th>
                             <th className="p-4 font-semibold text-right text-gray-600 dark:text-gray-300">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((trade) => {
                            const typeColor = trade.type === 'Compra' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
                            const handleSelect = () => onSelectTrade(trade);
                            return (
                                <tr key={trade.id} onClick={handleSelect} className="border-b border-gray-200 dark:border-gray-800 last:border-b-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4 font-semibold">{trade.eventName} <span className="font-normal text-gray-500 dark:text-gray-400">({trade.quantity}x)</span></td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeColor}`}>
                                            {trade.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{trade.date}</td>
                                    <td className="p-4 font-mono text-right hidden sm:table-cell text-gray-600 dark:text-gray-300">R$ {trade.price.toFixed(2)}</td>
                                    <td className="p-4 font-bold font-mono text-right">
                                       R$ {(trade.price * trade.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

const ReturnsView = React.memo(({ tradeHistory, portfolio, events, portfolioHistory, onSelectEvent, mode }: { tradeHistory: TradeHistoryItem[], portfolio: PortfolioItem[], events: Event[], portfolioHistory: PortfolioHistoryPoint[], onSelectEvent: (event: Event) => void, mode: Mode }) => {
    const [selectedTrade, setSelectedTrade] = useState<TradeHistoryItem | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleSelectTrade = useCallback((trade: TradeHistoryItem) => {
        setSelectedTrade(trade);
        setIsDetailModalOpen(true);
    }, []);
    
    const handleCloseModal = useCallback(() => setIsDetailModalOpen(false), []);

    const { totalProfitLoss, portfolioValue } = useMemo(() => {
        const totalProfitLoss = tradeHistory.reduce((acc, trade) => {
            if (trade.type === 'Venda') {
                return acc + (trade.price * trade.quantity);
            } else { // Compra
                return acc - (trade.price * trade.quantity);
            }
        }, 0);

        const portfolioValue = portfolio.reduce((acc, item) => {
            const event = events.find(e => e.id === item.eventId);
            return event ? acc + (event.orderBook.lastPrice * item.quantity) : acc;
        }, 0);

        return { totalProfitLoss, portfolioValue };
    }, [tradeHistory, portfolio, events]);

    const realizedTooltip = mode === 'trader' ? (
        <div className="space-y-2">
            <p className="font-bold text-base text-lime-300">Lucro/Prejuízo Realizado</p>
            <p className="text-gray-300">Este é o seu lucro ou prejuízo consolidado de todas as transações de <strong>venda</strong> que você já realizou.</p>
            <p className="text-gray-300">É o dinheiro que efetivamente entrou ou saiu do seu bolso, não considera o valor dos ingressos que você ainda tem na carteira.</p>
        </div>
    ) : (
        <div className="space-y-2">
            <p className="font-bold text-base text-lime-300">Lucro/Prejuízo Total</p>
            <p className="text-gray-300">Este é o resultado final de todos os ingressos que você já <strong>vendeu</strong>.</p>
        </div>
    );

    const portfolioValueTooltip = mode === 'trader' ? (
        <div className="space-y-2">
            <p className="font-bold text-base text-lime-300">Valor de Mercado da Carteira</p>
            <p className="text-gray-300">Este é o valor estimado de todos os ingressos que você possui atualmente, com base no <strong>último preço de mercado</strong> de cada um.</p>
            <p className="text-gray-300">Este valor flutua constantemente com as negociações do mercado.</p>
        </div>
    ) : (
         <div className="space-y-2">
            <p className="font-bold text-base text-lime-300">Valor dos Ingressos</p>
            <p className="text-gray-300">Se você vendesse todos os seus ingressos agora, este seria o valor total que você receberia.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <TransactionDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseModal}
                trade={selectedTrade}
                onSelectEvent={onSelectEvent}
            />
            {mode === 'trader' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl">
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500 dark:text-gray-400 font-semibold">{mode === 'trader' ? 'L/P Total Realizado' : 'Lucro/Prejuízo Total'}</p>
                                <Tooltip content={realizedTooltip}>
                                    <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                </Tooltip>
                            </div>
                            <p className={`text-4xl font-extrabold mt-2 ${totalProfitLoss >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                {totalProfitLoss >= 0 ? '+' : ''}R$ {totalProfitLoss.toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl">
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500 dark:text-gray-400 font-semibold">{mode === 'trader' ? 'Valor Atual da Carteira' : 'Valor dos Ingressos'}</p>
                                 <Tooltip content={portfolioValueTooltip}>
                                    <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                </Tooltip>
                            </div>
                            <p className="text-4xl font-extrabold mt-2 text-lime-400">R$ {portfolioValue.toFixed(2)}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Desempenho da Carteira</h3>
                        <PortfolioPerformanceChart data={portfolioHistory} />
                    </div>
                </>
            )}
            <div>
                <TransactionHistory history={tradeHistory} onSelectTrade={handleSelectTrade} />
            </div>
        </div>
    );
});

const StatusBreakdown = React.memo(({ items, totalQuantity }: { items: PortfolioItem[], totalQuantity: number }) => {
    const statusConfig = {
        'Na Carteira': { color: 'bg-blue-500' },
        'Em Venda': { color: 'bg-yellow-500' },
        'Negociando': { color: 'bg-purple-500' },
    };

    return (
        <div className="px-4 pt-3 pb-4">
            <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Distribuição</h5>
            <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                {items.map(item => (
                    <div
                        key={item.id}
                        className={`${statusConfig[item.status].color}`}
                        style={{ width: `${(item.quantity / totalQuantity) * 100}%` }}
                    />
                ))}
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
                {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${statusConfig[item.status].color}`} />
                             <span className="font-semibold text-gray-700 dark:text-gray-300">{item.status}</span>
                        </div>
                        <div className="text-right">
                            <span className="font-mono font-bold text-sm text-gray-800 dark:text-gray-200">{item.quantity}</span>
                            <span className="ml-1 text-gray-500 dark:text-gray-400">ingresso(s)</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});


const PortfolioTicketCard = React.memo(({
    aggregatedItem,
    onInvite,
    onSelect,
    mode
}: {
    aggregatedItem: {
        event: Event;
        items: PortfolioItem[];
        totalQuantity: number;
        avgPurchasePrice: number;
        currentPrice: number;
        potentialProfit: number;
        valorizationPercent: number;
    };
    onInvite: (event: Event) => void;
    onSelect: (event: Event) => void;
    mode: Mode;
}) => {
    const { event, items, totalQuantity, avgPurchasePrice, currentPrice, potentialProfit, valorizationPercent } = aggregatedItem;
    
    const profitColor = potentialProfit >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    const valorizationColor = valorizationPercent >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    const canInvite = items.some(i => i.status === 'Na Carteira');
    
    const handleSelectEvent = useCallback(() => onSelect(event), [onSelect, event]);
    const handleInvite = useCallback(() => onInvite(event), [onInvite, event]);

    const lpTooltipContent = mode === 'trader' ? (
         <div className="space-y-2">
            <p className="font-bold text-base text-lime-300">Cálculo do L/P Potencial</p>
            <p className="text-gray-300">Esta é uma estimativa do seu lucro ou prejuízo se você vendesse todos os seus ingressos pelo preço atual de mercado.</p>
            <div className="font-mono text-sm bg-gray-900/50 dark:bg-black/20 backdrop-blur-sm p-3 mt-2 rounded-lg border border-gray-600/50 text-gray-200">
                <p className="flex justify-between"><span>(Preço Atual</span> <span>- Preço Médio)</span></p>
                <p className="text-center font-bold text-lg">×</p>
                <p className="text-center">Quantidade Total</p>
            </div>
        </div>
    ) : (
         <div className="space-y-2">
            <p className="font-bold text-base text-lime-300">O que é o Resultado?</p>
            <p className="text-gray-300">Mostra quanto você ganharia ou perderia se vendesse todos os ingressos deste evento agora.</p>
        </div>
    );

    const TraderView = useCallback(() => (
        <div className="grid grid-cols-4 gap-px bg-gray-100 dark:bg-gray-800 px-4 py-2 text-center text-sm border-t border-b border-gray-200 dark:border-gray-700">
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Quantidade</p>
                <p className="font-bold font-mono">{totalQuantity}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Preço Médio</p>
                <p className="font-mono font-bold">R${avgPurchasePrice.toFixed(2)}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Valorização</p>
                <p className="font-mono font-bold -mb-0.5">R${currentPrice.toFixed(2)}</p>
                <p className={`text-xs font-mono font-bold flex items-center justify-center gap-1 ${valorizationColor}`}>
                    {valorizationPercent >= 0 ? <ArrowUpIcon className="w-3 h-3"/> : <ArrowDownIcon className="w-3 h-3"/>}
                    {valorizationPercent.toFixed(2)}%
                </p>
            </div>
            <div>
                <div className="flex items-center justify-center gap-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">L/P Potencial</p>
                    <Tooltip content={lpTooltipContent}>
                        <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </Tooltip>
                </div>
                <p className={`font-mono font-bold ${profitColor}`}>
                     {potentialProfit >= 0 ? '+' : ''}R${potentialProfit.toFixed(2)}
                </p>
            </div>
        </div>
    ), [totalQuantity, avgPurchasePrice, currentPrice, valorizationColor, valorizationPercent, lpTooltipContent, profitColor, potentialProfit]);

    const CasualView = useCallback(() => (
         <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-gray-800 px-4 py-2 text-center text-sm border-t border-b border-gray-200 dark:border-gray-700">
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ingressos</p>
                <p className="font-bold font-mono">{totalQuantity}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Preço Atual</p>
                <p className="font-mono font-bold">R${currentPrice.toFixed(2)}</p>
            </div>
            <div>
                <div className="flex items-center justify-center gap-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Resultado</p>
                    <Tooltip content={lpTooltipContent}>
                        <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </Tooltip>
                </div>
                <p className={`font-mono font-bold ${profitColor}`}>
                     {potentialProfit >= 0 ? '+' : ''}R${potentialProfit.toFixed(2)}
                </p>
            </div>
        </div>
    ), [totalQuantity, currentPrice, lpTooltipContent, profitColor, potentialProfit]);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center p-4 gap-4">
                <img src={event.imageUrl} alt={event.name} className="w-16 h-16 rounded-lg object-cover cursor-pointer" onClick={handleSelectEvent} />
                <div className="flex-grow">
                    <h4 className="font-bold text-lg cursor-pointer hover:text-lime-400" onClick={handleSelectEvent}>{event.name}</h4>
                </div>
                {canInvite && (
                     <button onClick={handleInvite} className="flex-shrink-0 p-2 text-gray-400 hover:text-lime-400 transition transform active:scale-90">
                         <SparklesIcon className="w-5 h-5" />
                     </button>
                )}
            </div>

            <StatusBreakdown items={items} totalQuantity={totalQuantity} />
            
            {mode === 'trader' ? <TraderView /> : <CasualView />}
        </div>
    );
});


const PortfolioScreen = React.memo(({ portfolio, events, tradeHistory, portfolioHistory, showToast, wishlist, onSelectEvent, onToggleWishlist, mode }: { portfolio: PortfolioItem[], events: Event[], tradeHistory: TradeHistoryItem[], portfolioHistory: PortfolioHistoryPoint[], showToast: (message: string) => void, wishlist: number[], onSelectEvent: (event: Event) => void, onToggleWishlist: (eventId: number) => void, mode: Mode }) => {
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteText, setInviteText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('tickets');
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
    const [tradeModalType, setTradeModalType] = useState<'COMPRAR' | 'VENDER'>('COMPRAR');
    const [selectedEventForTrade, setSelectedEventForTrade] = useState<Event | null>(null);

    const handleSetActiveTab = useCallback((tab: string) => setActiveTab(tab), []);
    const handleSetTicketsTab = useCallback(() => handleSetActiveTab('tickets'), [handleSetActiveTab]);
    const handleSetReturnsTab = useCallback(() => handleSetActiveTab('returns'), [handleSetActiveTab]);
    const handleSetWishlistTab = useCallback(() => handleSetActiveTab('wishlist'), [handleSetActiveTab]);
    const handleCloseInviteModal = useCallback(() => setInviteModalOpen(false), []);
    const handleCloseTradeModal = useCallback(() => setIsTradeModalOpen(false), []);

    const portfolioData = useMemo(() => {
        const groupedByEvent = portfolio.reduce<Record<number, PortfolioItem[]>>((acc, item) => {
            if (!acc[item.eventId]) acc[item.eventId] = [];
            acc[item.eventId].push(item);
            return acc;
        }, {});

        return Object.values(groupedByEvent).map(items => {
            const event = events.find(e => e.id === items[0].eventId);
            if (!event) return null;

            const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
            const totalCost = items.reduce((sum, i) => sum + (i.purchasePrice * i.quantity), 0);
            const avgPurchasePrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;
            const currentPrice = event.orderBook.lastPrice;
            const potentialProfit = (currentPrice * totalQuantity) - totalCost;
            const valorizationPercent = avgPurchasePrice > 0 ? ((currentPrice - avgPurchasePrice) / avgPurchasePrice) * 100 : 0;

            return { event, items, totalQuantity, avgPurchasePrice, currentPrice, potentialProfit, valorizationPercent };
        }).filter((item): item is NonNullable<typeof item> => item !== null);
    }, [portfolio, events]);

    const wishlistedEvents = useMemo(() => events.filter(event => wishlist.includes(event.id)), [events, wishlist]);

    const handleGenerateInvite = useCallback((event: Event) => {
        setInviteText('');
        setIsGenerating(true);
        setInviteModalOpen(true);
        setTimeout(() => {
            const invite = `E aí! 🚀 Vamo colar na "${event.name}"? Vai ser INSANO com ${event.attractions.join(', ')}! Já garanti meu ingresso, bora junto que vai ser épico! Me fala se animar! #partYOU`;
            setInviteText(invite);
            setIsGenerating(false);
        }, 2000);
    }, []);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(inviteText);
        showToast('Texto copiado!');
    }, [inviteText, showToast]);
    
    const handleOpenTradeModal = useCallback((type: 'COMPRAR' | 'VENDER', event: Event) => {
        setSelectedEventForTrade(event);
        setTradeModalType(type);
        setIsTradeModalOpen(true);
    }, []);
    
    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-black text-black dark:text-white mb-6 flex items-center gap-2">
                Minha Carteira
                <TradingIcon className="w-7 h-7 text-gray-400 dark:text-gray-500" />
            </h2>
            
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button onClick={handleSetTicketsTab} className={`py-2 px-4 font-semibold transition transform active:scale-95 ${activeTab === 'tickets' ? 'text-lime-400 border-b-2 border-lime-400' : 'text-gray-500 dark:text-gray-400'}`}>Meus Ingressos</button>
                <button onClick={handleSetReturnsTab} className={`py-2 px-4 font-semibold transition transform active:scale-95 ${activeTab === 'returns' ? 'text-lime-400 border-b-2 border-lime-400' : 'text-gray-500 dark:text-gray-400'}`}>Retornos</button>
                <button onClick={handleSetWishlistTab} className={`py-2 px-4 font-semibold transition transform active:scale-95 ${activeTab === 'wishlist' ? 'text-lime-400 border-b-2 border-lime-400' : 'text-gray-500 dark:text-gray-400'}`}>Favoritos</button>
            </div>

            {activeTab === 'tickets' && (
                 <div className="space-y-4">
                     {portfolioData.length > 0 ? (
                        portfolioData.map((item) => (
                            <PortfolioTicketCard
                                key={item.event.id}
                                aggregatedItem={item}
                                onInvite={handleGenerateInvite}
                                onSelect={onSelectEvent}
                                mode={mode}
                            />
                        ))
                     ) : (
                         <div className="text-center py-12 bg-gray-100 dark:bg-gray-900 rounded-xl">
                            <p className="text-gray-500 dark:text-gray-400">Sua carteira está vazia.</p>
                            <p className="text-sm text-gray-600 dark:text-gray-500 mt-2">Navegue pelos eventos e comece a negociar!</p>
                        </div>
                     )}
                </div>
            )}
            {activeTab === 'returns' && (
                <ReturnsView
                    tradeHistory={tradeHistory}
                    portfolio={portfolio}
                    events={MOCK_EVENTS}
                    portfolioHistory={MOCK_PORTFOLIO_HISTORY}
                    onSelectEvent={onSelectEvent}
                    mode={mode}
                />
            )}
            {activeTab === 'wishlist' && (
                <div className="space-y-6">
                    {wishlistedEvents.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wishlistedEvents.map(event => {
                                const handleSelect = () => onSelectEvent(event);
                                const handleToggle = (e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    onToggleWishlist(event.id);
                                };
                                return (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    onSelect={handleSelect}
                                    isWishlisted={wishlist.includes(event.id)}
                                    onToggleWishlist={handleToggle}
                                    mode={mode}
                                />
                            )})}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-100 dark:bg-gray-900 rounded-xl">
                            <p className="text-gray-500 dark:text-gray-400">Sua lista de favoritos está vazia.</p>
                            <p className="text-sm text-gray-600 dark:text-gray-500 mt-2">Clique no coração ❤️ nos eventos para salvá-los aqui!</p>
                        </div>
                    )}
                </div>
            )}

            <TradeModal
                isOpen={isTradeModalOpen}
                onClose={handleCloseTradeModal}
                orderType={tradeModalType}
                event={selectedEventForTrade}
                onConfirmTrade={() => { /* This modal is now for display/quick-nav only in portfolio; main trading from event page */ }}
                portfolio={portfolio}
                mode={mode}
            />

            <Modal isOpen={isInviteModalOpen} onClose={handleCloseInviteModal}>
                <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Convite Gerado por IA ✨</h2>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg min-h-[150px]">
                    {isGenerating ? (
                        <div className="space-y-3 pt-2">
                            <SkeletonLoader className="h-4 w-full" />
                            <SkeletonLoader className="h-4 w-5/6" />
                            <SkeletonLoader className="h-4 w-3/4" />
                        </div>
                    ) : (
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{inviteText}</p>
                    )}
                </div>
                <button
                    onClick={handleCopy}
                    disabled={isGenerating || !inviteText}
                    className="w-full flex items-center justify-center space-x-2 mt-6 bg-lime-400 text-black font-bold py-3 rounded-lg hover:bg-lime-300 transition disabled:bg-gray-600 transform active:scale-95 active:brightness-90"
                >
                    <CopyIcon className="w-5 h-5" />
                    <span>Copiar Texto</span>
                </button>
            </Modal>
        </div>
    );
});

const ToggleSwitch = React.memo(({ enabled, onChange }: { enabled: boolean, onChange: (enabled: boolean) => void }) => {
    const handleChange = useCallback(() => onChange(!enabled), [enabled, onChange]);
    return (
        <button
            onClick={handleChange}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors transform active:scale-95 ${enabled ? 'bg-lime-400' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    );
});

const AddBalanceModal = React.memo(({ isOpen, onClose, onAddBalance }: { isOpen: boolean, onClose: () => void, onAddBalance: (amount: number) => void }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
    const numericAmount = Number(amount);

    const handleConfirm = useCallback(() => {
        if (numericAmount > 0) {
            onAddBalance(numericAmount);
            setAmount('');
            onClose();
        }
    }, [numericAmount, onAddBalance, onClose]);

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setPaymentMethod('pix');
        }
    }, [isOpen]);

    const getButtonClass = useCallback((method: PaymentMethod) => {
        return `flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all transform active:scale-95 ${
            paymentMethod === method
                ? 'bg-lime-400/20 border-lime-400 text-lime-500 dark:text-lime-300'
                : 'bg-gray-100 dark:bg-gray-800 border-transparent hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
        }`;
    }, [paymentMethod]);
    
    const setMethodPix = useCallback(() => setPaymentMethod('pix'), []);
    const setMethodCard = useCallback(() => setPaymentMethod('card'), []);
    const setMethodBank = useCallback(() => setPaymentMethod('bank'), []);
    const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value ? Number(e.target.value) : ''), []);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-6 text-black dark:text-white text-center">Adicionar Saldo</h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Forma de Pagamento</label>
                    <div className="flex gap-3 text-center">
                        <button onClick={setMethodPix} className={getButtonClass('pix')}>
                            <PixIcon className="w-6 h-6" />
                            <span className="text-sm font-semibold">PIX</span>
                        </button>
                        <button onClick={setMethodCard} className={getButtonClass('card')}>
                            <CreditCardIcon className="w-6 h-6" />
                            <span className="text-sm font-semibold">Cartão</span>
                        </button>
                        <button onClick={setMethodBank} className={getButtonClass('bank')}>
                            <BanknotesIcon className="w-6 h-6" />
                            <span className="text-sm font-semibold">Transferência</span>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Valor (R$)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0,00"
                        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 mt-1 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-500 dark:placeholder-gray-400 text-center text-2xl font-bold"
                    />
                </div>
            </div>

            <button onClick={handleConfirm} disabled={numericAmount <= 0} className="w-full mt-8 bg-lime-400 text-black font-bold py-3 rounded-lg hover:bg-lime-300 transition-transform transform active:scale-95 active:brightness-90 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">
                Adicionar R$ {numericAmount > 0 ? numericAmount.toFixed(2).replace('.', ',') : '...'}
            </button>
        </Modal>
    );
});

const WithdrawBalanceModal = React.memo(({ isOpen, onClose, onWithdrawBalance }: { isOpen: boolean, onClose: () => void, onWithdrawBalance: (amount: number) => void }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [withdrawalMethod, setWithdrawalMethod] = useState<WithdrawalMethod>('pix');
    const numericAmount = Number(amount);

    const handleConfirm = useCallback(() => {
        if (numericAmount > 0) {
            onWithdrawBalance(numericAmount);
            setAmount('');
            onClose();
        }
    }, [numericAmount, onWithdrawBalance, onClose]);

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setWithdrawalMethod('pix');
        }
    }, [isOpen]);

    const getButtonClass = useCallback((method: WithdrawalMethod) => {
        return `flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all transform active:scale-95 ${
            withdrawalMethod === method
                ? 'bg-lime-400/20 border-lime-400 text-lime-500 dark:text-lime-300'
                : 'bg-gray-100 dark:bg-gray-800 border-transparent hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
        }`;
    }, [withdrawalMethod]);
    
    const setMethodPix = useCallback(() => setWithdrawalMethod('pix'), []);
    const setMethodBank = useCallback(() => setWithdrawalMethod('bank'), []);
    const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value ? Number(e.target.value) : ''), []);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-6 text-black dark:text-white text-center">Retirar Saldo</h2>
             <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Método de Retirada</label>
                    <div className="flex gap-3 text-center">
                        <button onClick={setMethodPix} className={getButtonClass('pix')}>
                            <PixIcon className="w-6 h-6" />
                            <span className="text-sm font-semibold">PIX</span>
                        </button>
                        <button onClick={setMethodBank} className={getButtonClass('bank')}>
                            <BanknotesIcon className="w-6 h-6" />
                            <span className="text-sm font-semibold">Transferência</span>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Valor (R$)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0,00"
                        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 mt-1 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-500 dark:placeholder-gray-400 text-center text-2xl font-bold"
                    />
                </div>
            </div>
             <button onClick={handleConfirm} disabled={numericAmount <= 0} className="w-full mt-8 bg-lime-400 text-black font-bold py-3 rounded-lg hover:bg-lime-300 transition-transform transform active:scale-95 active:brightness-90 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">
                Retirar R$ {numericAmount > 0 ? numericAmount.toFixed(2).replace('.', ',') : '...'}
            </button>
        </Modal>
    );
});


const ProfileScreen = React.memo(({ user, onUpdateUser, showToast, theme, setTheme, onAddBalance, onWithdrawBalance, initialTab, proposalHistory, allTraders, allEvents }: { user: User, onUpdateUser: (user: User) => void, showToast: (message: string) => void, theme: Theme, setTheme: (theme: Theme) => void, onAddBalance: (amount: number) => void, onWithdrawBalance: (amount: number) => void, initialTab: ProfileTab, proposalHistory: ProposalHistoryItem[], allTraders: User[], allEvents: Event[] }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(user.name);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
    
    const handleShowToast = useCallback((msg: string) => showToast(msg), [showToast]);
    const handleSetActiveTab = useCallback((tab: ProfileTab) => setActiveTab(tab), []);
    const handleSetProfileTab = useCallback(() => handleSetActiveTab('profile'), [handleSetActiveTab]);
    const handleSetHistoryTab = useCallback(() => handleSetActiveTab('history'), [handleSetActiveTab]);
    const handleCloseAddBalanceModal = useCallback(() => setIsAddBalanceModalOpen(false), []);
    const handleCloseWithdrawModal = useCallback(() => setIsWithdrawModalOpen(false), []);
    const handleOpenAddBalanceModal = useCallback(() => setIsAddBalanceModalOpen(true), []);
    const handleOpenWithdrawModal = useCallback(() => setIsWithdrawModalOpen(true), []);
    const handleEditName = useCallback(() => setIsEditingName(true), []);

    useEffect(() => { setActiveTab(initialTab); }, [initialTab]);

    const handleSaveName = useCallback(() => {
        onUpdateUser({ ...user, name: editedName });
        setIsEditingName(false);
        showToast("Nome de perfil atualizado!");
    }, [onUpdateUser, user, editedName, showToast]);
    
    const handleEditedNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setEditedName(e.target.value), []);
    const handleEmailNotificationsChange = useCallback((enabled: boolean) => setEmailNotifications(enabled), []);
    const handleThemeChange = useCallback((enabled: boolean) => setTheme(enabled ? 'dark' : 'light'), [setTheme]);

    return (
        <div className="animate-fade-in space-y-8 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-black dark:text-white">Meu Perfil</h2>
            
            <div className="flex border-b border-gray-200 dark:border-gray-700 -mb-2">
                <button onClick={handleSetProfileTab} className={`py-2 px-4 font-semibold transition transform active:scale-95 ${activeTab === 'profile' ? 'text-lime-400 border-b-2 border-lime-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    Configurações
                </button>
                <button onClick={handleSetHistoryTab} className={`py-2 px-4 font-semibold transition transform active:scale-95 ${activeTab === 'history' ? 'text-lime-400 border-b-2 border-lime-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    Histórico
                </button>
            </div>

            {activeTab === 'profile' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-6 text-black dark:text-white">Perfil Público</h3>
                         <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-6">
                            <div className="relative group">
                                <img src={user.avatarUrl} alt="User Avatar" className="w-28 h-28 rounded-full border-4 border-lime-400"/>
                                <button onClick={() => handleShowToast("Função de upload em breve!")} className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform active:scale-95">
                                    <CameraIcon className="w-8 h-8 text-white"/>
                                </button>
                            </div>
                            <div className="flex-grow w-full">
                                {isEditingName ? (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={handleEditedNameChange}
                                            className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-lime-400"
                                        />
                                        <button onClick={handleSaveName} className="p-2 bg-lime-400 text-black rounded-lg hover:bg-lime-300 transform active:scale-90">
                                            <SaveIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-3">
                                        <h3 className="text-2xl md:text-3xl font-bold text-black dark:text-white">{user.name}</h3>
                                        <button onClick={handleEditName} className="text-gray-400 hover:text-lime-400 transform active:scale-90">
                                            <EditIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                )}
                                <p className="text-gray-500 dark:text-gray-400 mt-1">@{user.searchableName}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Saldo da Carteira</h3>
                        <div className="text-center bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Disponível</p>
                            <p className="text-5xl font-black text-lime-400 font-mono my-2">R$ {user.balance.toFixed(2)}</p>
                        </div>
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={handleOpenAddBalanceModal}
                                className="w-full flex items-center justify-center space-x-2 bg-lime-400 text-black font-bold py-3 rounded-lg hover:bg-lime-300 transition-colors transform active:scale-95 active:brightness-90"
                            >
                                <PlusCircleIcon className="w-5 h-5"/>
                                <span>Adicionar Saldo</span>
                            </button>
                            <button
                                onClick={handleOpenWithdrawModal}
                                className="w-full flex items-center justify-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors transform active:scale-95"
                            >
                                <ArrowDownIcon className="w-5 h-5"/>
                                <span>Retirar Saldo</span>
                            </button>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Dados Pessoais</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">Nome Completo</span>
                                <span className="font-semibold">{user.fullName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">E-mail</span>
                                <span className="font-semibold">{user.email}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">Telefone</span>
                                <span className="font-semibold">{user.phone}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-6 text-black dark:text-white">Contas Conectadas</h3>
                        <div className="space-y-4">
                            {user.connectedAccounts.map(account => {
                                const handleDisconnect = () => handleShowToast(`${account.name} desconectado!`);
                                return (
                                <div key={account.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <img src={account.logoUrl} alt={`${account.name} logo`} className="w-10 h-10 rounded-full bg-white p-1"/>
                                        <div>
                                            <p className="font-bold">{account.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{account.username}</p>
                                        </div>
                                    </div>
                                    <button onClick={handleDisconnect} className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors active:bg-red-500/10 rounded p-1 -m-1">Desconectar</button>
                                </div>
                            )})}
                        </div>
                         <button onClick={() => handleShowToast("Função em desenvolvimento")} className="w-full flex items-center justify-center space-x-2 mt-6 text-lime-500 font-semibold bg-lime-400/10 hover:bg-lime-400/20 p-3 rounded-lg transition-colors transform active:scale-95">
                            <PlusCircleIcon className="w-5 h-5"/>
                            <span>Adicionar Nova Conta</span>
                         </button>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                         <h3 className="text-xl font-bold mb-6 text-black dark:text-white">Configurações</h3>
                         <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">Notificações por E-mail</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Receba alertas de trades e notícias.</p>
                                </div>
                                <ToggleSwitch enabled={emailNotifications} onChange={handleEmailNotificationsChange} />
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">Modo Escuro</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Aproveite o lado sombrio.</p>
                                </div>
                                <ToggleSwitch enabled={theme === 'dark'} onChange={handleThemeChange} />
                            </div>
                             <div className="border-t border-gray-200 dark:border-gray-800 my-4"></div>
                             <button onClick={() => handleShowToast("Função em desenvolvimento")} className="w-full text-left font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors transform active:scale-95">
                                Ajuda e Suporte
                            </button>
                         </div>
                    </div>
                </div>
            )}
            {activeTab === 'history' && (
                 <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden animate-fade-in">
                    <div className="p-4">
                        <h3 className="text-xl font-bold text-black dark:text-white">Histórico de Propostas</h3>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                        {proposalHistory.length > 0 ? (
                            proposalHistory.map(item => (
                                <ProposalHistoryItemCard key={item.id} item={item} traders={allTraders} events={allEvents} />
                            ))
                        ) : (
                            <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Nenhuma proposta no histórico.</p>
                        )}
                    </div>
                </div>
            )}


            <AddBalanceModal isOpen={isAddBalanceModalOpen} onClose={handleCloseAddBalanceModal} onAddBalance={onAddBalance} />
            <WithdrawBalanceModal isOpen={isWithdrawModalOpen} onClose={handleCloseWithdrawModal} onWithdrawBalance={onWithdrawBalance} />
        </div>
    );
});

const SearchScreen = React.memo(({ onSelectEvent, onSelectTrader, initialTab, onBack, mode }: { onSelectEvent: (event: Event) => void, onSelectTrader: (trader: User) => void, initialTab: 'events' | 'traders', onBack: () => void, mode: Mode }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'events' | 'traders'>(initialTab);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({ location: '', maxPrice: '', date: '' });
    
    const handleSetEventsTab = useCallback(() => setActiveTab('events'), []);
    const handleSetTradersTab = useCallback(() => setActiveTab('traders'), []);
    const handleOpenFilterModal = useCallback(() => setIsFilterModalOpen(true), []);
    const handleCloseFilterModal = useCallback(() => setIsFilterModalOpen(false), []);
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value), []);
    
    const filteredEvents = useMemo(() => {
        return MOCK_EVENTS.filter(event => {
            const matchesQuery = event.name.toLowerCase().includes(searchQuery.toLowerCase()) || event.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLocation = filters.location ? event.location.toLowerCase().includes(filters.location.toLowerCase()) : true;
            const matchesPrice = filters.maxPrice ? event.orderBook.lastPrice <= Number(filters.maxPrice) : true;
            const matchesDate = filters.date ? event.date.toLowerCase().includes(filters.date.toLowerCase()) : true;

            return matchesQuery && matchesLocation && matchesPrice && matchesDate;
        });
    }, [searchQuery, filters]);

    const filteredTraders = useMemo(() => {
        return MOCK_TRADERS.filter(trader =>
            trader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trader.searchableName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const handleApplyFilters = useCallback((newFilters: any) => {
        setFilters(newFilters);
    }, []);
    
    const renderEventItem = useCallback((event: Event) => {
        const handleSelect = () => onSelectEvent(event);
        return (
            <div key={event.id} onClick={handleSelect} className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer hover:border-lime-400 transition">
                <h4 className="font-bold">{event.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{event.date} - {event.location}</p>
                <p className="mt-2 text-lg font-bold text-lime-400">R$ {event.orderBook.lastPrice.toFixed(2)}</p>
            </div>
        )
    }, [onSelectEvent]);
    
    const renderTraderItem = useCallback((trader: User) => {
        const handleSelect = () => onSelectTrader(trader);
        return (
            <div key={trader.id} onClick={handleSelect} className="flex items-center space-x-4 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer hover:border-lime-400 transition">
                <img src={trader.avatarUrl} alt={trader.name} className="w-12 h-12 rounded-full"/>
                <div>
                    <h4 className="font-bold">{trader.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{trader.searchableName}</p>
                </div>
            </div>
        )
    }, [onSelectTrader]);

    return (
        <div className="animate-fade-in">
            <FilterModal isOpen={isFilterModalOpen} onClose={handleCloseFilterModal} onApply={handleApplyFilters} currentFilters={filters} />
            <div className="relative mb-6">
                 <input
                    type="text"
                    placeholder={activeTab === 'events' ? 'Pesquisar festas...' : 'Pesquisar traders...'}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg pl-12 pr-14 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                </div>
                {activeTab === 'events' && (
                    <button onClick={handleOpenFilterModal} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-lime-400 transition-colors transform active:scale-90">
                        <FilterIcon className="w-5 h-5"/>
                    </button>
                )}
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button onClick={handleSetEventsTab} className={`py-2 px-4 font-semibold transition transform active:scale-95 ${activeTab === 'events' ? 'text-lime-400 border-b-2 border-lime-400' : 'text-gray-500 dark:text-gray-400'}`}>Eventos</button>
                <button onClick={handleSetTradersTab} className={`py-2 px-4 font-semibold transition transform active:scale-95 ${activeTab === 'traders' ? 'text-lime-400 border-b-2 border-lime-400' : 'text-gray-500 dark:text-gray-400'}`}>Traders</button>
            </div>

            {activeTab === 'events' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.length > 0 ? filteredEvents.map(renderEventItem) : <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">Nenhum evento encontrado.</p>}
                </div>
            )}

            {activeTab === 'traders' && (
                <div className="space-y-4">
                    {filteredTraders.length > 0 ? filteredTraders.map(renderTraderItem) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhum trader encontrado.</p>}
                </div>
            )}
        </div>
    );
});

const SocialScreen = React.memo(() => {
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
             <h2 className="text-2xl md:text-3xl font-black text-black dark:text-white">Social Feed</h2>
             
             <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex space-x-3">
                    <img src={MOCK_USER.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full"/>
                    <textarea
                        placeholder="Qual o call de hoje, trader?"
                        className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border-transparent focus:ring-2 focus:ring-lime-400 focus:outline-none resize-none"
                        rows={2}
                    ></textarea>
                </div>
                <div className="flex justify-end mt-3">
                    <button className="bg-lime-400 text-black font-bold py-2 px-5 rounded-lg hover:bg-lime-300 transition-transform transform active:scale-95 active:brightness-90">
                        Postar
                    </button>
                </div>
             </div>

             {MOCK_SOCIAL_POSTS.map(post => (
                <div key={post.id} className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center space-x-3">
                        <img src={post.user.avatarUrl} alt={post.user.name} className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="font-bold">{post.user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{post.timestamp}</p>
                        </div>
                    </div>
                    <p className="my-4 text-gray-700 dark:text-gray-300">{post.content}</p>
                    <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400">
                        <button className="flex items-center space-x-1.5 hover:text-red-500 transition-colors">
                            <HeartIcon className="w-5 h-5"/>
                            <span className="text-sm font-semibold">{post.likes}</span>
                        </button>
                         <button className="flex items-center space-x-1.5 hover:text-blue-500 transition-colors">
                            <ChatIcon className="w-5 h-5"/>
                            <span className="text-sm font-semibold">{post.commentsCount}</span>
                        </button>
                    </div>
                </div>
             ))}
        </div>
    );
});

const TraderDetailModal = React.memo(({ isOpen, onClose, trader, onMakeProposal, mode }: { isOpen: boolean, onClose: () => void, trader: User | null, onMakeProposal: (trader: User) => void, mode: Mode }) => {
    if (!isOpen || !trader) return null;
    
    const userPortfolio = MOCK_ALL_PORTFOLIOS[trader.id] || [];
    const portfolioValue = userPortfolio.reduce((acc, item) => {
        const event = MOCK_EVENTS.find(e => e.id === item.eventId);
        return event ? acc + (event.orderBook.lastPrice * item.quantity) : acc;
    }, 0);
    
    const handleMakeProposal = useCallback(() => onMakeProposal(trader), [onMakeProposal, trader]);

    const buttonText = mode === 'trader' ? 'Fazer Proposta' : 'Negociar Ingressos';

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="text-center">
                 <img src={trader.avatarUrl} alt={trader.name} className="w-24 h-24 rounded-full mx-auto border-4 border-lime-400" />
                 <h2 className="text-2xl font-bold mt-4 text-black dark:text-white">{trader.name}</h2>
                 <p className="text-gray-500 dark:text-gray-400">@{trader.searchableName}</p>
            </div>
            
             <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Valor da Carteira (Estimado)</p>
                <p className="text-3xl font-bold text-lime-400 font-mono">R$ {portfolioValue.toFixed(2)}</p>
            </div>
            
            <div className="mt-6">
                <h3 className="font-bold text-lg mb-2 text-black dark:text-white">Ingressos em Carteira</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {userPortfolio.length > 0 ? userPortfolio.map(item => {
                         const event = MOCK_EVENTS.find(e => e.id === item.eventId);
                         if (!event) return null;
                         return (
                            <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                <div className="flex items-center gap-3">
                                    <img src={event.imageUrl} alt={event.name} className="w-10 h-10 rounded-md object-cover" />
                                    <div>
                                        <p className="font-semibold">{event.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.status}</p>
                                    </div>
                                </div>
                                <span className="font-bold font-mono">{item.quantity}x</span>
                            </div>
                         )
                    }) : <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">Este trader não possui ingressos na carteira.</p>}
                </div>
            </div>

            <button onClick={handleMakeProposal} className="w-full mt-8 bg-lime-400 text-black font-bold py-3 rounded-lg hover:bg-lime-300 transition-transform transform active:scale-95 active:brightness-90">
                {buttonText}
            </button>
        </Modal>
    );
});

const MakeProposalModal = React.memo(({ isOpen, onClose, trader, onSendProposal, mode }: { isOpen: boolean, onClose: () => void, trader: User | null, onSendProposal: (details: ProposalDetails) => void, mode: Mode }) => {
    const [proposalType, setProposalType] = useState<'buy' | 'sell'>('buy');
    const [selectedEventId, setSelectedEventId] = useState<number | ''>('');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);

    const traderPortfolio = useMemo(() => trader ? (MOCK_ALL_PORTFOLIOS[trader.id] || []) : [], [trader]);
    const userPortfolio = MOCK_ALL_PORTFOLIOS[MOCK_USER.id] || [];

    const availableEvents = useMemo(() => {
        if (proposalType === 'buy') {
            const eventIds = traderPortfolio.map(item => item.eventId);
            return MOCK_EVENTS.filter(e => eventIds.includes(e.id));
        } else {
             const eventIds = userPortfolio.map(item => item.eventId);
             return MOCK_EVENTS.filter(e => eventIds.includes(e.id));
        }
    }, [proposalType, traderPortfolio, userPortfolio]);
    
    useEffect(() => {
        if (isOpen) {
            setProposalType('buy');
            setSelectedEventId('');
            setQuantity(1);
            setPrice(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const event = MOCK_EVENTS.find(e => e.id === selectedEventId);
        if (event) {
            setPrice(event.orderBook.lastPrice);
        } else {
            setPrice(0);
        }
        setQuantity(1);
    }, [selectedEventId]);

    const maxQuantity = useMemo(() => {
        if (!selectedEventId) return 1;
        const portfolio = proposalType === 'buy' ? traderPortfolio : userPortfolio;
        return portfolio
            .filter(item => item.eventId === selectedEventId)
            .reduce((sum, item) => sum + item.quantity, 0);
    }, [selectedEventId, proposalType, traderPortfolio, userPortfolio]);

    const handleSend = useCallback(() => {
        if (selectedEventId) {
             onSendProposal({ eventId: selectedEventId, quantity, price, type: proposalType });
            onClose();
        }
    }, [onSendProposal, selectedEventId, quantity, price, proposalType, onClose]);
    
    const handleSetBuy = useCallback(() => { setProposalType('buy'); setSelectedEventId(''); }, []);
    const handleSetSell = useCallback(() => { setProposalType('sell'); setSelectedEventId(''); }, []);
    const handleSelectEvent = useCallback((id: number) => setSelectedEventId(id), []);

    if (!isOpen || !trader) return null;
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">
                {mode === 'trader' ? 'Fazer Proposta' : `Negociar com ${trader.name}`}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
                {mode === 'trader' ? `Negocie diretamente com ${trader.name}` : 'Envie uma oferta direta para ele.'}
            </p>

            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{mode === 'trader' ? 'Ação' : 'O que você quer fazer?'}</label>
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
                        <button onClick={handleSetBuy} className={`w-1/2 py-2 rounded-md font-semibold transition transform active:scale-95 ${proposalType === 'buy' ? 'bg-lime-400 text-black' : 'hover:bg-white/50 dark:hover:bg-gray-700/50'}`}>{mode === 'trader' ? 'Quero Comprar' : 'Comprar dele'}</button>
                        <button onClick={handleSetSell} className={`w-1/2 py-2 rounded-md font-semibold transition transform active:scale-95 ${proposalType === 'sell' ? 'bg-lime-400 text-black' : 'hover:bg-white/50 dark:hover:bg-gray-700/50'}`}>{mode === 'trader' ? 'Quero Vender' : 'Vender pra ele'}</button>
                    </div>
                </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {proposalType === 'buy' ? 'Qual ingresso você quer comprar dele?' : 'Qual ingresso seu você quer vender para ele?'}
                    </label>
                     <EventSelector events={availableEvents} selectedEventId={selectedEventId} onSelect={handleSelectEvent} disabled={false} />
                </div>
                {selectedEventId && (
                     <>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">{mode === 'trader' ? 'Preço Unitário (R$)' : 'Preço por ingresso (R$)'}</label>
                            <NumberInputStepper value={price} onChange={setPrice} min={0} step={0.50} price />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Quantidade</label>
                            <NumberInputStepper value={quantity} onChange={setQuantity} min={1} max={maxQuantity} />
                            <p className="text-xs text-right text-gray-500 dark:text-gray-400 mt-1">Máximo: {maxQuantity}</p>
                        </div>
                    </>
                )}
            </div>

            <button onClick={handleSend} disabled={!selectedEventId} className="w-full mt-8 bg-lime-400 text-black font-bold py-3 rounded-lg hover:bg-lime-300 transition-transform transform active:scale-95 active:brightness-90 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">
                {mode === 'trader' ? 'Enviar Proposta' : 'Enviar Oferta'}
            </button>
        </Modal>
    );
});

const NotificationActionModal = React.memo(({ isOpen, onClose, notification, events, traders, onConfirm, onReject, onCounterProposal }: { isOpen: boolean, onClose: () => void, notification: Notification | null, events: Event[], traders: User[], onConfirm: (notification: Notification) => void, onReject: (notification: Notification) => void, onCounterProposal: (notification: Notification) => void }) => {
    if (!isOpen || !notification || !notification.proposalDetails) return null;

    const { eventId, quantity, price, type } = notification.proposalDetails;
    const event = events.find(e => e.id === eventId);
    const trader = traders.find(t => t.id === notification.relatedId);

    const handleConfirm = useCallback(() => onConfirm(notification), [onConfirm, notification]);
    const handleReject = useCallback(() => onReject(notification), [onReject, notification]);
    const handleCounter = useCallback(() => onCounterProposal(notification), [onCounterProposal, notification]);


    if (!event || !trader) return null;
    
    const isBuyProposal = type === 'buy';
    const actionText = isBuyProposal ? "Vender para" : "Comprar de";
    const total = quantity * price;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
             <div className="text-center">
                 <img src={trader.avatarUrl} alt={trader.name} className="w-20 h-20 rounded-full mx-auto border-4 border-lime-400 mb-4" />
                 <h2 className="text-2xl font-bold text-black dark:text-white">Proposta de Negociação</h2>
                 <p className="text-gray-500 dark:text-gray-400 mt-1">
                     <span className="font-semibold text-gray-700 dark:text-gray-300">{trader.name}</span> quer negociar com você.
                 </p>
            </div>
            
            <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Evento</span>
                    <span className="font-bold">{event.name}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Quantidade</span>
                    <span className="font-mono font-bold">{quantity}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Preço Unitário</span>
                    <span className="font-mono font-bold">R$ {price.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                 <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">Total</span>
                    <span className="font-bold font-mono text-lime-400">R$ {total.toFixed(2)}</span>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
                 <button onClick={handleReject} className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-transform transform active:scale-95 active:brightness-90">
                    Recusar
                </button>
                 <button onClick={handleCounter} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform transform active:scale-95">
                    Contraproposta
                </button>
                <button onClick={handleConfirm} className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-transform transform active:scale-95 active:brightness-90">
                    Aceitar
                </button>
            </div>
        </Modal>
    );
});

const CounterProposalModal = React.memo(({ isOpen, onClose, notification, events, traders, onSendCounterProposal, portfolio }: { isOpen: boolean, onClose: () => void, notification: Notification | null, events: Event[], traders: User[], onSendCounterProposal: (details: ProposalDetails, originalNotification: Notification) => void, portfolio: PortfolioItem[] }) => {
    
    const [quantity, setQuantity] = useState(notification?.proposalDetails?.quantity || 1);
    const [price, setPrice] = useState(notification?.proposalDetails?.price || 0);

    useEffect(() => {
        if (isOpen && notification) {
            setQuantity(notification.proposalDetails?.quantity || 1);
            setPrice(notification.proposalDetails?.price || 0);
        }
    }, [isOpen, notification]);
    
    const trader = useMemo(() => traders.find(t => t.id === notification?.relatedId), [traders, notification]);
    const event = useMemo(() => events.find(e => e.id === notification?.proposalDetails?.eventId), [events, notification]);

    const newProposalType = useMemo(() => notification?.proposalDetails?.type === 'buy' ? 'sell' : 'buy', [notification]);

    const maxQuantity = useMemo(() => {
        if (!notification || !event) return 1;
        if (newProposalType === 'sell') {
            return portfolio
                .filter(item => item.eventId === event.id)
                .reduce((sum, item) => sum + item.quantity, 0);
        }
        return Infinity;
    }, [notification, event, newProposalType, portfolio]);

    const handleSend = useCallback(() => {
        if (notification && event) {
            onSendCounterProposal({
                eventId: event.id,
                quantity,
                price,
                type: newProposalType
            }, notification);
        }
    }, [notification, event, quantity, price, newProposalType, onSendCounterProposal]);

    if (!isOpen || !notification || !trader || !event) return null;

    const actionText = newProposalType === 'sell' ? `vender para ${trader.name}` : `comprar de ${trader.name}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">Fazer Contraproposta</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Sua nova oferta para {actionText}</p>
            
            <div className="space-y-4">
                <div>
                     <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ingresso</label>
                     <EventSelector events={[event]} selectedEventId={event.id} onSelect={() => {}} disabled={true} />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Novo Preço Unitário (R$)</label>
                    <NumberInputStepper value={price} onChange={setPrice} min={0} step={0.50} price />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Nova Quantidade</label>
                    <NumberInputStepper value={quantity} onChange={setQuantity} min={1} max={maxQuantity} />
                     {newProposalType === 'sell' && <p className="text-xs text-right text-gray-500 dark:text-gray-400 mt-1">Você pode vender até {maxQuantity}.</p>}
                </div>
            </div>

            <button onClick={handleSend} className="w-full mt-8 bg-lime-400 text-black font-bold py-3 rounded-lg hover:bg-lime-300 transition-transform transform active:scale-95 active:brightness-90">
                Enviar Contraproposta
            </button>
        </Modal>
    );
});

// --- ANIMATION COMPONENTS ---

const ToCasualAnimation = React.memo(() => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] animate-fade-in-fast pointer-events-none">
        <div className="relative w-48 h-48">
            {/* Sparkles */}
            <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                    <div 
                        key={i} 
                        className="absolute top-1/2 left-1/2"
                        style={{ transform: `rotate(${i * 30}deg)` }}
                    >
                        <div 
                            className="bg-lime-400 rounded-full animate-sparkle" 
                            style={{ 
                                animationDelay: `${0.2 + Math.random() * 0.2}s`,
                                width: `${Math.random() * 8 + 4}px`,
                                height: `${Math.random() * 8 + 4}px`,
                            }}
                        />
                    </div>
                ))}
            </div>
            <TicketIcon className="w-32 h-32 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pop-and-wiggle" />
        </div>
        <h2 
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-black tracking-wider animate-text-fade-in-scale-up"
            style={{ top: '40%', animationDelay: '0.4s', textShadow: '0 0 15px rgba(163, 230, 53, 0.7)' }}
        >
            Modo Casual
        </h2>
    </div>
));

const ToTraderAnimation = React.memo(() => (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] animate-fade-in-fast overflow-hidden pointer-events-none">
        <div className="absolute inset-0 grid-bg opacity-30 animate-grid-pan"></div>
        <svg className="absolute w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
            <path 
                d="M 0 120 C 50 100, 80 40, 120 80 S 180 160, 220 100 S 280 20, 320 70 S 380 150, 400 130"
                stroke="url(#line-gradient)"
                strokeWidth="3"
                fill="none"
                className="animate-draw-line"
            />
            <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a3e635" stopOpacity="0" />
                    <stop offset="20%" stopColor="#a3e635" />
                    <stop offset="80%" stopColor="#a3e635" />
                    <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
        <ChartBarIcon className="w-32 h-32 text-lime-300 animate-hud-pulse" />
        <h2 
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-lime-300 text-3xl font-black tracking-widest uppercase animate-hud-text-reveal"
            style={{ top: '40%', animationDelay: '0.5s', textShadow: '0 0 10px #a3e635' }}
        >
            Modo Trader
        </h2>
    </div>
));

const ModeChangeAnimation = React.memo(({ type }: { type: 'toCasual' | 'toTrader' }) => {
    return type === 'toCasual' ? <ToCasualAnimation /> : <ToTraderAnimation />;
});


// --- MAIN APP COMPONENT ---

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginStep, setLoginStep] = useState<LoginStep>('idle');
    const [currentView, setCurrentView] = useState('events');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [wishlist, setWishlist] = useState<number[]>([10, 12]);
    const [user, setUser] = useState<User>(MOCK_USER);
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>(MOCK_PORTFOLIO);
    const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>(MOCK_TRADE_HISTORY);
    const [theme, setTheme] = useState<Theme>('dark');
    const [selectedTrader, setSelectedTrader] = useState<User | null>(null);
    const [isTraderDetailModalOpen, setIsTraderDetailModalOpen] = useState(false);
    const [isMakeProposalModalOpen, setIsMakeProposalModalOpen] = useState(false);
    const [traderForProposal, setTraderForProposal] = useState<User | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [isNotificationActionModalOpen, setIsNotificationActionModalOpen] = useState(false);
    const [proposalHistory, setProposalHistory] = useState<ProposalHistoryItem[]>(MOCK_PROPOSAL_HISTORY);
    const [viewOptions, setViewOptions] = useState<{ searchTab?: 'traders' | 'events', profileTab?: ProfileTab }>({});
    const [mode, setMode] = useState<Mode>('trader');
    const [animationType, setAnimationType] = useState<'toCasual' | 'toTrader' | null>(null);
    const [isCounterProposalModalOpen, setIsCounterProposalModalOpen] = useState(false);
    const [proposalToCounter, setProposalToCounter] = useState<Notification | null>(null);


    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('bg-black');
            document.body.classList.remove('bg-gray-100');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.add('bg-gray-100');
            document.body.classList.remove('bg-black');
        }
    }, [theme]);
    
    const showToast = useCallback((message: string) => {
        setToastMessage(message);
    }, []);

    const handleLogin = useCallback(() => {
        setLoginStep('loading');
        setTimeout(() => {
            setIsLoggedIn(true);
            setLoginStep('idle');
        }, 2000);
    }, []);

    const handleLogout = useCallback(() => {
        setIsLoggedIn(false);
        setCurrentView('events');
        setSelectedEvent(null);
    }, []);

    const handleSelectEvent = useCallback((event: Event) => {
        setSelectedEvent(event);
        setCurrentView('eventDetail');
    }, []);

    const handleSelectTrader = useCallback((trader: User) => {
        setSelectedTrader(trader);
        setIsTraderDetailModalOpen(true);
    }, []);
    
    const handleMakeProposal = useCallback((trader: User) => {
        setIsTraderDetailModalOpen(false);
        setTraderForProposal(trader);
        setIsMakeProposalModalOpen(true);
    }, []);
    
    const handleSendProposal = useCallback((details: ProposalDetails) => {
        showToast("Proposta enviada com sucesso!");
        // FIX: Explicitly typing the new proposal object ensures that TypeScript
        // correctly infers the 'status' property as a specific string literal
        // ('Enviada') rather than widening it to the general 'string' type. This
        // satisfies the 'ProposalHistoryItem' interface and resolves the type error.
        setProposalHistory(prev => {
            const newProposal: ProposalHistoryItem = {
                id: Date.now(),
                traderId: traderForProposal!.id,
                eventId: details.eventId,
                proposalDetails: details,
                status: 'Enviada',
                direction: 'outgoing',
                timestamp: 'agora'
            };
            return [newProposal, ...prev];
        });
    }, [showToast, traderForProposal]);
    
    const handleMarketTrade = useCallback((event: Event, type: 'COMPRAR' | 'VENDER', quantity: number, price: number) => {
        showToast(`Ordem de ${type} para ${quantity} ingresso(s) de ${event.name} a R$${price.toFixed(2)} enviada!`);
        
        const newTrade: TradeHistoryItem = {
            id: Date.now(),
            transactionId: `TXN${Math.floor(Math.random() * 90000) + 10000}`,
            eventId: event.id,
            eventName: event.name,
            price,
            type: type === 'COMPRAR' ? 'Compra' : 'Venda',
            quantity,
            date: new Date().toLocaleDateString('pt-BR'),
        };

        setTradeHistory(prev => [newTrade, ...prev]);

        if (type === 'COMPRAR') {
             setUser(prev => ({ ...prev, balance: prev.balance - (price * quantity) }));
             setPortfolio(prevPortfolio => {
                 const existingItem = prevPortfolio.find(p => p.eventId === event.id && p.purchasePrice === price);
                 if (existingItem) {
                     return prevPortfolio.map(p => p.id === existingItem.id ? { ...p, quantity: p.quantity + quantity } : p);
                 } else {
                     return [...prevPortfolio, {
                         id: Date.now(),
                         eventId: event.id,
                         purchasePrice: price,
                         quantity: quantity,
                         status: 'Na Carteira'
                     }];
                 }
             });
        } else { // VENDER
            setUser(prev => ({ ...prev, balance: prev.balance + (price * quantity) }));
            setPortfolio(prevPortfolio => {
                let quantityToSell = quantity;
                const otherEventItems = prevPortfolio.filter(item => item.eventId !== event.id);
                const thisEventItems = prevPortfolio
                    .filter(item => item.eventId === event.id)
                    .sort((a, b) => a.purchasePrice - b.purchasePrice); // Sell cheapest first (FIFO-like)

                const updatedThisEventItems: PortfolioItem[] = [];
                for (const item of thisEventItems) {
                    if (quantityToSell > 0) {
                        const amountToSellFromThisItem = Math.min(quantityToSell, item.quantity);
                        const newQuantity = item.quantity - amountToSellFromThisItem;
                        quantityToSell -= amountToSellFromThisItem;
                        if (newQuantity > 0) {
                            updatedThisEventItems.push({ ...item, quantity: newQuantity });
                        }
                    } else {
                        updatedThisEventItems.push(item);
                    }
                }
                return [...otherEventItems, ...updatedThisEventItems];
            });
        }
    }, [showToast]);

    const handleConfirmProposal = useCallback((notification: Notification) => {
        const { proposalDetails } = notification;
        if (!proposalDetails) return;
        
        const { eventId, quantity, price, type } = proposalDetails;
        const event = MOCK_EVENTS.find(e => e.id === eventId);
    
        if (!event) {
            showToast("Erro: Evento não encontrado.");
            setIsNotificationActionModalOpen(false);
            return;
        }
    
        const userAction: 'COMPRAR' | 'VENDER' = type === 'buy' ? 'VENDER' : 'COMPRAR';
    
        if (userAction === 'VENDER') {
            const userTicketsForEvent = portfolio.filter(item => item.eventId === eventId).reduce((sum, item) => sum + item.quantity, 0);
            if (userTicketsForEvent < quantity) {
                showToast("Erro: Você não tem ingressos suficientes para vender.");
                setIsNotificationActionModalOpen(false);
                return;
            }
        } else {
            const totalCost = price * quantity;
            if (user.balance < totalCost) {
                showToast("Erro: Saldo insuficiente para comprar.");
                setIsNotificationActionModalOpen(false);
                return;
            }
        }
    
        showToast("Proposta aceita! Negócio fechado.");
        handleMarketTrade(event, userAction, quantity, price);
        setProposalHistory(prev => prev.map(p => p.id === notification.proposalId ? { ...p, status: 'Aceita' } : p));
        setIsNotificationActionModalOpen(false);
        
    }, [portfolio, user.balance, handleMarketTrade, showToast]);

    const handleRejectProposal = useCallback((notification: Notification) => {
        showToast("Proposta recusada.");
        setProposalHistory(prev => prev.map(p => p.id === notification.proposalId ? { ...p, status: 'Recusada' } : p));
        setIsNotificationActionModalOpen(false);
    }, [showToast]);

    const handleOpenCounterProposal = useCallback((notification: Notification) => {
        setIsNotificationActionModalOpen(false);
        setProposalToCounter(notification);
        setIsCounterProposalModalOpen(true);
    }, []);

    const handleSendCounterProposal = useCallback((details: ProposalDetails, originalNotification: Notification) => {
        showToast("Contraproposta enviada!");
        
        // Mark original proposal as countered
        setProposalHistory(prev => {
            const updatedHistory = prev.map(p => 
                p.id === originalNotification.proposalId ? { ...p, status: 'Contraproposta' } : p
            );
            
            // Add new outgoing proposal
            updatedHistory.unshift({
                id: Date.now(),
                traderId: originalNotification.relatedId,
                eventId: details.eventId,
                proposalDetails: details,
                status: 'Enviada',
                direction: 'outgoing',
                timestamp: 'agora',
            });
            return updatedHistory;
        });

        setIsCounterProposalModalOpen(false);
    }, [showToast]);

    const handleNotificationClick = useCallback((notification: Notification) => {
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
        
        if (notification.type === 'trade' && notification.proposalDetails) {
            setSelectedNotification(notification);
            setIsNotificationActionModalOpen(true);
        } else if (notification.type === 'event') {
            const event = MOCK_EVENTS.find(e => e.id === notification.relatedId);
            if(event) handleSelectEvent(event);
        } else {
            showToast(notification.message);
        }
    }, [handleSelectEvent, showToast]);

    const handleBackToEvents = useCallback(() => {
        setSelectedEvent(null);
        setCurrentView('events');
    }, []);

    const handleToggleWishlist = useCallback((eventId: number) => {
        const event = MOCK_EVENTS.find(e => e.id === eventId);
        if (event) {
            const isCurrentlyWishlisted = wishlist.includes(eventId);
            showToast(isCurrentlyWishlisted ? `${event.name} removido dos favoritos.` : `${event.name} adicionado aos favoritos!`);
        }
        setWishlist(prev => 
            prev.includes(eventId) 
            ? prev.filter(id => id !== eventId) 
            : [...prev, eventId]
        );
    }, [wishlist, showToast]);
    
    const handleUpdateUser = useCallback((updatedUser: User) => {
        setUser(updatedUser);
    }, []);
    
    const handleAddBalance = useCallback((amount: number) => {
        setUser(prev => ({ ...prev, balance: prev.balance + amount }));
        showToast(`R$ ${amount.toFixed(2)} adicionado com sucesso!`);
    }, [showToast]);
    
    const handleWithdrawBalance = useCallback((amount: number) => {
        if (amount > user.balance) {
            showToast("Saldo insuficiente para retirada.");
            return;
        }
        setUser(prev => ({ ...prev, balance: prev.balance - amount }));
        showToast(`R$ ${amount.toFixed(2)} retirado com sucesso!`);
    }, [user.balance, showToast]);

    const handleNavigate = useCallback((view: string, options: { searchTab?: 'traders' | 'events', profileTab?: ProfileTab } = {}) => {
        setViewOptions(options);
        if (view === 'eventDetail' && selectedEvent) {
             setCurrentView('eventDetail');
        } else {
             setSelectedEvent(null);
             setCurrentView(view);
        }
    }, [selectedEvent]);

    const handleSetMode = useCallback((newMode: Mode) => {
        if (mode === newMode) return;
        const type = newMode === 'casual' ? 'toCasual' : 'toTrader';
        setAnimationType(type);
        setTimeout(() => {
            setMode(newMode);
            setAnimationType(null);
        }, 1400);
    }, [mode]);
    
    const handleCloseTraderDetailModal = useCallback(() => setIsTraderDetailModalOpen(false), []);
    const handleCloseMakeProposalModal = useCallback(() => setIsMakeProposalModalOpen(false), []);
    const handleCloseNotificationActionModal = useCallback(() => setIsNotificationActionModalOpen(false), []);
    const handleCloseCounterProposalModal = useCallback(() => setIsCounterProposalModalOpen(false), []);
    
    const handleNavigateToSearch = useCallback(() => handleNavigate('search'), [handleNavigate]);

    const renderView = useCallback(() => {
        switch (currentView) {
            case 'eventDetail':
                return selectedEvent && <EventDetailScreen event={selectedEvent} onBack={handleBackToEvents} showToast={showToast} isWishlisted={wishlist.includes(selectedEvent.id)} onToggleWishlist={handleToggleWishlist} onMarketTrade={handleMarketTrade} portfolio={portfolio} mode={mode} />;
            case 'portfolio':
                return <PortfolioScreen portfolio={portfolio} events={MOCK_EVENTS} tradeHistory={tradeHistory} portfolioHistory={MOCK_PORTFOLIO_HISTORY} showToast={showToast} wishlist={wishlist} onSelectEvent={handleSelectEvent} onToggleWishlist={handleToggleWishlist} mode={mode} />;
            case 'search':
                return <SearchScreen onSelectEvent={handleSelectEvent} onSelectTrader={handleSelectTrader} initialTab={viewOptions.searchTab || 'events'} onBack={handleBackToEvents} mode={mode} />;
            case 'social':
                return <SocialScreen />;
            case 'profile':
                return <ProfileScreen user={user} onUpdateUser={handleUpdateUser} showToast={showToast} theme={theme} setTheme={setTheme} onAddBalance={handleAddBalance} onWithdrawBalance={handleWithdrawBalance} initialTab={viewOptions.profileTab || 'profile'} proposalHistory={proposalHistory} allTraders={MOCK_TRADERS} allEvents={MOCK_EVENTS} />;
            case 'events':
            default:
                return <EventListScreen events={MOCK_EVENTS} onSelectEvent={handleSelectEvent} onNavigateToSearch={handleNavigateToSearch} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} mode={mode}/>;
        }
    }, [currentView, selectedEvent, handleBackToEvents, showToast, wishlist, handleToggleWishlist, handleMarketTrade, portfolio, mode, tradeHistory, handleSelectEvent, handleSelectTrader, viewOptions, user, handleUpdateUser, theme, handleAddBalance, handleWithdrawBalance, proposalHistory, handleNavigateToSearch]);

    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} loginStep={loginStep} />;
    }

    return (
        <div className={`app-container min-h-screen transition-colors duration-500`}>
            {animationType && <ModeChangeAnimation type={animationType} />}
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
            <Header user={user} onLogout={handleLogout} onNavigate={handleNavigate} currentView={currentView} notifications={notifications} setNotifications={setNotifications} onNotificationClick={handleNotificationClick} proposalHistory={proposalHistory} allTraders={MOCK_TRADERS} allEvents={MOCK_EVENTS} currentMode={mode} onSetMode={handleSetMode} />
            <main className="container mx-auto px-4 pt-24 pb-24 md:pt-32">
                {renderView()}
            </main>
            <TraderDetailModal isOpen={isTraderDetailModalOpen} onClose={handleCloseTraderDetailModal} trader={selectedTrader} onMakeProposal={handleMakeProposal} mode={mode} />
            <MakeProposalModal isOpen={isMakeProposalModalOpen} onClose={handleCloseMakeProposalModal} trader={traderForProposal} onSendProposal={handleSendProposal} mode={mode} />
            <NotificationActionModal isOpen={isNotificationActionModalOpen} onClose={handleCloseNotificationActionModal} notification={selectedNotification} events={MOCK_EVENTS} traders={MOCK_TRADERS} onConfirm={handleConfirmProposal} onReject={handleRejectProposal} onCounterProposal={handleOpenCounterProposal} />
            <CounterProposalModal isOpen={isCounterProposalModalOpen} onClose={handleCloseCounterProposalModal} notification={proposalToCounter} events={MOCK_EVENTS} traders={MOCK_TRADERS} onSendCounterProposal={handleSendCounterProposal} portfolio={portfolio} />
            <BottomNav onNavigate={handleNavigate} currentView={currentView} />
        </div>
    );
};

export default App;
