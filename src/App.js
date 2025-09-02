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
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
        accent: "bg-green-500"
    },
    Medium: {
        bg: "bg-yellow-50",
        border: "border-yellow-200", 
        text: "text-yellow-800",
        accent: "bg-yellow-500"
    },
    Hard: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-800", 
        accent: "bg-orange-500"
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
    const [currentPage, setCurrentPage] = useState('dashboard');
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

// Navigation Component
function Navigation({ currentPage, onPageChange }) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { id: 'chores', label: 'Chores', icon: '✅' },
        { id: 'rewards', label: 'Rewards', icon: '🎁' },
        { id: 'progress', label: 'Progress', icon: '📊' }
    ];

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-900">Family Chore Tracker</h1>
                    </div>
                    <div className="flex space-x-8">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onPageChange(item.id)}
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                                    currentPage === item.id
                                        ? 'border-blue-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="mr-2">{item.icon}</span>
                                <span className="hidden sm:inline">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}

// Dashboard Overview Component
function Dashboard({ stats, completedChores, groupedChores, onPageChange }) {
    const totalChores = chores.length;
    const completedCount = completedChores.length;
    const progressPercentage = totalChores > 0 ? (completedCount / totalChores) * 100 : 0;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Family Dashboard</h2>
                <p className="text-gray-600">Overview of family chore progress and achievements</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <span className="text-2xl">🎟️</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalTicketsEarned}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <span className="text-2xl">✅</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Chores Done</p>
                            <p className="text-2xl font-semibold text-gray-900">{completedCount}/{totalChores}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <span className="text-2xl">🔥</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Day Streak</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.currentStreak}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <span className="text-2xl">🎯</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Weekly Goal</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.weeklyGoalProgress}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <p className="text-sm text-gray-600">{Math.round(progressPercentage)}% of chores completed this week</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => onPageChange('chores')}>
                    <div className="text-center">
                        <span className="text-4xl mb-3 block">✅</span>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">View Chores</h3>
                        <p className="text-sm text-gray-600">See all available chores and mark them complete</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => onPageChange('rewards')}>
                    <div className="text-center">
                        <span className="text-4xl mb-3 block">🎁</span>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Redeem Rewards</h3>
                        <p className="text-sm text-gray-600">Spend your earned tickets on fun rewards</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => onPageChange('progress')}>
                    <div className="text-center">
                        <span className="text-4xl mb-3 block">📊</span>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">View Progress</h3>
                        <p className="text-sm text-gray-600">Track achievements and see detailed statistics</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Chores List Component
