import React, { useState, useEffect, useCallback, useMemo } from "react";

const chores = [
    { name: "Make the bed", category: "Easy", notes: "Basic straightening, not perfect", tickets: 1, recurring: "daily" },
    { name: "Put dirty clothes in hamper", category: "Easy", notes: "After changing", tickets: 1, recurring: "daily" },
    { name: "Feed pets", category: "Easy", notes: "Scoop food, refill water", tickets: 1, recurring: "daily" },
    { name: "Pick up your Toys", category: "Easy", notes: "Anything on the floor", tickets: 1, recurring: "daily" },
    { name: "Pick up after Penelope", category: "Easy", notes: "Indoor or outdoor", tickets: 1, recurring: "daily" },
    { name: "Wipe down table after meals", category: "Easy", notes: "With a damp cloth", tickets: 1, recurring: "daily" },
    { name: "Dust low surfaces", category: "Easy", notes: "Like coffee tables, baseboards", tickets: 1, recurring: "weekly" },
    { name: "Empty small trash bins", category: "Easy", notes: "Bathroom or bedroom", tickets: 1, recurring: "weekly" },
    { name: "Fold laundry", category: "Medium", notes: "Towels, socks, shirts", tickets: 2, recurring: "weekly" },
    { name: "Match socks", category: "Medium", notes: "Sorting activity too", tickets: 2, recurring: "weekly" },
    { name: "Put away clean clothes", category: "Medium", notes: "In correct drawers", tickets: 2, recurring: "weekly" },
    { name: "Wash Dishes", category: "Medium", notes: "With guidance", tickets: 2, recurring: "daily" },
    { name: "Help pack lunch/snack", category: "Medium", notes: "With guidance", tickets: 2, recurring: "daily" },
    { name: "Wipe down counters", category: "Medium", notes: "Especially after messes", tickets: 2, recurring: "daily" },
    { name: "Keep closet clean", category: "Medium", notes: "Organized", tickets: 2, recurring: "weekly" },
    { name: "Take trash to outdoor bin", category: "Hard", notes: "Only if physically safe", tickets: 4, recurring: "weekly" },
    { name: "Assist in washing car", category: "Hard", notes: "Hose, sponge, towel off", tickets: 4, recurring: "monthly" },
    { name: "Cook simple meals", category: "Hard", notes: "Sandwiches, scrambled eggs", tickets: 4, recurring: "weekly" }
];

const storeItems = [
    { id: 1, name: "30 minutes extra screen time", cost: 6, emoji: "📱", category: "Fun Time" },
    { id: 2, name: "Choose tonight's movie", cost: 5, emoji: "🎬", category: "Entertainment" },
    { id: 3, name: "Stay up 30 minutes later", cost: 8, emoji: "🌙", category: "Special Privilege" },
    { id: 4, name: "Small toy or book", cost: 12, emoji: "🎁", category: "Physical Reward" },
    { id: 5, name: "Trip to the park with snack", cost: 10, emoji: "🏞️", category: "Outing" },
    { id: 6, name: "Ice cream treat", cost: 7, emoji: "🍦", category: "Treat" },
    { id: 7, name: "Friend sleepover", cost: 20, emoji: "🏠", category: "Big Reward" },
    { id: 8, name: "Choose what's for dinner", cost: 4, emoji: "🍽️", category: "Choice" },
    { id: 9, name: "$5 cash", cost: 20, emoji: "💵", category: "Money" },
    { id: 10, name: "Art supplies", cost: 15, emoji: "🎨", category: "Creative" }
];

const achievements = [
    { id: 1, name: "First Steps", description: "Complete your first chore", icon: "👶", requirement: 1, type: "chores_completed" },
    { id: 2, name: "Getting Started", description: "Complete 5 chores", icon: "🌱", requirement: 5, type: "chores_completed" },
    { id: 3, name: "Chore Champion", description: "Complete 25 chores", icon: "🏆", requirement: 25, type: "chores_completed" },
    { id: 4, name: "Ticket Collector", description: "Earn 20 tickets", icon: "🎟️", requirement: 20, type: "tickets_earned" },
    { id: 5, name: "Big Spender", description: "Spend 15 tickets in the store", icon: "💸", requirement: 15, type: "tickets_spent" },
    { id: 6, name: "Three Day Streak", description: "Complete chores 3 days in a row", icon: "🔥", requirement: 3, type: "daily_streak" },
    { id: 7, name: "Week Warrior", description: "Complete all daily chores for a week", icon: "⭐", requirement: 7, type: "perfect_week" },
    { id: 8, name: "Hard Worker", description: "Complete 5 hard chores", icon: "💪", requirement: 5, type: "hard_chores" }
];

