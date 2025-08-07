# 🏆 Kids Chore Tracker with Virtual Store

An interactive React-based chore tracking system designed for kids to learn responsibility, time management, and money skills through a fun ticket-based reward system.

## ✨ Features

### 🧹 Chore Management
- **18 age-appropriate chores** categorized by difficulty (Easy, Medium, Hard)
- **Color-coded system** - Green (Easy), Yellow (Medium), Red (Hard)
- **Interactive completion** - Tap/click to mark chores as done
- **Visual feedback** with checkmarks and opacity changes

### 🎟️ Ticket System
- **Earn tickets** by completing chores (1-4 tickets per chore)
- **Track progress** with real-time ticket totals
- **Safe spending** - tickets only deducted when items are purchased

### 🛍️ Virtual Store
- **10 different rewards** ranging from screen time to special outings
- **Smart affordability indicators** - shows what's available vs needs more tickets
- **Confirmation system** to prevent accidental purchases
- **Automatic navigation** back to main page after purchase

### 💾 Data Persistence
- **Local storage** saves progress between sessions
- **Safe implementation** works on all devices including Raspberry Pi
- **Weekly reset** option to start fresh

## 🎯 Chore Categories & Tickets

### Easy Chores (1 ticket each)
- Make the bed
- Feed pets
- Put dirty clothes in hamper
- Pick up toys
- Wipe down table after meals
- And more...

### Medium Chores (2 tickets each)
- Fold laundry
- Wash dishes
- Put away clean clothes
- Help pack lunch
- Keep closet clean
- And more...

### Hard Chores (4 tickets each)
- Take trash to outdoor bin
- Assist in washing car
- Cook simple meals

## 🎁 Virtual Store Rewards

| Reward | Cost | Category |
|--------|------|----------|
| 30 minutes extra screen time | 6 tickets | Fun Time |
| Choose tonight's movie | 5 tickets | Entertainment |
| Stay up 30 minutes later | 8 tickets | Special Privilege |
| Small toy or book | 12 tickets | Physical Reward |
| Trip to the park with snack | 10 tickets | Outing |
| Ice cream treat | 7 tickets | Treat |
| Friend sleepover | 20 tickets | Big Reward |
| Choose what's for dinner | 4 tickets | Choice |
| $5 cash | 20 tickets | Money |
| Art supplies | 15 tickets | Creative |

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/chore-tracker.git
   cd chore-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Deployment Options

### GitHub Pages (Recommended)
1. Add to your `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/chore-tracker"
   ```

2. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Add deploy scripts to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

### Raspberry Pi Setup
Perfect for a dedicated family display!

1. **Kiosk Mode (Recommended)**:
   - Deploy to GitHub Pages first
   - Boot Raspberry Pi with Chromium
   - Navigate to your GitHub Pages URL
   - Press F11 for fullscreen

2. **Local Hosting**:
   ```bash
   npm run build
   sudo apt install lighttpd
   sudo cp -r build/* /var/www/html/
   ```

## 🎨 Customization

### Adding New Chores
Edit the `chores` array in `App.js`:
```javascript
{ name: "Your new chore", category: "Easy", notes: "Description", tickets: 1 }
```

### Modifying Store Items
Edit the `storeItems` array in `App.js`:
```javascript
{ id: 11, name: "New reward", cost: 5, emoji: "🎉", category: "Fun" }
```

### Adjusting Ticket Values
- Easy chores: 1 ticket (good for daily tasks)
- Medium chores: 2 tickets (weekly tasks)
- Hard chores: 4 tickets (challenging tasks)

## 💡 Usage Tips

### For Parents
- **Weekly budget**: ~80 tickets per month = $20 equivalent
- **Reset weekly** to maintain engagement
- **Customize rewards** based on your child's interests
- **Monitor progress** and celebrate achievements

### For Kids
- **Complete chores** by tapping on them
- **Watch tickets accumulate** as you work
- **Visit the store** to see available rewards
- **Save up** for bigger rewards or spend on smaller treats

## 🛠️ Technical Details

### Built With
- React 18+ with Hooks
- Tailwind CSS for styling
- Local Storage for data persistence
- Responsive design for all screen sizes

### Browser Compatibility
- Chrome/Chromium (recommended for Raspberry Pi)
- Firefox
- Safari
- Edge

### Performance
- Lightweight design perfect for Raspberry Pi Zero
- No external API dependencies
- Offline functionality after initial load

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on different devices
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Designed with educational psychology principles in mind
- Inspired by gamification techniques for positive reinforcement
- Built for real families by real parents

## 📞 Support

If you encounter any issues or have questions:
1. Check the GitHub Issues page
2. Create a new issue with detailed description
3. Include screenshots if helpful

---

**Happy Choring!** 🧹✨

*Made with ❤️ for families who want to make chores fun and educational*
