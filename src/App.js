import React, { useState, useEffect, useCallback, useMemo } from "react";

// ─── DEFAULT DATA ───────────────────────────────────────────────────────────

const DEFAULT_CHORES = [
    { id: 1, name: "Make the bed", category: "Easy", notes: "Basic straightening, not perfect", tickets: 1, recurring: "daily" },
    { id: 2, name: "Put dirty clothes in hamper", category: "Easy", notes: "After changing", tickets: 1, recurring: "daily" },
    { id: 3, name: "Feed pets", category: "Easy", notes: "Scoop food, refill water", tickets: 1, recurring: "daily" },
    { id: 4, name: "Pick up your Toys", category: "Easy", notes: "Anything on the floor", tickets: 1, recurring: "daily" },
    { id: 5, name: "Pick up after Penelope", category: "Easy", notes: "Indoor or outdoor", tickets: 1, recurring: "daily" },
    { id: 6, name: "Wipe down table after meals", category: "Easy", notes: "With a damp cloth", tickets: 1, recurring: "daily" },
    { id: 7, name: "Dust low surfaces", category: "Easy", notes: "Like coffee tables, baseboards", tickets: 1, recurring: "weekly" },
    { id: 8, name: "Empty small trash bins", category: "Easy", notes: "Bathroom or bedroom", tickets: 1, recurring: "weekly" },
    { id: 9, name: "Fold laundry", category: "Medium", notes: "Towels, socks, shirts", tickets: 2, recurring: "weekly" },
    { id: 10, name: "Match socks", category: "Medium", notes: "Sorting activity too", tickets: 2, recurring: "weekly" },
    { id: 11, name: "Put away clean clothes", category: "Medium", notes: "In correct drawers", tickets: 2, recurring: "weekly" },
    { id: 12, name: "Wash Dishes", category: "Medium", notes: "With guidance", tickets: 2, recurring: "daily" },
    { id: 13, name: "Help pack lunch/snack", category: "Medium", notes: "With guidance", tickets: 2, recurring: "daily" },
    { id: 14, name: "Wipe down counters", category: "Medium", notes: "Especially after messes", tickets: 2, recurring: "daily" },
    { id: 15, name: "Keep closet clean", category: "Medium", notes: "Organized", tickets: 2, recurring: "weekly" },
    { id: 16, name: "Take trash to outdoor bin", category: "Hard", notes: "Only if physically safe", tickets: 4, recurring: "weekly" },
    { id: 17, name: "Assist in washing car", category: "Hard", notes: "Hose, sponge, towel off", tickets: 4, recurring: "monthly" },
    { id: 18, name: "Cook simple meals", category: "Hard", notes: "Sandwiches, scrambled eggs", tickets: 4, recurring: "weekly" },
];

const storeItems = [
    { id: 1, name: "30 min extra screen time", cost: 6, emoji: "📱", category: "Fun Time" },
    { id: 2, name: "Choose tonight's movie", cost: 5, emoji: "🎬", category: "Entertainment" },
    { id: 3, name: "Stay up 30 min later", cost: 8, emoji: "🌙", category: "Special Privilege" },
    { id: 4, name: "Small toy or book", cost: 12, emoji: "🎁", category: "Physical Reward" },
    { id: 5, name: "Trip to the park with snack", cost: 10, emoji: "🏞️", category: "Outing" },
    { id: 6, name: "Ice cream treat", cost: 7, emoji: "🍦", category: "Treat" },
    { id: 7, name: "Friend sleepover", cost: 20, emoji: "🏠", category: "Big Reward" },
    { id: 8, name: "Choose what's for dinner", cost: 4, emoji: "🍽️", category: "Choice" },
    { id: 9, name: "$5 cash", cost: 20, emoji: "💵", category: "Money" },
    { id: 10, name: "Art supplies", cost: 15, emoji: "🎨", category: "Creative" }
];

const achievements = [
    { id: 1,  name: "First Steps",       description: "Complete your very first chore",        icon: "👶", requirement: 1,   type: "chores_completed" },
    { id: 2,  name: "Getting Started",   description: "Complete 5 chores total",               icon: "🌱", requirement: 5,   type: "chores_completed" },
    { id: 3,  name: "Chore Champion",    description: "Complete 25 chores total",              icon: "🏆", requirement: 25,  type: "chores_completed" },
    { id: 4,  name: "Century Club",      description: "Complete 100 chores — legendary!",      icon: "💯", requirement: 100, type: "chores_completed" },
    { id: 5,  name: "Ticket Collector",  description: "Earn 20 tickets",                       icon: "🎟️", requirement: 20,  type: "tickets_earned"   },
    { id: 6,  name: "Ticket Hoarder",    description: "Earn 50 tickets total",                 icon: "💰", requirement: 50,  type: "tickets_earned"   },
    { id: 7,  name: "Big Spender",       description: "Spend 15 tickets in the store",         icon: "💸", requirement: 15,  type: "tickets_spent"    },
    { id: 8,  name: "Shop Till You Drop",description: "Spend 50 tickets in the store",         icon: "🛍️", requirement: 50,  type: "tickets_spent"    },
    { id: 9,  name: "3-Day Streak",      description: "Complete chores 3 days in a row",       icon: "🔥", requirement: 3,   type: "daily_streak"     },
    { id: 10, name: "Week Warrior",      description: "Complete chores 7 days in a row",       icon: "⭐", requirement: 7,   type: "daily_streak"     },
    { id: 11, name: "Two Week Hero",     description: "Complete chores 14 days in a row",      icon: "🗓️", requirement: 14,  type: "daily_streak"     },
    { id: 12, name: "Hard Worker",       description: "Complete 5 hard chores",                icon: "💪", requirement: 5,   type: "hard_chores"      },
];

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────

const DIFF = {
    Easy: { bg: '#d1f2d8', accent: '#2dba4e', dark: '#005320', border: '#a8e6b8', text: '#002d0f', emoji: '🟢' },
    Medium: { bg: '#fff3c4', accent: '#d4a017', dark: '#7a5000', border: '#ffe08a', text: '#3d2f00', emoji: '🟡' },
    Hard: { bg: '#ffd8b1', accent: '#f6851b', dark: '#8a3a00', border: '#ffbb80', text: '#3d1500', emoji: '🟠' },
};

const BADGE_GRADIENTS = [
    'linear-gradient(135deg, #2dba4e, #1a9e3a)',
    'linear-gradient(135deg, #0969da, #0051ae)',
    'linear-gradient(135deg, #f6851b, #d4a017)',
    'linear-gradient(135deg, #9333ea, #7c3aed)',
    'linear-gradient(135deg, #e11d48, #be123c)',
    'linear-gradient(135deg, #0891b2, #0e7490)',
    'linear-gradient(135deg, #d97706, #b45309)',
    'linear-gradient(135deg, #16a34a, #15803d)',
];

// ─── UTILITIES ─────────────────────────────────────────────────────────────

function calculateStreak(completionHistory) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    let checkDate = new Date(today);
    if (!completionHistory[todayStr]) checkDate.setDate(checkDate.getDate() - 1);
    let streak = 0;
    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (completionHistory[dateStr]) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
        else break;
    }
    return streak;
}