const categoryColors = {
    Easy: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-800",
        badge: "bg-emerald-100 text-emerald-700"
    },
    Medium: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-800",
        badge: "bg-amber-100 text-amber-700"
    },
    Hard: {
        bg: "bg-rose-50",
        border: "border-rose-200",
        text: "text-rose-800",
        badge: "bg-rose-100 text-rose-700"
    }
};

// Centralized localStorage management
class StorageManager {
    static get(key, defaultValue) {
        if (typeof window === "undefined" || !window.localStorage) {
            return defaultValue;
        }
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error reading from localStorage: ${error}`);
            return defaultValue;
        }
    }

    static set(key, value) {
        if (typeof window === "undefined" || !window.localStorage) {
            return;
        }
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`Error writing to localStorage: ${error}`);
        }
    }
}

// Custom hook for managing app state
function useAppState() {
    const [currentPage, setCurrentPage] = useState('chores');
    const [completedChores, setCompletedChores] = useState(() =>
        StorageManager.get("completedChores", [])
    );
    const [ticketsRedeemed, setTicketsRedeemed] = useState(() =>
        StorageManager.get("redeemedTickets", 0)
    );
    const [completionHistory, setCompletionHistory] = useState(() =>
        StorageManager.get("completionHistory", {})
    );
    const [unlockedAchievements, setUnlockedAchievements] = useState(() =>
        StorageManager.get("unlockedAchievements", [])
    );

    useEffect(() => {
        StorageManager.set("completedChores", completedChores);
    }, [completedChores]);

    useEffect(() => {
        StorageManager.set("redeemedTickets", ticketsRedeemed);
    }, [ticketsRedeemed]);

    useEffect(() => {
        StorageManager.set("completionHistory", completionHistory);
    }, [completionHistory]);

    useEffect(() => {
        StorageManager.set("unlockedAchievements", unlockedAchievements);
    }, [unlockedAchievements]);

    const ticketsEarned = useMemo(() =>
        chores
            .filter(chore => completedChores.includes(chore.name))
            .reduce((sum, chore) => sum + chore.tickets, 0),
        [completedChores]
    );

    const availableTickets = ticketsEarned - ticketsRedeemed;

    const stats = useMemo(() => ({
        currentStreak: 3,
        totalChoresCompleted: completedChores.length,
        totalTicketsEarned: ticketsEarned,
        totalTicketsSpent: ticketsRedeemed,
        hardChoresCompleted: completedChores.filter(choreName =>
            chores.find(c => c.name === choreName)?.category === 'Hard'
        ).length,
        weeklyGoalProgress: Math.round((completedChores.length / 15) * 100)
    }), [completedChores, ticketsEarned, ticketsRedeemed]);

    const groupedChores = useMemo(() => ({
        Easy: chores.filter(chore => chore.category === 'Easy'),
        Medium: chores.filter(chore => chore.category === 'Medium'),
        Hard: chores.filter(chore => chore.category === 'Hard')
    }), []);

    const toggleChore = useCallback((chore) => {
        setCompletedChores(prev =>
            prev.includes(chore.name)
                ? prev.filter(name => name !== chore.name)
                : [...prev, chore.name]
        );
    }, []);

    const purchaseItem = useCallback((cost) => {
        if (cost <= availableTickets) {
            setTicketsRedeemed(prev => prev + cost);
            return true;
        }
        return false;
    }, [availableTickets]);

    const resetWeek = useCallback(() => {
        setCompletedChores([]);
    }, []);

    const unlockAchievement = useCallback((achievementId) => {
        setUnlockedAchievements(prev =>
            prev.includes(achievementId) ? prev : [...prev, achievementId]
        );
    }, []);

    return {
        currentPage,
        completedChores,
        ticketsRedeemed,
        completionHistory,
        unlockedAchievements,
        ticketsEarned,
        availableTickets,
        stats,
        groupedChores,
        setCurrentPage,
        toggleChore,
        purchaseItem,
        resetWeek,
        unlockAchievement
    };
}

const checkAchievement = (achievement, stats) => {
    switch (achievement.type) {
        case 'chores_completed':
            return stats.totalChoresCompleted >= achievement.requirement;
        case 'tickets_earned':
            return stats.totalTicketsEarned >= achievement.requirement;
        case 'tickets_spent':
            return stats.totalTicketsSpent >= achievement.requirement;
        case 'daily_streak':
            return stats.currentStreak >= achievement.requirement;
        case 'hard_chores':
            return stats.hardChoresCompleted >= achievement.requirement;
        default:
            return false;
    }
};

function useAchievementChecker(stats, unlockedAchievements, unlockAchievement) {
    useEffect(() => {
        achievements.forEach(achievement => {
            if (!unlockedAchievements.includes(achievement.id) && checkAchievement(achievement, stats)) {
                unlockAchievement(achievement.id);
            }
        });
    }, [stats, unlockedAchievements, unlockAchievement]);
}

// Mobile-optimized Achievement Component
function MobileAchievements({ stats, unlockedAchievements }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">🏅 Achievements</h3>
            <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4">
                {achievements.map((achievement) => {
                    const isUnlocked = unlockedAchievements.includes(achievement.id);
                    return (
                        <div
                            key={achievement.id}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center transition-all ${isUnlocked
                                    ? 'bg-yellow-100 border-2 border-yellow-300'
                                    : 'bg-gray-100 border border-gray-200 opacity-60'
                                }`}
                            title={achievement.description}
                        >
                            <div className="text-xl">{achievement.icon}</div>
                            <div className="text-xs font-medium text-gray-700 text-center leading-tight mt-1">
                                {achievement.name.split(' ')[0]}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Mobile-optimized Stats Component
function MobileStats({ stats }) {
    return (
        <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.currentStreak}</div>
                <div className="text-xs text-gray-600">Day Streak 🔥</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-green-600">{stats.totalChoresCompleted}</div>
                <div className="text-xs text-gray-600">Total Chores ✅</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.totalTicketsEarned}</div>
                <div className="text-xs text-gray-600">Tickets Earned 🎟️</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-orange-600">{stats.weeklyGoalProgress}%</div>
                <div className="text-xs text-gray-600">Weekly Goal 📊</div>
            </div>
        </div>
    );
}

