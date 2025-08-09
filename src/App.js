import React, { useState, useEffect } from "react";

const chores = [
    { name: "Make the bed", category: "Easy", notes: "Basic straightening, not perfect", tickets: 1 },
    { name: "Put dirty clothes in hamper", category: "Easy", notes: "After changing", tickets: 1 },
    { name: "Feed pets", category: "Easy", notes: "Scoop food, refill water", tickets: 1 },
    { name: "Pick up your Toys", category: "Easy", notes: "Anything on the floor", tickets: 1 },
    { name: "Pick up after Penelope", category: "Easy", notes: "Indoor or outdoor", tickets: 1 },
    { name: "Wipe down table after meals", category: "Easy", notes: "With a damp cloth", tickets: 1 },
    { name: "Dust low surfaces", category: "Easy", notes: "Like coffee tables, baseboards", tickets: 1 },
    { name: "Empty small trash bins", category: "Easy", notes: "Bathroom or bedroom", tickets: 1 },
    { name: "Fold laundry", category: "Medium", notes: "Towels, socks, shirts", tickets: 2 },
    { name: "Match socks", category: "Medium", notes: "Sorting activity too", tickets: 2 },
    { name: "Put away clean clothes", category: "Medium", notes: "In correct drawers", tickets: 2 },
    { name: "Wash Dishes", category: "Medium", notes: "With guidance", tickets: 2 },
    { name: "Help pack lunch/snack", category: "Medium", notes: "With guidance", tickets: 2 },
    { name: "Wipe down counters", category: "Medium", notes: "Especially after messes", tickets: 2 },
    { name: "Keep closet clean", category: "Medium", notes: "Organized", tickets: 2 },
    { name: "Take trash to outdoor bin", category: "Hard", notes: "Only if physically safe", tickets: 4 },
    { name: "Assist in washing car", category: "Hard", notes: "Hose, sponge, towel off", tickets: 4 },
    { name: "Cook simple meals", category: "Hard", notes: "Sandwiches, scrambled eggs", tickets: 4 }
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

const categoryColors = {
    Easy: "bg-green-100",
    Medium: "bg-yellow-100",
    Hard: "bg-red-100"
};

// Safe localStorage helper functions
const getFromStorage = (key, defaultValue) => {
    if (typeof window !== "undefined" && window.localStorage) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error reading from localStorage: ${error}`);
            return defaultValue;
        }
    }
    return defaultValue;
};

const setToStorage = (key, value) => {
    if (typeof window !== "undefined" && window.localStorage) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`Error writing to localStorage: ${error}`);
        }
    }
};

// Virtual Store Component
function VirtualStore({ availableTickets, onPurchase, onBack }) {
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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">🎁 Virtual Store</h1>
                <button 
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    onClick={onBack}
                >
                    ← Back to Chores
                </button>
            </div>
            
            <div className="bg-blue-100 p-4 rounded-lg mb-6">
                <p className="text-xl font-semibold">Your Available Tickets: 🎟️ {availableTickets}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {storeItems.map((item) => (
                    <div
                        key={item.id}
                        className={`rounded-xl shadow-lg p-6 border-2 transition-all duration-200 hover:shadow-xl ${
                            item.cost <= availableTickets 
                                ? 'border-green-300 bg-white hover:bg-green-50 cursor-pointer' 
                                : 'border-gray-300 bg-gray-100 opacity-60'
                        }`}
                        onClick={() => handlePurchase(item)}
                    >
                        <div className="text-center">
                            <div className="text-4xl mb-2">{item.emoji}</div>
                            <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                            <div className="text-xl font-bold text-blue-600">
                                🎟️ {item.cost} tickets
                            </div>
                            {item.cost > availableTickets && (
                                <p className="text-red-500 text-sm mt-2">
                                    Need {item.cost - availableTickets} more tickets
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Main Chore Dashboard Component
function ChoreDashboard({ onGoToStore, groupedChores }) {
    const [completed, setCompleted] = useState(() => getFromStorage("completedChores", []));

    useEffect(() => {
        setToStorage("completedChores", completed);
    }, [completed]);

    const toggleChore = (chore) => {
        setCompleted((prev) =>
            prev.includes(chore.name)
                ? prev.filter((c) => c !== chore.name)
                : [...prev, chore.name]
        );
    };

    const totalTickets = chores
        .filter((chore) => completed.includes(chore.name))
        .reduce((sum, chore) => sum + chore.tickets, 0);

    const resetWeek = () => {
        if (window.confirm("Are you sure you want to reset all chores for the week?")) {
            setCompleted([]);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">🏆 Chore Tracker</h1>
            <p className="mb-4 text-xl">Total Tickets Earned: <strong className="text-green-600">🎟️ {totalTickets}</strong></p>

            <div className="flex gap-4 mb-6">
                <button 
                    className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 font-semibold"
                    onClick={onGoToStore}
                >
                    🛍️ Visit Store
                </button>
                <button 
                    className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-semibold" 
                    onClick={resetWeek}
                >
                    🔄 Reset Week
                </button>
            </div>

            {/* Organized by Difficulty Level */}
            {Object.entries(groupedChores).map(([difficulty, choresList]) => (
                <div key={difficulty} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-700">
                        {difficulty} Chores ({choresList.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {choresList.map((chore) => (
                            <div
                                key={chore.name}
                                className={`rounded-xl shadow-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-xl ${
                                    categoryColors[chore.category]
                                } ${completed.includes(chore.name) ? "opacity-50 border-4 border-green-400" : "hover:scale-105"}`}
                                onClick={() => toggleChore(chore)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold">{chore.name}</h3>
                                    {completed.includes(chore.name) && <span className="text-2xl">✅</span>}
                                </div>
                                <p className="text-sm italic mb-3 text-gray-600">{chore.notes}</p>
                                <div className="flex justify-between items-center">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white shadow">
                                        {chore.category}
                                    </span>
                                    <span className="text-xl font-bold text-blue-600">🎟️ {chore.tickets}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Main App Component
export default function App() {
    const [currentPage, setCurrentPage] = useState('chores');
    const [redeemed, setRedeemed] = useState(() => getFromStorage("redeemedTickets", 0));
    const [completed] = useState(() => getFromStorage("completedChores", []));

    useEffect(() => {
        setToStorage("redeemedTickets", redeemed);
    }, [redeemed]);

    const totalTickets = chores
        .filter((chore) => completed.includes(chore.name))
        .reduce((sum, chore) => sum + chore.tickets, 0);

    const availableTickets = totalTickets - redeemed;

    const handlePurchase = (cost) => {
        setRedeemed(prev => prev + cost);
        // Auto-navigate back to chores after purchase
        setTimeout(() => {
            setCurrentPage('chores');
        }, 1000);
    };

    const goToStore = () => {
        setCurrentPage('store');
    };

    const goToChores = () => {
        setCurrentPage('chores');
    };

    // Group chores by difficulty for better organization
    const groupedChores = {
        Easy: chores.filter(chore => chore.category === 'Easy'),
        Medium: chores.filter(chore => chore.category === 'Medium'),
        Hard: chores.filter(chore => chore.category === 'Hard')
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {currentPage === 'chores' ? (
                <ChoreDashboard onGoToStore={goToStore} groupedChores={groupedChores} />
            ) : (
                <VirtualStore 
                    availableTickets={availableTickets} 
                    onPurchase={handlePurchase}
                    onBack={goToChores}
                />
            )}
        </div>
    );
}