class StorageManager {
    static get(key, defaultValue) {
        if (typeof window === "undefined" || !window.localStorage) return defaultValue;
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch { return defaultValue; }
    }
    static set(key, value) {
        if (typeof window === "undefined" || !window.localStorage) return;
        try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    }
}

// ─── STATE ─────────────────────────────────────────────────────────────────

function useAppState() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [choreList, setChoreList] = useState(() => StorageManager.get("choreList", DEFAULT_CHORES));
    const [completedChores, setCompletedChores] = useState(() => StorageManager.get("completedChores", []));
    const [ticketsBanked, setTicketsBanked] = useState(() => StorageManager.get("ticketsBanked", 0));
    const [ticketsRedeemed, setTicketsRedeemed] = useState(() => StorageManager.get("redeemedTickets", 0));
    const [completionHistory, setCompletionHistory] = useState(() => StorageManager.get("completionHistory", {}));
    const [unlockedAchievements, setUnlockedAchievements] = useState(() => StorageManager.get("unlockedAchievements", []));

    useEffect(() => { StorageManager.set("choreList", choreList); }, [choreList]);
    useEffect(() => { StorageManager.set("completedChores", completedChores); }, [completedChores]);
    useEffect(() => { StorageManager.set("ticketsBanked", ticketsBanked); }, [ticketsBanked]);
    useEffect(() => { StorageManager.set("redeemedTickets", ticketsRedeemed); }, [ticketsRedeemed]);
    useEffect(() => { StorageManager.set("completionHistory", completionHistory); }, [completionHistory]);
    useEffect(() => { StorageManager.set("unlockedAchievements", unlockedAchievements); }, [unlockedAchievements]);

    const availableTickets = ticketsBanked - ticketsRedeemed;

    const stats = useMemo(() => ({
        currentStreak: calculateStreak(completionHistory),
        totalChoresCompleted: completedChores.length,
        totalTicketsEarned: ticketsBanked,
        totalTicketsSpent: ticketsRedeemed,
        hardChoresCompleted: completedChores.filter(name =>
            choreList.find(c => c.name === name)?.category === 'Hard'
        ).length,
        weeklyGoalProgress: Math.round((completedChores.length / Math.max(choreList.length * 0.75, 1)) * 100),
    }), [completedChores, ticketsBanked, ticketsRedeemed, completionHistory, choreList]);

    const groupedChores = useMemo(() => ({
        Easy: choreList.filter(c => c.category === 'Easy'),
        Medium: choreList.filter(c => c.category === 'Medium'),
        Hard: choreList.filter(c => c.category === 'Hard'),
    }), [choreList]);

    const toggleChore = useCallback((chore) => {
        setCompletedChores(prev => {
            const isCompleting = !prev.includes(chore.name);
            if (isCompleting) {
                const today = new Date().toISOString().split('T')[0];
                setCompletionHistory(h => ({ ...h, [today]: true }));
                setTicketsBanked(t => t + chore.tickets);
            } else {
                setTicketsBanked(t => t - chore.tickets);
            }
            return isCompleting ? [...prev, chore.name] : prev.filter(n => n !== chore.name);
        });
    }, []);

    const purchaseItem = useCallback((cost) => {
        if (cost <= availableTickets) { setTicketsRedeemed(p => p + cost); return true; }
        return false;
    }, [availableTickets]);

    const resetWeek = useCallback(() => setCompletedChores([]), []);

    const unlockAchievement = useCallback((id) => {
        setUnlockedAchievements(p => p.includes(id) ? p : [...p, id]);
    }, []);

    const resetAll = useCallback(() => {
        setCompletedChores([]);
        setTicketsBanked(0);
        setTicketsRedeemed(0);
        setCompletionHistory({});
        setUnlockedAchievements([]);
    }, []);

    const addDevTickets = useCallback((n) => setTicketsBanked(t => t + n), []);

    const simulateStreak = useCallback((days) => {
        const today = new Date();
        const history = {};
        for (let i = 0; i < days; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            history[d.toISOString().split('T')[0]] = true;
        }
        setCompletionHistory(h => ({ ...h, ...history }));
    }, []);

    const unlockAllAchievements = useCallback(() => {
        setUnlockedAchievements(achievements.map(a => a.id));
    }, []);

    // ── Chore management ──────────────────────────────────────────────────

    const addChore = useCallback((data) => {
        setChoreList(prev => [...prev, { ...data, id: Date.now() }]);
    }, []);

    const editChore = useCallback((oldName, newData) => {
        setChoreList(prev => prev.map(c => c.name === oldName ? { ...c, ...newData } : c));
        if (newData.name !== oldName) {
            setCompletedChores(prev => prev.map(n => n === oldName ? newData.name : n));
        }
    }, []);

    const deleteChore = useCallback((chore) => {
        setChoreList(prev => prev.filter(c => c.name !== chore.name));
        setCompletedChores(prev => {
            if (prev.includes(chore.name)) {
                setTicketsBanked(t => Math.max(0, t - chore.tickets));
                return prev.filter(n => n !== chore.name);
            }
            return prev;
        });
    }, []);

    const resetChoresToDefault = useCallback(() => {
        setChoreList(DEFAULT_CHORES);
        setCompletedChores([]);
    }, []);

    return {
        currentPage, choreList, completedChores, ticketsBanked, ticketsRedeemed,
        completionHistory, unlockedAchievements, availableTickets, stats, groupedChores,
        setCurrentPage, toggleChore, purchaseItem, resetWeek, unlockAchievement, resetAll,
        addChore, editChore, deleteChore, resetChoresToDefault,
        addDevTickets, simulateStreak, unlockAllAchievements,
    };
}

const checkAchievement = (achievement, stats) => {
    switch (achievement.type) {
        case 'chores_completed': return stats.totalChoresCompleted >= achievement.requirement;
        case 'tickets_earned': return stats.totalTicketsEarned >= achievement.requirement;
        case 'tickets_spent': return stats.totalTicketsSpent >= achievement.requirement;
        case 'daily_streak': return stats.currentStreak >= achievement.requirement;
        case 'hard_chores': return stats.hardChoresCompleted >= achievement.requirement;
        default: return false;
    }
};

function useAchievementChecker(stats, unlockedAchievements, unlockAchievement) {
    useEffect(() => {
        achievements.forEach(a => {
            if (!unlockedAchievements.includes(a.id) && checkAchievement(a, stats))
                unlockAchievement(a.id);
        });
    }, [stats, unlockedAchievements, unlockAchievement]);
}

// ─── SHARED UI ─────────────────────────────────────────────────────────────

function TicketPill({ count }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'linear-gradient(135deg, #0051ae, #0969da)',
            borderRadius: 9999, padding: '6px 14px',
            boxShadow: '0 3px 0 #003f88',
            color: 'white', fontWeight: 700, fontSize: 15,
            userSelect: 'none',
        }}>
            <span style={{ fontSize: 18 }}>🎟️</span>
            <span>{count}</span>
        </div>
    );
}

// ─── NAVIGATION ─────────────────────────────────────────────────────────────