function ChoresList({ completedChores, groupedChores, onToggleChore, onReset }) {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Family Chores</h2>
                    <p className="text-gray-600">Click on chores to mark them as complete</p>
                </div>
                <button 
                    onClick={onReset}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    Reset Week
                </button>
            </div>

            {Object.entries(groupedChores).map(([difficulty, choresList]) => {
                const colors = categoryColors[difficulty];
                const completedInCategory = choresList.filter(chore => completedChores.includes(chore.name)).length;
                
                return (
                    <div key={difficulty} className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">{difficulty} Chores</h3>
                            <span className="text-sm text-gray-600">{completedInCategory}/{choresList.length} completed</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {choresList.map((chore) => {
                                const isCompleted = completedChores.includes(chore.name);
                                return (
                                    <div
                                        key={chore.name}
                                        className={`${colors.bg} ${colors.border} border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                            isCompleted 
                                                ? "opacity-75 bg-green-50 border-green-300" 
                                                : "hover:border-blue-400 hover:shadow-lg"
                                        }`}
                                        onClick={() => onToggleChore(chore)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <h4 className={`font-semibold ${colors.text} flex-1 pr-2`}>
                                                {chore.name}
                                            </h4>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center bg-white px-2 py-1 rounded text-sm font-medium">
                                                    <span className="mr-1">🎟️</span>
                                                    {chore.tickets}
                                                </div>
                                                {isCompleted && <span className="text-green-500 text-xl">✓</span>}
                                            </div>
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 mb-3 italic">
                                            {chore.notes}
                                        </p>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${colors.accent}`}>
                                                {chore.category}
                                            </span>
                                            <span className="text-xs text-gray-500 capitalize">{chore.recurring}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Rewards Store Component
function RewardsStore({ availableTickets, onPurchase }) {
    const handlePurchase = (item) => {
        if (item.cost <= availableTickets) {
            if (window.confirm(`Are you sure you want to redeem "${item.name}" for ${item.cost} tickets?`)) {
                onPurchase(item.cost);
            }
        } else {
            alert(`You need ${item.cost - availableTickets} more tickets to get this reward!`);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reward Store</h2>
                <p className="text-gray-600">Spend your earned tickets on fun rewards!</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="text-center">
                    <p className="text-sm text-blue-600 mb-1">Available Tickets</p>
                    <p className="text-3xl font-bold text-blue-700">🎟️ {availableTickets}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeItems.map((item) => {
                    const canAfford = item.cost <= availableTickets;
                    return (
                        <div
                            key={item.id}
                            className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all duration-200 ${
                                canAfford 
                                    ? 'border-green-200 hover:border-green-300 hover:shadow-md cursor-pointer' 
                                    : 'border-gray-200 opacity-60 cursor-not-allowed'
                            }`}
                            onClick={() => canAfford && handlePurchase(item)}
                        >
                            <div className="text-center">
                                <div className="text-5xl mb-4">{item.emoji}</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {item.name}
                                </h3>
                                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                                    {item.category}
                                </span>
                                <div className={`text-2xl font-bold mb-3 ${canAfford ? 'text-green-600' : 'text-gray-400'}`}>
                                    🎟️ {item.cost}
                                </div>
                                {!canAfford && (
                                    <p className="text-red-500 text-sm font-medium">
                                        Need {item.cost - availableTickets} more tickets
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Progress Tracking Component
function ProgressTracking({ stats, unlockedAchievements }) {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Progress & Achievements</h2>
                <p className="text-gray-600">Track your family's accomplishments and milestones</p>
            </div>

            {/* Achievement Badges */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                    {achievements.map((achievement) => {
                        const isUnlocked = unlockedAchievements.includes(achievement.id);
                        return (
                            <div
                                key={achievement.id}
                                className={`p-4 rounded-lg text-center transition-all ${
                                    isUnlocked 
                                        ? 'bg-yellow-50 border-2 border-yellow-300' 
                                        : 'bg-gray-50 border border-gray-200 opacity-60'
                                }`}
                                title={achievement.description}
                            >
                                <div className="text-3xl mb-2">{achievement.icon}</div>
                                <div className="text-sm font-medium text-gray-700">{achievement.name}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Statistics</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Chores Completed</span>
                            <span className="font-semibold">{stats.totalChoresCompleted}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tickets Earned</span>
                            <span className="font-semibold">{stats.totalTicketsEarned}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Current Streak</span>
                            <span className="font-semibold">{stats.currentStreak} days</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Hard Chores Done</span>
                            <span className="font-semibold">{stats.hardChoresCompleted}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Goal Progress</h3>
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progress</span>
                            <span>{stats.weeklyGoalProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div 
                                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(stats.weeklyGoalProgress, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">
                        {stats.weeklyGoalProgress >= 100 
                            ? "Congratulations! You've reached your weekly goal!" 
                            : `Keep going! You're ${100 - stats.weeklyGoalProgress}% away from your goal.`
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}

// Main App Component
export default function App() {
    const appState = useAppState();
    
    useAchievementChecker(appState.stats, appState.unlockedAchievements, appState.unlockAchievement);

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all chores for the week?")) {
            appState.resetWeek();
        }
    };

    const renderCurrentPage = () => {
        switch (appState.currentPage) {
            case 'dashboard':
                return (
                    <Dashboard 
                        stats={appState.stats}
                        completedChores={appState.completedChores}
                        groupedChores={appState.groupedChores}
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
                    <ProgressTracking
                        stats={appState.stats}
                        unlockedAchievements={appState.unlockedAchievements}
                    />
                );
            default:
                return <Dashboard 
                    stats={appState.stats}
                    completedChores={appState.completedChores}
                    groupedChores={appState.groupedChores}
                    onPageChange={appState.setCurrentPage}
                />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation 
                currentPage={appState.currentPage} 
                onPageChange={appState.setCurrentPage} 
            />
            {renderCurrentPage()}
        </div>
    );
}