// Mobile-optimized Weekly Goals
function MobileWeeklyGoals({ weeklyGoal, currentProgress }) {
    const progressPercentage = weeklyGoal > 0 ? (currentProgress / weeklyGoal) * 100 : 0;

    return (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-4 mb-6 text-white">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold">🎯 Weekly Goal</h3>
                <div className="text-right">
                    <div className="text-xl font-bold">{currentProgress}/{weeklyGoal}</div>
                    <div className="text-blue-100 text-xs">chores completed</div>
                </div>
            </div>
            <div className="w-full bg-blue-300 rounded-full h-2 mb-2">
                <div
                    className="bg-white h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
            </div>
            <div className="text-blue-100 text-sm">
                {progressPercentage >= 100 ? "🎉 Goal achieved! Amazing work!" : `${Math.round(progressPercentage)}% complete`}
            </div>
        </div>
    );
}

// Mobile Navigation Component
function MobileNav({ currentPage, availableTickets, onNavigate }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-10">
            <div className="flex justify-around items-center">
                <button
                    onClick={() => onNavigate('chores')}
                    className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${currentPage === 'chores'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-500'
                        }`}
                >
                    <span className="text-lg">✅</span>
                    <span className="text-xs font-medium">Chores</span>
                </button>
                <button
                    onClick={() => onNavigate('store')}
                    className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors relative ${currentPage === 'store'
                            ? 'bg-purple-100 text-purple-600'
                            : 'text-gray-500'
                        }`}
                >
                    <span className="text-lg">🛒</span>
                    <span className="text-xs font-medium">Store</span>
                    {availableTickets > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {availableTickets > 9 ? '9+' : availableTickets}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}