function Navigation({ currentPage, onPageChange, availableTickets, devMode, onDevModeToggle }) {
    const clickCountRef = React.useRef(0);
    const clickTimerRef = React.useRef(null);

    const handleTitleClick = () => {
        clickCountRef.current += 1;
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 2000);
        if (clickCountRef.current >= 5) { clickCountRef.current = 0; onDevModeToggle(); }
    };

    const tabs = [
        { id: 'dashboard', label: 'Home', icon: '🏠' },
        { id: 'chores', label: 'Quests', icon: '⚡' },
        { id: 'rewards', label: 'Store', icon: '🛒' },
        { id: 'progress', label: 'Badges', icon: '🏅' },
        { id: 'parent', label: 'Parent', icon: '🔐' },
    ];

    return (
        <>
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'white',
                borderBottom: '1px solid #c2c6d6',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
                <div style={{
                    maxWidth: 560, margin: '0 auto',
                    padding: '0 20px', height: 60,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 22 }}>⚡</span>
                        <h1
                            onClick={handleTitleClick}
                            style={{
                                margin: 0, fontSize: 20, fontWeight: 800,
                                color: '#0051ae', cursor: 'default', userSelect: 'none',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Chore Quest
                        </h1>
                        {devMode && (
                            <span style={{
                                fontSize: 10, fontWeight: 700, color: 'white',
                                background: '#ba1a1a', borderRadius: 4, padding: '2px 6px',
                            }}>
                                DEV
                            </span>
                        )}
                    </div>
                    <TicketPill count={availableTickets} />
                </div>
            </header>

            <nav style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
                background: 'white',
                borderTop: '1px solid #c2c6d6',
                boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
                paddingBottom: 'env(safe-area-inset-bottom)',
            }}>
                <div style={{
                    maxWidth: 560, margin: '0 auto',
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                }}>
                    {tabs.map(tab => {
                        const isActive = currentPage === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onPageChange(tab.id)}
                                style={{
                                    background: 'none', border: 'none',
                                    borderTop: isActive ? '3px solid #0969da' : '3px solid transparent',
                                    padding: '10px 4px 8px',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', gap: 3,
                                    cursor: 'pointer',
                                    color: isActive ? '#0969da' : '#727785',
                                    fontFamily: 'inherit',
                                    transition: 'color 0.15s, border-color 0.15s',
                                }}
                            >
                                <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
                                <span style={{ fontSize: 10, fontWeight: 700 }}>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}

// ─── DASHBOARD ──────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, bg, accent }) {
    return (
        <div style={{
            background: bg, borderRadius: 16, padding: '16px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            border: `1px solid ${accent}55`,
            boxShadow: `0 3px 0 ${accent}33`,
            textAlign: 'center',
        }}>
            <span style={{ fontSize: 26, lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: accent, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {value}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#727785', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {label}
            </span>
        </div>
    );
}

function ActionButton({ icon, title, subtitle, onClick, primary }) {
    return (
        <button
            onClick={onClick}
            style={{
                width: '100%', padding: '18px 16px',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
                textAlign: 'left', fontFamily: 'inherit',
                background: primary ? 'linear-gradient(135deg, #0051ae, #0969da)' : 'white',
                color: primary ? 'white' : '#171c22',
                border: primary ? 'none' : '1px solid #c2c6d6',
                borderRadius: 16, cursor: 'pointer',
                boxShadow: primary ? '0 4px 0 #003f88' : '0 4px 0 rgba(0,0,0,0.08)',
                transition: 'box-shadow 0.1s, transform 0.1s',
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = primary ? '0 1px 0 #003f88' : '0 1px 0 rgba(0,0,0,0.06)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = primary ? '0 4px 0 #003f88' : '0 4px 0 rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = primary ? '0 4px 0 #003f88' : '0 4px 0 rgba(0,0,0,0.08)'; }}
            onTouchStart={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = primary ? '0 1px 0 #003f88' : '0 1px 0 rgba(0,0,0,0.06)'; }}
            onTouchEnd={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = primary ? '0 4px 0 #003f88' : '0 4px 0 rgba(0,0,0,0.08)'; }}
        >
            <span style={{ fontSize: 30, lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{title}</span>
            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.75 }}>{subtitle}</span>
        </button>
    );
}

function Dashboard({ stats, completedChores, groupedChores, availableTickets, onPageChange }) {
    const totalChores = Object.values(groupedChores).flat().length;
    const completedCount = completedChores.length;
    const progressPct = totalChores > 0 ? Math.min(100, Math.round((completedCount / totalChores) * 100)) : 0;

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning! ☀️';
        if (h < 17) return 'Good afternoon! 👋';
        return 'Good evening! 🌙';
    };

    return (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 110px' }}>
            <div style={{ marginBottom: 24 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#727785' }}>{getGreeting()}</p>
                <h2 style={{ margin: '4px 0 0', fontSize: 30, fontWeight: 800, color: '#171c22', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    Ready to level up?
                </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                <StatCard icon="🔥" label="Streak" value={`${stats.currentStreak}d`} bg="#ffd8b1" accent="#f6851b" />
                <StatCard icon="✅" label="Done" value={`${completedCount}/${totalChores}`} bg="#d1f2d8" accent="#2dba4e" />
                <StatCard icon="🎯" label="Goal" value={`${progressPct}%`} bg="#d8e2ff" accent="#0969da" />
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 20, border: '1px solid #c2c6d6', boxShadow: '0 4px 0 rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#171c22' }}>Weekly Progress</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0969da' }}>{completedCount} / {totalChores}</span>
                </div>
                <div style={{ background: '#eaeef6', borderRadius: 9999, height: 14, overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', borderRadius: 9999,
                        background: progressPct === 100 ? 'linear-gradient(90deg, #2dba4e, #1a9e3a)' : 'linear-gradient(90deg, #0051ae, #0969da)',
                        width: `${progressPct}%`,
                        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        minWidth: progressPct > 0 ? 14 : 0,
                    }} />
                </div>
                {progressPct === 100 && (
                    <p style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 700, color: '#2dba4e', textAlign: 'center' }}>🎉 Weekly goal complete!</p>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <ActionButton icon="⚡" title="Start Quests" subtitle={`${totalChores - completedCount} remaining`} onClick={() => onPageChange('chores')} primary />
                <ActionButton icon="🛒" title="Visit Store" subtitle={`${availableTickets} tickets ready`} onClick={() => onPageChange('rewards')} />
            </div>

            <button
                onClick={() => onPageChange('progress')}
                style={{
                    width: '100%', padding: '18px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontFamily: 'inherit', cursor: 'pointer',
                    background: 'white', borderRadius: 16, border: '1px solid #c2c6d6',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.06)', transition: 'box-shadow 0.15s, transform 0.15s',
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.04)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 0 rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 0 rgba(0,0,0,0.06)'; }}
            >
                <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 800, color: '#171c22' }}>🏅 Achievements</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#727785' }}>Earn badges by completing chores</p>
                </div>
                <span style={{ fontSize: 22, color: '#c2c6d6' }}>›</span>
            </button>
        </div>
    );
}

// ─── CHORES LIST ────────────────────────────────────────────────────────────

function ChoreCard({ chore, isCompleted, onToggle }) {
    const d = DIFF[chore.category];
    return (
        <div
            onClick={() => onToggle(chore)}
            style={{
                background: isCompleted ? '#f0f4fc' : 'white',
                borderRadius: 16,
                border: `1px solid ${isCompleted ? '#c2c6d6' : d.border}`,
                boxShadow: isCompleted ? '0 2px 0 rgba(0,0,0,0.04)' : `0 4px 0 ${d.accent}33`,
                cursor: 'pointer', display: 'flex', overflow: 'hidden',
                transition: 'box-shadow 0.15s, transform 0.15s, background 0.2s',
                userSelect: 'none',
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.04)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isCompleted ? '0 2px 0 rgba(0,0,0,0.04)' : `0 4px 0 ${d.accent}33`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isCompleted ? '0 2px 0 rgba(0,0,0,0.04)' : `0 4px 0 ${d.accent}33`; }}
            onTouchStart={e => { e.currentTarget.style.transform = 'translateY(2px)'; }}
            onTouchEnd={e => { e.currentTarget.style.transform = ''; }}
        >
            <div style={{ width: 6, flexShrink: 0, background: isCompleted ? '#c2c6d6' : d.accent, transition: 'background 0.2s' }} />
            <div style={{ flex: 1, padding: '14px 14px 14px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: isCompleted ? '#727785' : '#171c22', textDecoration: isCompleted ? 'line-through' : 'none', flex: 1, lineHeight: 1.3 }}>
                        {chore.name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: isCompleted ? '#eaeef6' : d.bg, borderRadius: 9999, padding: '3px 8px', border: `1px solid ${isCompleted ? '#c2c6d6' : d.border}` }}>
                            <span style={{ fontSize: 12 }}>🎟️</span>
                            <span style={{ fontSize: 12, fontWeight: 800, color: isCompleted ? '#727785' : d.dark }}>{chore.tickets}</span>
                        </div>
                        <div style={{ width: 26, height: 26, borderRadius: 9999, flexShrink: 0, background: isCompleted ? '#2dba4e' : 'transparent', border: `2px solid ${isCompleted ? '#2dba4e' : '#c2c6d6'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s, border-color 0.2s' }}>
                            {isCompleted && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                    </div>
                </div>
                {chore.notes && <p style={{ margin: '5px 0 8px', fontSize: 12, fontWeight: 500, color: isCompleted ? '#c2c6d6' : '#727785', fontStyle: 'italic', lineHeight: 1.4 }}>{chore.notes}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isCompleted ? '#c2c6d6' : d.dark, background: isCompleted ? '#f0f4fc' : d.bg, borderRadius: 9999, padding: '2px 8px', border: `1px solid ${isCompleted ? '#c2c6d6' : d.border}` }}>
                        {d.emoji} {chore.category}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#c2c6d6', textTransform: 'capitalize' }}>{chore.recurring}</span>
                </div>
            </div>
        </div>
    );
}

function ChoresList({ completedChores, groupedChores, onToggleChore, onReset }) {
    const total = Object.values(groupedChores).flat().length;
    return (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 110px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#171c22', letterSpacing: '-0.02em' }}>Today's Quests</h2>
                    <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600, color: '#727785' }}>{completedChores.length} of {total} completed</p>
                </div>
                <button className="btn-3d-red" onClick={onReset} style={{ padding: '8px 14px', fontSize: 13 }}>Reset Week</button>
            </div>

            {Object.entries(groupedChores).map(([difficulty, choresList]) => {
                const d = DIFF[difficulty];
                const completedInCategory = choresList.filter(c => completedChores.includes(c.name)).length;
                return (
                    <div key={difficulty} style={{ marginBottom: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottom: `2px solid ${d.bg}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 9999, background: d.accent, boxShadow: `0 0 0 3px ${d.bg}` }} />
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#171c22' }}>{difficulty} Chores</h3>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: d.dark, background: d.bg, borderRadius: 9999, padding: '3px 10px', border: `1px solid ${d.border}` }}>
                                {completedInCategory}/{choresList.length}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {choresList.map(chore => (
                                <ChoreCard key={chore.id || chore.name} chore={chore} isCompleted={completedChores.includes(chore.name)} onToggle={onToggleChore} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── REWARDS STORE ──────────────────────────────────────────────────────────

function RewardCard({ item, availableTickets, onPurchase }) {
    const canAfford = item.cost <= availableTickets;
    return (
        <div
            onClick={() => { if (!canAfford) return; if (window.confirm(`Redeem "${item.name}" for ${item.cost} tickets?`)) onPurchase(item.cost); }}
            style={{
                background: 'white', borderRadius: 16,
                border: `2px solid ${canAfford ? '#a8e6b8' : '#c2c6d6'}`,
                boxShadow: canAfford ? '0 4px 0 #004d1944' : '0 2px 0 rgba(0,0,0,0.04)',
                cursor: canAfford ? 'pointer' : 'not-allowed',
                opacity: canAfford ? 1 : 0.55,
                padding: '20px 16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8, textAlign: 'center',
                transition: 'box-shadow 0.15s, transform 0.15s, opacity 0.2s',
                userSelect: 'none',
            }}
            onMouseDown={e => canAfford && (e.currentTarget.style.transform = 'translateY(3px)')}
            onMouseUp={e => (e.currentTarget.style.transform = '')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')}
            onTouchStart={e => canAfford && (e.currentTarget.style.transform = 'translateY(3px)')}
            onTouchEnd={e => (e.currentTarget.style.transform = '')}
        >
            <span style={{ fontSize: 40, lineHeight: 1 }}>{item.emoji}</span>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#171c22', lineHeight: 1.3 }}>{item.name}</p>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#727785', background: '#f0f4fc', borderRadius: 9999, padding: '2px 8px' }}>{item.category}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: canAfford ? '#d1f2d8' : '#f0f4fc', borderRadius: 9999, padding: '6px 12px', border: `1px solid ${canAfford ? '#a8e6b8' : '#c2c6d6'}` }}>
                <span style={{ fontSize: 16 }}>🎟️</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: canAfford ? '#005320' : '#727785' }}>{item.cost}</span>
            </div>
            {!canAfford && <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#ba1a1a' }}>Need {item.cost - availableTickets} more</p>}
            {canAfford && <span style={{ fontSize: 12, fontWeight: 700, color: '#005320' }}>Tap to redeem ✓</span>}
        </div>
    );
}

function RewardsStore({ availableTickets, onPurchase }) {
    return (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 110px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: '#171c22', letterSpacing: '-0.02em' }}>Reward Store 🛒</h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 600, color: '#727785' }}>Spend your tickets on awesome rewards</p>
            <div style={{ background: 'linear-gradient(135deg, #0051ae, #0969da)', borderRadius: 20, padding: '20px 24px', marginBottom: 24, boxShadow: '0 6px 0 #003f88, 0 2px 12px rgba(0,81,174,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>Your Balance</p>
                    <p style={{ margin: '2px 0 0', fontSize: 40, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>{availableTickets}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>tickets available</p>
                </div>
                <span style={{ fontSize: 56 }}>🎟️</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {storeItems.map(item => <RewardCard key={item.id} item={item} availableTickets={availableTickets} onPurchase={onPurchase} />)}
            </div>
        </div>
    );
}

// ─── PROGRESS & ACHIEVEMENTS ────────────────────────────────────────────────

function getAchievementProgress(achievement, stats) {
    let current = 0;
    switch (achievement.type) {
        case 'chores_completed': current = stats.totalChoresCompleted; break;
        case 'tickets_earned':   current = stats.totalTicketsEarned;   break;
        case 'tickets_spent':    current = stats.totalTicketsSpent;    break;
        case 'daily_streak':     current = stats.currentStreak;        break;
        case 'hard_chores':      current = stats.hardChoresCompleted;  break;
        default: break;
    }
    const clamped = Math.min(current, achievement.requirement);
    return { current: clamped, pct: Math.min(Math.round((current / achievement.requirement) * 100), 100) };
}

function AchievementCard({ achievement, isUnlocked, index, stats }) {
    const gradient = BADGE_GRADIENTS[index % BADGE_GRADIENTS.length];
    const progress = !isUnlocked && stats ? getAchievementProgress(achievement, stats) : null;
    return (
        <div style={{ background: 'white', borderRadius: 16, border: `1px solid ${isUnlocked ? '#a8e6b8' : '#c2c6d6'}`, boxShadow: `0 3px 0 ${isUnlocked ? '#2dba4e22' : 'rgba(0,0,0,0.04)'}`, padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 9999, background: isUnlocked ? gradient : '#eaeef6', border: `3px solid ${isUnlocked ? 'rgba(255,255,255,0.6)' : '#c2c6d6'}`, boxShadow: isUnlocked ? '0 3px 0 rgba(0,0,0,0.12)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, filter: isUnlocked ? 'none' : 'grayscale(0.5)', opacity: isUnlocked ? 1 : 0.65, flexShrink: 0 }}>
                {achievement.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: isUnlocked ? '#171c22' : '#424753' }}>{achievement.name}</span>
                    {isUnlocked
                        ? <span style={{ fontSize: 11, fontWeight: 700, color: '#2dba4e', background: '#d1f2d8', borderRadius: 9999, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>✓ Earned</span>
                        : <span style={{ fontSize: 11, fontWeight: 700, color: '#727785', background: '#eaeef6', borderRadius: 9999, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>{progress?.pct ?? 0}%</span>
                    }
                </div>
                <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 500, color: '#727785', lineHeight: 1.4 }}>{achievement.description}</p>
                {!isUnlocked && progress && (
                    <div>
                        <div style={{ background: '#eaeef6', borderRadius: 9999, height: 6, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 9999, background: gradient, width: `${progress.pct}%`, minWidth: progress.pct > 0 ? 6 : 0, transition: 'width 0.5s ease' }} />
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: 11, fontWeight: 700, color: '#727785' }}>{progress.current} / {achievement.requirement}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function AchievementsWall({ stats, unlockedAchievements }) {
    const unlockedCount = unlockedAchievements.length;
    const totalCount = achievements.length;
    const badgePct = Math.round((unlockedCount / totalCount) * 100);
    const unlocked = achievements.filter(a => unlockedAchievements.includes(a.id));
    const locked = achievements.filter(a => !unlockedAchievements.includes(a.id));

    return (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 110px' }}>
            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg, #0051ae, #0969da)', borderRadius: 20, padding: '28px 24px 24px', marginBottom: 20, boxShadow: '0 6px 0 #003f88', color: 'white' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🏅</div>
                <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 2 }}>
                    {unlockedCount} <span style={{ fontSize: 18, fontWeight: 600, opacity: 0.75 }}>of {totalCount} badges</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 9999, height: 12, margin: '12px 0 10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 9999, background: 'white', width: `${badgePct}%`, minWidth: badgePct > 0 ? 12 : 0, transition: 'width 0.6s ease' }} />
                </div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, opacity: 0.8 }}>
                    {unlockedCount === totalCount ? '🎉 All badges unlocked!' : `${totalCount - unlockedCount} more badge${totalCount - unlockedCount !== 1 ? 's' : ''} to earn`}
                </p>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
                {[
                    { label: 'Chores', value: stats.totalChoresCompleted, icon: '✅', color: '#2dba4e' },
                    { label: 'Streak',  value: `${stats.currentStreak}d`,   icon: '🔥', color: '#f6851b' },
                    { label: 'Tickets', value: stats.totalTicketsEarned,    icon: '🎟️', color: '#0969da' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: '14px 10px', textAlign: 'center', border: '1px solid #c2c6d6', boxShadow: '0 3px 0 rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: 20, marginBottom: 2 }}>{s.icon}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#727785' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Unlocked */}
            {unlocked.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#005320', textTransform: 'uppercase', letterSpacing: '0.06em' }}>✓ Earned</span>
                        <span style={{ fontSize: 12, fontWeight: 700, background: '#d1f2d8', color: '#005320', borderRadius: 9999, padding: '2px 8px' }}>{unlocked.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {unlocked.map(a => <AchievementCard key={a.id} achievement={a} isUnlocked={true} index={achievements.findIndex(x => x.id === a.id)} />)}
                    </div>
                </div>
            )}

            {/* Locked */}
            {locked.length > 0 && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#727785', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔒 Locked</span>
                        <span style={{ fontSize: 12, fontWeight: 700, background: '#eaeef6', color: '#424753', borderRadius: 9999, padding: '2px 8px' }}>{locked.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {locked.map(a => <AchievementCard key={a.id} achievement={a} isUnlocked={false} index={achievements.findIndex(x => x.id === a.id)} stats={stats} />)}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── PARENT SETTINGS ────────────────────────────────────────────────────────

const DEFAULT_PIN = '1234';

function PinEntry({ onSuccess }) {
    const [digits, setDigits] = useState([]);
    const [error, setError] = useState(false);
    const savedPin = StorageManager.get('parentPin', DEFAULT_PIN);

    const handleKey = (key) => {
        if (key === '⌫') { setDigits(d => d.slice(0, -1)); setError(false); return; }
        const next = [...digits, key];
        setDigits(next);
        if (next.length === 4) {
            if (next.join('') === savedPin) {
                onSuccess();
            } else {
                setError(true);
                setTimeout(() => { setDigits([]); setError(false); }, 600);
            }
        }
    };

    const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

    return (
        <div style={{ maxWidth: 360, margin: '0 auto', padding: '48px 24px 110px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 48, marginBottom: 12 }}>🔐</span>
            <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, color: '#171c22', letterSpacing: '-0.02em' }}>Parent Access</h2>
            <p style={{ margin: '0 0 32px', fontSize: 14, fontWeight: 600, color: '#727785' }}>Enter your PIN to continue</p>

            {/* PIN dots */}
            <div style={{ display: 'flex', gap: 16, marginBottom: error ? 8 : 32 }}>
                {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                        width: 18, height: 18, borderRadius: 9999,
                        background: digits[i] !== undefined ? (error ? '#ba1a1a' : '#0969da') : 'transparent',
                        border: `2.5px solid ${error ? '#ba1a1a' : digits[i] !== undefined ? '#0969da' : '#c2c6d6'}`,
                        transition: 'background 0.15s, border-color 0.15s',
                    }} />
                ))}
            </div>
            {error && <p style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 700, color: '#ba1a1a' }}>Incorrect PIN — try again</p>}

            {/* Numpad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: 256 }}>
                {keys.map((key, i) => {
                    if (key === '') return <div key={i} />;
                    const isBackspace = key === '⌫';
                    return (
                        <button
                            key={i}
                            onClick={() => handleKey(key)}
                            style={{
                                height: 64, borderRadius: 16, border: 'none',
                                background: isBackspace ? '#f0f4fc' : 'white',
                                color: isBackspace ? '#727785' : '#171c22',
                                fontSize: isBackspace ? 22 : 22, fontWeight: 700,
                                fontFamily: 'inherit', cursor: 'pointer',
                                boxShadow: '0 3px 0 rgba(0,0,0,0.08)',
                                transition: 'box-shadow 0.1s, transform 0.1s',
                                border: '1px solid #c2c6d6',
                            }}
                            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.06)'; }}
                            onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 3px 0 rgba(0,0,0,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 3px 0 rgba(0,0,0,0.08)'; }}
                            onTouchStart={e => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.06)'; }}
                            onTouchEnd={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 3px 0 rgba(0,0,0,0.08)'; }}
                        >
                            {key}
                        </button>
                    );
                })}
            </div>
            <p style={{ margin: '24px 0 0', fontSize: 12, fontWeight: 600, color: '#c2c6d6' }}>Default PIN: 1234</p>
        </div>
    );
}

const BLANK_FORM = { name: '', category: 'Easy', tickets: 1, notes: '', recurring: 'daily' };

function ChoreForm({ initialData, onSave, onCancel }) {
    const [form, setForm] = useState(initialData ? { ...initialData } : { ...BLANK_FORM });
    const isEdit = !!initialData;
    const d = DIFF[form.category];

    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
    const valid = form.name.trim().length > 0;

    const inputStyle = {
        width: '100%', boxSizing: 'border-box',
        padding: '12px 14px', fontSize: 15, fontWeight: 600,
        fontFamily: 'inherit', color: '#171c22',
        background: 'white', border: '2px solid #c2c6d6',
        borderRadius: 12, outline: 'none',
        transition: 'border-color 0.15s',
    };

    return (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 110px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#171c22', letterSpacing: '-0.02em' }}>
                        {isEdit ? 'Edit Chore' : 'Add New Chore'}
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: '#727785' }}>
                        {isEdit ? 'Update the chore details below' : 'Fill in the details for the new chore'}
                    </p>
                </div>
                <button
                    onClick={onCancel}
                    style={{ background: '#f0f4fc', border: 'none', borderRadius: 9999, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, color: '#727785' }}
                >
                    ✕
                </button>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#424753', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Chore Name
                </label>
                <input
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Clean the bathroom"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#0969da')}
                    onBlur={e => (e.target.style.borderColor = '#c2c6d6')}
                />
            </div>

            {/* Difficulty */}
            <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#424753', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Difficulty
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {['Easy', 'Medium', 'Hard'].map(cat => {
                        const cd = DIFF[cat];
                        const active = form.category === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => set('category', cat)}
                                style={{
                                    padding: '12px 8px', borderRadius: 12, fontFamily: 'inherit',
                                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                    background: active ? cd.bg : 'white',
                                    color: active ? cd.dark : '#727785',
                                    border: `2px solid ${active ? cd.accent : '#c2c6d6'}`,
                                    boxShadow: active ? `0 3px 0 ${cd.accent}44` : '0 2px 0 rgba(0,0,0,0.06)',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {cd.emoji} {cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tickets */}
            <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#424753', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Ticket Reward
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button
                        onClick={() => form.tickets > 1 && set('tickets', form.tickets - 1)}
                        style={{ width: 44, height: 44, borderRadius: 12, border: '2px solid #c2c6d6', background: 'white', fontSize: 22, fontWeight: 700, cursor: 'pointer', color: '#424753', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 0 rgba(0,0,0,0.06)' }}
                    >−</button>
                    <div style={{ flex: 1, textAlign: 'center', background: d.bg, borderRadius: 12, padding: '12px 0', border: `2px solid ${d.border}` }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: d.dark }}>{form.tickets}</span>
                        <span style={{ fontSize: 18, marginLeft: 4 }}>🎟️</span>
                    </div>
                    <button
                        onClick={() => form.tickets < 10 && set('tickets', form.tickets + 1)}
                        style={{ width: 44, height: 44, borderRadius: 12, border: '2px solid #c2c6d6', background: 'white', fontSize: 22, fontWeight: 700, cursor: 'pointer', color: '#424753', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 0 rgba(0,0,0,0.06)' }}
                    >+</button>
                </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#424753', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Notes <span style={{ fontWeight: 600, color: '#c2c6d6', textTransform: 'none' }}>(optional)</span>
                </label>
                <input
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    placeholder="Helpful hint for the kid..."
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#0969da')}
                    onBlur={e => (e.target.style.borderColor = '#c2c6d6')}
                />
            </div>

            {/* Recurring */}
            <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#424753', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    How Often
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {['daily', 'weekly', 'monthly'].map(r => {
                        const active = form.recurring === r;
                        return (
                            <button
                                key={r}
                                onClick={() => set('recurring', r)}
                                style={{
                                    padding: '12px 8px', borderRadius: 12, fontFamily: 'inherit',
                                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                    textTransform: 'capitalize',
                                    background: active ? '#d8e2ff' : 'white',
                                    color: active ? '#0051ae' : '#727785',
                                    border: `2px solid ${active ? '#0969da' : '#c2c6d6'}`,
                                    boxShadow: active ? '0 3px 0 #0051ae44' : '0 2px 0 rgba(0,0,0,0.06)',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {r}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <button
                    onClick={onCancel}
                    className="btn-3d-white"
                    style={{ padding: '14px 0', fontSize: 14 }}
                >
                    Cancel
                </button>
                <button
                    onClick={() => valid && onSave({ ...form, name: form.name.trim() })}
                    className="btn-3d-primary"
                    style={{ padding: '14px 0', fontSize: 14, opacity: valid ? 1 : 0.5, cursor: valid ? 'pointer' : 'not-allowed' }}
                >
                    {isEdit ? '✓ Save Changes' : '+ Add Chore'}
                </button>
            </div>
        </div>
    );
}

function ChoreRow({ chore, onEdit, onDelete }) {
    const d = DIFF[chore.category];
    return (
        <div style={{
            background: 'white', borderRadius: 14,
            border: `1px solid ${d.border}`,
            boxShadow: `0 3px 0 ${d.accent}22`,
            display: 'flex', overflow: 'hidden', alignItems: 'stretch',
        }}>
            <div style={{ width: 5, flexShrink: 0, background: d.accent }} />
            <div style={{ flex: 1, padding: '12px 14px' }}>
                <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#171c22' }}>{chore.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: d.dark, background: d.bg, borderRadius: 9999, padding: '2px 8px', border: `1px solid ${d.border}` }}>
                        {d.emoji} {chore.category}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#727785' }}>🎟️ {chore.tickets}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#c2c6d6', textTransform: 'capitalize' }}>{chore.recurring}</span>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 10px', flexShrink: 0 }}>
                <button
                    onClick={() => onEdit(chore)}
                    style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #c2c6d6', background: '#f0f4fc', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Edit"
                >✏️</button>
                <button
                    onClick={() => { if (window.confirm(`Delete "${chore.name}"?`)) onDelete(chore); }}
                    style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #fca5a5', background: '#fff0f0', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Delete"
                >🗑️</button>
            </div>
        </div>
    );
}

function ParentSettings({ choreList, stats, onAddChore, onEditChore, onDeleteChore, onResetChores, devMode, onToggleDevMode, onResetAll }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [formMode, setFormMode] = useState(null); // null | 'add' | { chore }

    if (!authenticated) {
        return <PinEntry onSuccess={() => setAuthenticated(true)} />;
    }

    if (formMode) {
        const editingChore = formMode === 'add' ? null : formMode;
        return (
            <ChoreForm
                initialData={editingChore}
                onSave={(data) => {
                    if (editingChore) { onEditChore(editingChore.name, data); }
                    else { onAddChore(data); }
                    setFormMode(null);
                }}
                onCancel={() => setFormMode(null)}
            />
        );
    }

    const grouped = {
        Easy: choreList.filter(c => c.category === 'Easy'),
        Medium: choreList.filter(c => c.category === 'Medium'),
        Hard: choreList.filter(c => c.category === 'Hard'),
    };

    return (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 110px' }}>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#171c22', letterSpacing: '-0.02em' }}>Parent Settings 🔐</h2>
                <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600, color: '#727785' }}>Manage chores and household settings</p>
            </div>

            {/* Household Stats */}
            <div style={{ marginBottom: 28 }}>
                <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#424753', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Household Progress</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <div style={{ background: 'white', border: '1px solid #c2c6d6', borderRadius: 14, padding: '14px 10px', textAlign: 'center', boxShadow: '0 3px 0 rgba(0,0,0,0.05)' }}>
                        <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0969da' }}>{stats.totalTicketsEarned}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 10, fontWeight: 700, color: '#727785', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tickets Earned</p>
                    </div>
                    <div style={{ background: 'white', border: '1px solid #c2c6d6', borderRadius: 14, padding: '14px 10px', textAlign: 'center', boxShadow: '0 3px 0 rgba(0,0,0,0.05)' }}>
                        <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f6851b' }}>{stats.currentStreak}d</p>
                        <p style={{ margin: '2px 0 0', fontSize: 10, fontWeight: 700, color: '#727785', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Streak</p>
                    </div>
                    <div style={{ background: 'white', border: '1px solid #c2c6d6', borderRadius: 14, padding: '14px 10px', textAlign: 'center', boxShadow: '0 3px 0 rgba(0,0,0,0.05)' }}>
                        <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#2dba4e' }}>{stats.totalChoresCompleted}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 10, fontWeight: 700, color: '#727785', textTransform: 'uppercase', letterSpacing: '0.04em' }}>All-Time Done</p>
                    </div>
                </div>
            </div>

            {/* Manage Chores */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#424753', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Manage Chores <span style={{ color: '#c2c6d6', fontWeight: 600 }}>({choreList.length})</span>
                    </p>
                    <button
                        className="btn-3d-primary"
                        onClick={() => setFormMode('add')}
                        style={{ padding: '8px 14px', fontSize: 13, gap: 4 }}
                    >
                        + Add New
                    </button>
                </div>

                {Object.entries(grouped).map(([diff, list]) => {
                    if (list.length === 0) return null;
                    const d = DIFF[diff];
                    return (
                        <div key={diff} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: 9999, background: d.accent }} />
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#727785' }}>{diff} · {list.length} chores</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {list.map(chore => (
                                    <ChoreRow
                                        key={chore.id || chore.name}
                                        chore={chore}
                                        onEdit={c => setFormMode(c)}
                                        onDelete={onDeleteChore}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Security & Admin */}
            <div style={{ marginBottom: 20 }}>
                <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#424753', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security & Admin</p>
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #c2c6d6', boxShadow: '0 3px 0 rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    {/* Dev mode toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid #eaeef6' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#171c22' }}>Developer Mode</p>
                            <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 600, color: '#727785' }}>Tap the title 5× in 2s to toggle</p>
                        </div>
                        <div style={{
                            width: 48, height: 28, borderRadius: 9999, cursor: 'pointer',
                            background: devMode ? '#0969da' : '#eaeef6',
                            position: 'relative', transition: 'background 0.2s',
                            border: `2px solid ${devMode ? '#0051ae' : '#c2c6d6'}`,
                        }} onClick={onToggleDevMode}>
                            <div style={{
                                width: 20, height: 20, borderRadius: 9999, background: 'white',
                                position: 'absolute', top: 2, left: devMode ? 22 : 2,
                                transition: 'left 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }} />
                        </div>
                    </div>

                    {/* Reset chores to default */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid #eaeef6' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#171c22' }}>Reset Chore List</p>
                            <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 600, color: '#727785' }}>Restore all 18 default chores</p>
                        </div>
                        <button
                            onClick={() => { if (window.confirm('Restore default chore list? Custom chores will be removed.')) onResetChores(); }}
                            style={{ padding: '7px 12px', fontSize: 12, fontWeight: 700, background: '#f0f4fc', border: '1px solid #c2c6d6', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', color: '#424753' }}
                        >
                            Restore
                        </button>
                    </div>

                    {/* Reset all progress */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#ba1a1a' }}>Reset All Progress</p>
                            <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 600, color: '#727785' }}>Clears tickets, streaks & achievements</p>
                        </div>
                        <button
                            className="btn-3d-red"
                            onClick={() => { if (window.confirm('Reset ALL progress? This cannot be undone.')) onResetAll(); }}
                            style={{ padding: '7px 12px', fontSize: 12 }}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Legal links */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, margin: '0 0 12px' }}>
                <a
                    href="./privacy.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13, fontWeight: 600, color: '#727785', textDecoration: 'none' }}
                >
                    🔏 Privacy Policy
                </a>
                <a
                    href="./terms.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13, fontWeight: 600, color: '#727785', textDecoration: 'none' }}
                >
                    📄 Terms of Service
                </a>
            </div>

            {/* Sign out / lock */}
            <button
                onClick={() => setAuthenticated(false)}
                style={{ width: '100%', padding: '14px', background: 'none', border: '2px solid #c2c6d6', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: '#727785', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
                🔒 Lock Parent Settings
            </button>
        </div>
    );
}

// ─── DEV MODE BANNER ────────────────────────────────────────────────────────

function DevModeBanner({ onOpenDevScreen, onClose }) {
    return (
        <div style={{ background: '#fff0f0', borderBottom: '2px solid #fca5a5', padding: '8px 20px' }}>
            <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ba1a1a' }}>⚠️ Dev Mode Active</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={onOpenDevScreen} style={{ background: 'none', border: '1.5px solid #ba1a1a', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#ba1a1a', fontFamily: 'inherit', padding: '4px 10px' }}>
                        Dev Tools →
                    </button>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#ba1a1a', fontFamily: 'inherit', padding: '4px 6px' }}>✕</button>
                </div>
            </div>
        </div>
    );
}

function DevModeScreen({ stats, availableTickets, unlockedAchievements, onAddTickets, onSimulateStreak, onUnlockAll, onResetWeek, onResetAll, onExit }) {
    const [ticketAmt, setTicketAmt] = useState(10);
    const [streakDays, setStreakDays] = useState(7);

    return (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px 110px' }}>
            {/* Warning hero */}
            <div style={{ background: 'linear-gradient(135deg, #ba1a1a, #dc2626)', borderRadius: '0 0 20px 20px', padding: '24px 24px 28px', marginBottom: 20, color: 'white', boxShadow: '0 6px 0 #7a0000', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>Developer Mode</div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, opacity: 0.85 }}>Testing & debugging tools. All changes are real and saved to this device.</p>
            </div>

            {/* Live state inspector */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #c2c6d6', padding: '20px', marginBottom: 14, boxShadow: '0 3px 0 rgba(0,0,0,0.05)' }}>
                <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 800, color: '#424753', textTransform: 'uppercase', letterSpacing: '0.08em' }}>📊 Live State</p>
                {[
                    { label: 'Available Tickets',  value: availableTickets,                              color: '#0969da' },
                    { label: 'Total Earned',        value: stats.totalTicketsEarned,                      color: '#2dba4e' },
                    { label: 'Total Spent',         value: stats.totalTicketsSpent,                       color: '#d4a017' },
                    { label: 'Current Streak',      value: `${stats.currentStreak} days`,                 color: '#f6851b' },
                    { label: 'Chores Completed',    value: stats.totalChoresCompleted,                    color: '#2dba4e' },
                    { label: 'Hard Chores',         value: stats.hardChoresCompleted,                     color: '#dc2626' },
                    { label: 'Achievements',        value: `${unlockedAchievements.length} / ${achievements.length}`, color: '#9333ea' },
                ].map((row, i, arr) => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #f0f4fc' : 'none' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#424753' }}>{row.label}</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: row.color }}>{row.value}</span>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #c2c6d6', padding: '20px', marginBottom: 14, boxShadow: '0 3px 0 rgba(0,0,0,0.05)' }}>
                <p style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 800, color: '#424753', textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚡ Quick Actions</p>

                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#727785' }}>ADD TICKETS</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <input type="number" value={ticketAmt} onChange={e => setTicketAmt(Number(e.target.value))} min={1} max={999}
                        style={{ flex: 1, padding: '10px 12px', border: '2px solid #c2c6d6', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: 'inherit', color: '#171c22', outline: 'none' }} />
                    <button className="btn-3d-primary" onClick={() => onAddTickets(ticketAmt)} style={{ padding: '10px 20px', fontSize: 14 }}>+ Add</button>
                </div>

                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#727785' }}>SIMULATE STREAK (DAYS)</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <input type="number" value={streakDays} onChange={e => setStreakDays(Number(e.target.value))} min={1} max={365}
                        style={{ flex: 1, padding: '10px 12px', border: '2px solid #c2c6d6', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: 'inherit', color: '#171c22', outline: 'none' }} />
                    <button className="btn-3d-green" onClick={() => onSimulateStreak(streakDays)} style={{ padding: '10px 20px', fontSize: 14 }}>Set</button>
                </div>

                <button className="btn-3d-primary" onClick={onUnlockAll} style={{ width: '100%', padding: '13px', fontSize: 14 }}>
                    🏅 Unlock All Achievements
                </button>
            </div>

            {/* Danger zone */}
            <div style={{ background: '#fff5f5', borderRadius: 16, border: '2px solid #fca5a5', padding: '20px', marginBottom: 14 }}>
                <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 800, color: '#ba1a1a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚠️ Danger Zone</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button className="btn-3d-white" onClick={() => { if (window.confirm("Reset this week's chores?")) onResetWeek(); }} style={{ width: '100%', padding: '12px', fontSize: 14 }}>
                        🔄 Reset This Week's Chores
                    </button>
                    <button className="btn-3d-red" onClick={() => { if (window.confirm("Delete ALL progress? This cannot be undone.")) onResetAll(); }} style={{ width: '100%', padding: '12px', fontSize: 14 }}>
                        💥 Nuke All Progress
                    </button>
                </div>
            </div>

            <button className="btn-3d-white" onClick={onExit} style={{ width: '100%', padding: '14px', fontSize: 15 }}>
                ✕ Exit Developer Mode
            </button>
        </div>
    );
}

// ─── ROOT APP ───────────────────────────────────────────────────────────────

export default function App() {
    const appState = useAppState();
    const [devMode, setDevMode] = useState(false);

    useAchievementChecker(appState.stats, appState.unlockedAchievements, appState.unlockAchievement);

    const handleReset = () => {
        if (window.confirm("Reset all chores for the week?")) appState.resetWeek();
    };

    const renderPage = () => {
        switch (appState.currentPage) {
            case 'dashboard':
                return (
                    <Dashboard
                        stats={appState.stats}
                        completedChores={appState.completedChores}
                        groupedChores={appState.groupedChores}
                        availableTickets={appState.availableTickets}
                        onPageChange={appState.setCurrentPage}
                    />
                );
            case 'chores':
                return (
                    <ChoresList
                        completedChores={appState.completedChores}
                        groupedChores={appState.groupedChores}
                        onToggleChore={appState.toggleChore}
                        onReset={handleReset}
                    />
                );
            case 'rewards':
                return (
                    <RewardsStore
                        availableTickets={appState.availableTickets}
                        onPurchase={appState.purchaseItem}
                    />
                );
            case 'progress':
                return (
                    <AchievementsWall
                        stats={appState.stats}
                        unlockedAchievements={appState.unlockedAchievements}
                    />
                );
            case 'devmode':
                return (
                    <DevModeScreen
                        stats={appState.stats}
                        availableTickets={appState.availableTickets}
                        unlockedAchievements={appState.unlockedAchievements}
                        onAddTickets={appState.addDevTickets}
                        onSimulateStreak={appState.simulateStreak}
                        onUnlockAll={appState.unlockAllAchievements}
                        onResetWeek={appState.resetWeek}
                        onResetAll={() => { appState.resetAll(); setDevMode(false); appState.setCurrentPage('dashboard'); }}
                        onExit={() => { setDevMode(false); appState.setCurrentPage('dashboard'); }}
                    />
                );
            case 'parent':
                return (
                    <ParentSettings
                        choreList={appState.choreList}
                        stats={appState.stats}
                        onAddChore={appState.addChore}
                        onEditChore={appState.editChore}
                        onDeleteChore={appState.deleteChore}
                        onResetChores={appState.resetChoresToDefault}
                        devMode={devMode}
                        onToggleDevMode={() => setDevMode(d => !d)}
                        onResetAll={appState.resetAll}
                    />
                );
            default:
                return (
                    <Dashboard
                        stats={appState.stats}
                        completedChores={appState.completedChores}
                        groupedChores={appState.groupedChores}
                        availableTickets={appState.availableTickets}
                        onPageChange={appState.setCurrentPage}
                    />
                );
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f7f9ff' }}>
            <Navigation
                currentPage={appState.currentPage}
                onPageChange={appState.setCurrentPage}
                availableTickets={appState.availableTickets}
                devMode={devMode}
                onDevModeToggle={() => setDevMode(d => !d)}
            />
            {devMode && (
                <DevModeBanner
                    onOpenDevScreen={() => appState.setCurrentPage('devmode')}
                    onClose={() => { setDevMode(false); if (appState.currentPage === 'devmode') appState.setCurrentPage('dashboard'); }}
                />
            )}
            {renderPage()}
        </div>
    );
}
