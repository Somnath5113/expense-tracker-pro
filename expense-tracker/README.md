# 💰 Expense Tracker Pro

A modern, feature-rich expense tracking web application built with Streamlit. Track your expenses with style using an Apple-inspired calculator, beautiful analytics, and mobile-responsive design.

[![Streamlit App](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://your-app-url.streamlit.app)

## ✨ Features

### 🧮 **Apple-Style Calculator**
- **Authentic Design**: Pixel-perfect replica of Apple's iOS calculator
- **Full Functionality**: All standard operations (+, -, ×, ÷, %, ±, AC)
- **Smart Integration**: Calculate amounts and directly add as expenses
- **Touch Optimized**: Perfect for mobile devices

### 📊 **Advanced Analytics**
- **Interactive Charts**: Pie charts, bar graphs, trend lines, and box plots
- **Category Analysis**: See where your money goes with detailed breakdowns
- **Time-Based Filtering**: Analyze expenses by day, week, month, or custom periods
- **Real-time Insights**: AI-powered spending analysis and recommendations

### 📱 **Mobile-First Design**
- **Responsive Layout**: Perfect on phones, tablets, and desktops
- **Glass-morphism UI**: Modern transparent design with backdrop blur effects
- **Touch-Friendly**: Large buttons and intuitive navigation
- **Fast Loading**: Optimized for mobile browsers

### � **Robust Data Management**
- **CSV Storage**: Primary data storage in CSV format for Excel compatibility
- **Automatic Backups**: JSON backups created automatically
- **Import/Export**: Full CSV and JSON import/export capabilities
- **Cloud Ready**: Optimized for Streamlit Cloud deployment

### � **Comprehensive Reporting**
- **Flexible Periods**: Last 7 days, 30 days, 3 months, 6 months, or all time
- **Excel Export**: Generate downloadable Excel reports
- **Category Breakdown**: Detailed statistics with percentages
- **Spending Patterns**: Day-of-week analysis and trends

## 🚀 Live Demo

**[Try the App Live](https://your-app-url.streamlit.app)** *(Replace with your deployed URL)*

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x600/667eea/ffffff?text=Dashboard+Screenshot)

### Apple Calculator
![Calculator](https://via.placeholder.com/400x600/1c1c1e/ffffff?text=Apple+Calculator)

### Analytics
![Analytics](https://via.placeholder.com/800x600/667eea/ffffff?text=Analytics+Charts)

## � Installation & Setup

### Option 1: Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/expense-tracker-pro.git
   cd expense-tracker-pro
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   streamlit run app.py
   ```

5. **Open in browser**
   - Navigate to `http://localhost:8501`
   - Start tracking your expenses!

### Option 2: Deploy to Streamlit Cloud

1. **Fork this repository** on GitHub
2. **Sign up** at [share.streamlit.io](https://share.streamlit.io)
3. **Connect your GitHub** account
4. **Deploy** by selecting your forked repository
5. **Share** your public URL with others!

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## � Usage Guide

### Adding Expenses
1. Navigate to "➕ Add Expense"
2. Enter amount, select category, add description
3. Set date and click "💾 Add Expense"

### Using the Calculator
1. Go to "🧮 Calculator" 
2. Perform calculations with Apple-style interface
3. Click "📝 Add as Expense" to transfer the amount

### Viewing Analytics
1. Visit "📈 Analytics" for detailed charts
2. Use date filters to analyze specific periods
3. Explore different visualizations

### Generating Reports
1. Go to "📋 Summary Report"
2. Select your desired time period
3. View comprehensive statistics
4. Export to Excel if needed

### Data Management
1. **Export**: Download CSV or JSON backups
2. **Import**: Upload previous backups to restore data
3. **Backup**: Create timestamped backups anytime

## 🎨 Technology Stack

- **Frontend**: Streamlit with custom CSS
- **Data Processing**: Pandas for data manipulation
- **Visualizations**: Plotly for interactive charts
- **Storage**: CSV/JSON for data persistence
- **Styling**: Modern CSS with glass-morphism effects
- **Deployment**: Streamlit Cloud ready

## 🌟 Key Highlights

### 🧮 **Calculator Features**
- Dark theme matching Apple's design
- Circular buttons with proper spacing
- Orange operator buttons
- Wide zero button
- Smooth animations and hover effects

### � **Analytics Features**
- Category-wise expense distribution
- Monthly spending trends
- Day-of-week analysis
- Top expenses identification
- Interactive filtering

### 📱 **Mobile Features**
- Touch-optimized interface
- Responsive design patterns
- Fast loading on mobile networks
- Offline-capable after initial load

### 💾 **Data Features**
- Automatic CSV storage
- Excel compatibility
- Data import/export
- Session persistence
- Backup management

## � Privacy & Security

- **Local Processing**: All data processing happens in your browser
- **No External Servers**: Data doesn't leave your device (except when deployed to cloud)
- **Session Isolation**: Each user has isolated data in cloud deployment
- **Backup Control**: You control all data exports and backups

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Acknowledgments

- **Streamlit** for the amazing web app framework
- **Plotly** for beautiful interactive charts
- **Apple** for the calculator design inspiration
- **Modern CSS** techniques for glass-morphism effects

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/expense-tracker-pro/issues) page
2. Create a new issue with detailed description
3. Join the discussion in existing issues

## 🎯 Future Enhancements

- [ ] Cloud data synchronization
- [ ] Multiple currency support
- [ ] Budget goal setting and tracking
- [ ] Receipt photo uploads with OCR
- [ ] Shared family budgets
- [ ] Investment tracking
- [ ] Bill reminders and notifications
- [ ] Machine learning for spending prediction

## ⭐ Star This Repository

If you find this project useful, please consider giving it a star! It helps others discover the project.

---

**Built with ❤️ using Streamlit and modern web technologies**

*Transform your expense tracking experience with this beautiful, modern application!*