// Mobile Store Component
function MobileStore({ availableTickets, onPurchase, onBack }) {
    const handlePurchase = (item) => {
        if (item.cost <= availableTickets) {
            if (window.confirm(`Are you sure you want to redeem "${item.name}" for ${item.cost} tickets?`)) {
                const success = onPurchase(item.cost);
                if (success) {
                    setTimeout(() => onBack(), 1000);
                }
            }
        } else {
            alert(`You need ${item.cost - availableTickets} more tickets to get this reward!`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-white shadow-sm border-b border-gray-200 p-4 z-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">🎁 Virtual Store</h1>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3 text-white">
                    <div className="text-center">
                        <p className="text-blue-100 text-sm mb-1">Available Tickets</p>
                        <div className="text-2xl font-bold">🎟️ {availableTickets}</div>
                    </div>
                </div>
            </div>

            {/* Store Items */}
            <div className="p-4 space-y-4">
                {storeItems.map((item) => {
                    const canAfford = item.cost <= availableTickets;
                    return (
                        <div
                            key={item.id}
                            className={`bg-white rounded-xl shadow-sm border-2 p-4 transition-all duration-200 ${canAfford
                                    ? 'border-green-200 active:bg-green-50 cursor-pointer'
                                    : 'border-gray-200 opacity-60 cursor-not-allowed'
                                }`}
                            onClick={() => canAfford && handlePurchase(item)}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="text-4xl flex-shrink-0">{item.emoji}</div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                                        {item.name}
                                    </h3>
                                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                                        {item.category}
                                    </span>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className={`text-xl font-bold ${canAfford ? 'text-green-600' : 'text-gray-400'}`}>
                                        🎟️ {item.cost}
                                    </div>
                                    {!canAfford && (
                                        <p className="text-red-500 text-xs mt-1">
                                            Need {item.cost - availableTickets} more
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Mobile Dashboard Component
function MobileDashboard({
    completedChores,
    groupedChores,
    stats,
    unlockedAchievements,
    ticketsEarned,
    onToggleChore,
    onResetWeek
}) {
    const totalChores = chores.length;
    const completedCount = completedChores.length;
    const progressPercentage = totalChores > 0 ? (completedCount / totalChores) * 100 : 0;

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all chores for the week?")) {
            onResetWeek();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20 flex justify-center">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="sticky top-0 bg-white shadow-sm border-b border-gray-200 p-4 z-10">
                    <div className="flex justify-between items-center mb-3">
                        <h1 className="text-2xl font-bold text-gray-900">🏆 Chore Tracker</h1>
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                            onClick={handleReset}
                        >
                            🔄 Reset
                        </button>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                {completedCount}/{totalChores} completed
                            </span>
                            <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Tickets */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg">
                        <p className="text-green-100 text-sm mb-1">Total Tickets Earned</p>
                        <p className="text-xl font-bold">🎟️ {ticketsEarned}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <MobileStats stats={stats} />
                    <MobileWeeklyGoals weeklyGoal={15} currentProgress={completedCount} />
                    <MobileAchievements stats={stats} unlockedAchievements={unlockedAchievements} />

                    {/* Chores */}
                    {Object.entries(groupedChores).map(([difficulty, choresList]) => {
                        const colors = categoryColors[difficulty];
                        const completedInCategory = choresList.filter(chore => completedChores.includes(chore.name)).length;

                        return (
                            <div key={difficulty} className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">{difficulty} Chores</h2>
                                    <div className={`px-3 py-1 rounded-full ${colors.badge} text-sm font-semibold`}>
                                        {completedInCategory}/{choresList.length}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {choresList.map((chore) => {
                                        const isCompleted = completedChores.includes(chore.name);
                                        return (
                                            <div
                                                key={chore.name}
                                                className={`${colors.bg} ${colors.border} border-2 rounded-xl shadow-sm p-4 transition-all duration-200 cursor-pointer ${isCompleted
                                                        ? "opacity-75 border-green-400 bg-green-50"
                                                        : "hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:scale-[1.02] active:scale-95"
                                                    }`}
                                                onClick={() => onToggleChore(chore)}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className={`text-lg font-semibold ${colors.text} flex-1 pr-3`}>
                                                        {chore.name}
                                                    </h3>
                                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                                        <span className="text-lg font-bold text-blue-600">🎟️ {chore.tickets}</span>
                                                        {isCompleted && <span className="text-2xl">✅</span>}
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-3 italic leading-relaxed">
                                                    {chore.notes}
                                                </p>

                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                                                    {chore.category}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Main App Component
export default function App() {
    const appState = useAppState();

    useAchievementChecker(appState.stats, appState.unlockedAchievements, appState.unlockAchievement);

    const handleNavigate = (page) => appState.setCurrentPage(page);

    return (
        <div className="min-h-screen relative">
            {appState.currentPage === 'chores' ? (
                <MobileDashboard
                    completedChores={appState.completedChores}
                    groupedChores={appState.groupedChores}
                    stats={appState.stats}
                    unlockedAchievements={appState.unlockedAchievements}
                    ticketsEarned={appState.ticketsEarned}
                    onToggleChore={appState.toggleChore}
                    onResetWeek={appState.resetWeek}
                />
            ) : (
                <MobileStore
                    availableTickets={appState.availableTickets}
                    onPurchase={appState.purchaseItem}
                    onBack={() => handleNavigate('chores')}
                />
            )}

            <MobileNav
                currentPage={appState.currentPage}
                availableTickets={appState.availableTickets}
                onNavigate={handleNavigate}
            />
        </div>
    );
}