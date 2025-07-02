import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import json
import os
from pathlib import Path

# Cloud deployment utility functions
def is_cloud_deployment():
    """Check if running on Streamlit Cloud"""
    return os.environ.get('STREAMLIT_SHARING_MODE') is not None or \
           os.environ.get('STREAMLIT_CLOUD') is not None

def get_data_directory():
    """Get appropriate data directory for cloud or local deployment"""
    if is_cloud_deployment():
        # On Streamlit Cloud, use a temporary directory that persists during session
        import tempfile
        temp_dir = tempfile.gettempdir()
        data_dir = os.path.join(temp_dir, 'expense_tracker_data')
        os.makedirs(data_dir, exist_ok=True)
        return data_dir
    else:
        # Local deployment uses current directory
        return '.'

# Update file paths for cloud deployment
DATA_DIR = get_data_directory()
CSV_DATA_FILE = os.path.join(DATA_DIR, "expenses_data.csv")
JSON_DATA_FILE = os.path.join(DATA_DIR, "expenses_data.json")

# Cloud deployment optimization
@st.cache_data
def load_cached_data():
    """Load data with caching for better performance"""
    return st.session_state.get('expenses', [])

# Page configuration for mobile responsiveness
st.set_page_config(
    page_title="💰 Expense Tracker Pro",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={
        'Get Help': 'https://github.com/your-repo/expense-tracker',
        'Report a bug': 'https://github.com/your-repo/expense-tracker/issues',
        'About': """
        # Expense Tracker Pro 💰
        
        A modern, mobile-responsive expense tracking application with:
        - 🧮 Apple-style calculator
        - 📊 Advanced analytics and charts
        - 📱 Mobile-optimized design
        - 💾 CSV data persistence
        - 📈 Real-time insights
        
        Built with Streamlit and modern web technologies.
        """
    }
)

# Custom CSS for attractive mobile-responsive design with Apple-style calculator
st.markdown("""
<style>
    /* Import modern fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
    
    /* Root variables for consistent theming */
    :root {
        --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        --dark-gradient: linear-gradient(135deg, #4c63d2 0%, #152331 100%);
        --success-color: #00d4aa;
        --warning-color: #ff6b6b;
        --glass-bg: rgba(255, 255, 255, 0.1);
        --glass-border: rgba(255, 255, 255, 0.2);
        --shadow-soft: 0 8px 32px rgba(31, 38, 135, 0.15);
        --shadow-hover: 0 12px 40px rgba(31, 38, 135, 0.25);
    }
    
    /* Main app styling */
    .stApp {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    .main .block-container {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 2rem;
        margin: 1rem;
        box-shadow: var(--shadow-soft);
    }
    
    .main-header {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        padding: 2rem;
        border-radius: 20px;
        margin-bottom: 2rem;
        text-align: center;
        color: white;
        font-size: 2.5rem;
        font-weight: 800;
        text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        box-shadow: var(--shadow-soft);
    }
    
    .metric-card {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        padding: 1.5rem;
        border-radius: 16px;
        margin-bottom: 1rem;
        box-shadow: var(--shadow-soft);
        transition: all 0.3s ease;
        color: white;
    }
    
    .metric-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-hover);
    }
    
    .expense-card {
        background: var(--glass-bg);
        backdrop-filter: blur(10px);
        border: 1px solid var(--glass-border);
        padding: 1rem;
        border-radius: 12px;
        margin-bottom: 0.8rem;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        color: white;
    }
    
    .expense-card:hover {
        transform: translateX(5px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    
    /* Apple-style Calculator */
    .calculator-container {
        background: #1c1c1e;
        border-radius: 24px;
        padding: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        max-width: 320px;
        margin: 0 auto;
    }
    
    .calculator-display {
        background: transparent;
        color: white;
        font-size: 3rem;
        font-weight: 200;
        text-align: right;
        padding: 20px;
        margin-bottom: 20px;
        font-family: 'Inter', sans-serif;
        min-height: 80px;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        border-radius: 12px;
        overflow: hidden;
        word-break: break-all;
    }
    
    .calc-button {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        border: none;
        font-size: 1.8rem;
        font-weight: 400;
        margin: 5px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: 'Inter', sans-serif;
    }
    
    .calc-button:hover {
        transform: scale(1.1);
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }
    
    .calc-button:active {
        transform: scale(0.95);
    }
    
    .calc-button.number {
        background: #333333;
        color: white;
    }
    
    .calc-button.operator {
        background: #ff9500;
        color: white;
    }
    
    .calc-button.function {
        background: #a6a6a6;
        color: black;
    }
    
    .calc-button.zero {
        width: 150px;
        border-radius: 35px;
    }
    
    /* Expense List Styling */
    .expense-list {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 1.5rem;
        margin: 1rem 0;
        max-height: 400px;
        overflow-y: auto;
        box-shadow: var(--shadow-soft);
    }
    
    .expense-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        margin: 8px 0;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
        color: white;
    }
    
    .expense-item:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateX(5px);
    }
    
    .expense-amount {
        font-weight: 600;
        font-size: 1.1rem;
        color: var(--success-color);
    }
    
    .expense-category {
        font-size: 0.9rem;
        opacity: 0.8;
    }
    
    .expense-description {
        font-weight: 500;
        margin-bottom: 4px;
    }
    
    /* Sidebar styling */
    .css-1d391kg {
        background: var(--dark-gradient);
    }
    
    .sidebar .sidebar-content {
        background: var(--dark-gradient);
        border-radius: 0 20px 20px 0;
    }
    
    /* Button styling */
    .stButton > button {
        width: 100%;
        border-radius: 16px;
        border: none;
        background: var(--primary-gradient);
        color: white;
        font-weight: 600;
        padding: 0.75rem 1.5rem;
        transition: all 0.3s ease;
        font-size: 1rem;
        box-shadow: var(--shadow-soft);
    }
    
    .stButton > button:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-hover);
        background: var(--secondary-gradient);
    }
    
    /* Calculator specific button styling */
    div[data-testid="column"] .stButton > button {
        height: 70px;
        border-radius: 50%;
        font-size: 1.8rem;
        font-weight: 400;
        margin: 5px 0;
        font-family: 'Inter', sans-serif;
    }
    
    /* Calculator button variants */
    .stButton > button[kind="secondary"] {
        background: #333333;
        color: white;
    }
    
    .stButton > button[kind="primary"] {
        background: #ff9500;
        color: white;
    }
    
    /* Function buttons (AC, ±, %) */
    div[data-testid="column"]:nth-child(1) .stButton > button,
    div[data-testid="column"]:nth-child(2) .stButton > button:first-child,
    div[data-testid="column"]:nth-child(3) .stButton > button:first-child {
        background: #a6a6a6;
        color: black;
    }
    
    /* Operator buttons (÷, ×, −, +, =) */
    div[data-testid="column"]:nth-child(4) .stButton > button {
        background: #ff9500;
        color: white;
    }
    
    /* Zero button styling */
    div[data-testid="column"]:nth-child(1) .stButton:last-child > button {
        width: 150px;
        border-radius: 35px;
    }
    
    /* Input styling */
    .stSelectbox > div > div > select,
    .stNumberInput > div > div > input,
    .stTextInput > div > div > input {
        border-radius: 12px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        background: var(--glass-bg);
        backdrop-filter: blur(10px);
        color: white;
        padding: 0.75rem;
    }
    
    .stSelectbox > div > div > select:focus,
    .stNumberInput > div > div > input:focus,
    .stTextInput > div > div > input:focus {
        border-color: var(--success-color);
        box-shadow: 0 0 20px rgba(0, 212, 170, 0.3);
    }
    
    /* Metric styling */
    .stMetric {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 1rem;
        box-shadow: var(--shadow-soft);
        transition: all 0.3s ease;
    }
    
    .stMetric:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-hover);
    }
    
    .stMetric label {
        color: rgba(255, 255, 255, 0.8) !important;
        font-weight: 500;
    }
    
    .stMetric [data-testid="metric-value"] {
        color: white !important;
        font-weight: 700;
        font-size: 1.5rem;
    }
    
    /* Chart container styling */
    .js-plotly-plot {
        border-radius: 16px;
        overflow: hidden;
        box-shadow: var(--shadow-soft);
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .main-header {
            font-size: 2rem;
            padding: 1.5rem;
        }
        
        .calculator-container {
            max-width: 280px;
            padding: 15px;
        }
        
        .calculator-display {
            font-size: 2.5rem;
            padding: 15px;
            min-height: 60px;
        }
        
        .calc-button {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
            margin: 3px;
        }
        
        .calc-button.zero {
            width: 126px;
        }
        
        .expense-list {
            max-height: 300px;
        }
        
        .main .block-container {
            padding: 1rem;
            margin: 0.5rem;
        }
    }
    
    /* Scrollbar styling */
    ::-webkit-scrollbar {
        width: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
    }
    
    /* Animation keyframes */
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .metric-card,
    .expense-card,
    .expense-item {
        animation: slideIn 0.6s ease-out;
    }
    
    /* Advanced Calculator Button Styling */
    .calculator-row {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-bottom: 10px;
    }
    
    .calculator-row .stButton {
        flex: 1;
        max-width: 70px;
    }
    
    .calculator-row .stButton.zero-button {
        flex: 2.2;
        max-width: 150px;
    }
    
    /* Specific calculator page button styling */
    div[data-testid="stVerticalBlock"] > div:has(.calculator-container) .stButton > button {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        font-size: 1.8rem;
        font-weight: 400;
        margin: 5px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #333333;
        color: white;
        border: none;
        transition: all 0.2s ease;
    }
    
    div[data-testid="stVerticalBlock"] > div:has(.calculator-container) .stButton > button:hover {
        transform: scale(1.1);
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }
    
    div[data-testid="stVerticalBlock"] > div:has(.calculator-container) .stButton > button:active {
        transform: scale(0.95);
    }
    
    /* Calculator operators */
    div[data-testid="stVerticalBlock"] > div:has(.calculator-container) div[data-testid="column"]:nth-child(4) .stButton > button {
        background: #ff9500 !important;
        color: white !important;
    }
    
    /* Calculator functions (AC, ±, %) */
    div[data-testid="stVerticalBlock"] > div:has(.calculator-container) div[data-testid="column"]:nth-child(1) .stButton:nth-child(1) > button,
    div[data-testid="stVerticalBlock"] > div:has(.calculator-container) div[data-testid="column"]:nth-child(2) .stButton:nth-child(1) > button,
    div[data-testid="stVerticalBlock"] > div:has(.calculator-container) div[data-testid="column"]:nth-child(3) .stButton:nth-child(1) > button {
        background: #a6a6a6 !important;
        color: black !important;
    }
    
    /* Zero button special styling */
    div[data-testid="stVerticalBlock"] > div:has(.calculator-container) div[data-testid="column"]:nth-child(1) .stButton:nth-child(1) > button {
        width: 150px !important;
        border-radius: 35px !important;
    }
</style>
""", unsafe_allow_html=True)

# Data file paths
# Cloud deployment utility functions
def is_cloud_deployment():
    """Check if running on Streamlit Cloud"""
    return os.environ.get('STREAMLIT_SHARING_MODE') is not None or \
           os.environ.get('STREAMLIT_CLOUD') is not None

def get_data_directory():
    """Get appropriate data directory for cloud or local deployment"""
    if is_cloud_deployment():
        # On Streamlit Cloud, use a temporary directory that persists during session
        import tempfile
        temp_dir = tempfile.gettempdir()
        data_dir = os.path.join(temp_dir, 'expense_tracker_data')
        os.makedirs(data_dir, exist_ok=True)
        return data_dir
    else:
        # Local deployment uses current directory
        return '.'

# Update file paths for cloud deployment
DATA_DIR = get_data_directory()
CSV_DATA_FILE = os.path.join(DATA_DIR, "expenses_data.csv")
JSON_DATA_FILE = os.path.join(DATA_DIR, "expenses_data.json")

# Initialize calculator session state (but NOT expenses - that's loaded from files)
if 'calculator_display' not in st.session_state:
    st.session_state.calculator_display = "0"
    
if 'calculator_previous' not in st.session_state:
    st.session_state.calculator_previous = 0
    
if 'calculator_operation' not in st.session_state:
    st.session_state.calculator_operation = None

# Initialize custom categories
if 'custom_categories' not in st.session_state:
    st.session_state.custom_categories = [
        "🍔 Food & Dining", "🚗 Transportation", "🛒 Shopping", 
        "🏠 Bills & Utilities", "🎬 Entertainment", "🏥 Healthcare",
        "📚 Education", "💼 Business", "👕 Clothing", "🎁 Gifts",
        "🏖️ Travel", "💳 Banking", "🔧 Maintenance", "📱 Technology",
        "🏃 Fitness", "🎨 Hobbies", "📰 Subscriptions", "🔄 Other"
    ]

# Load existing data
@st.cache_data(ttl=30)  # Cache for 30 seconds
def load_data_from_files():
    """Load data from CSV file, fallback to JSON if CSV doesn't exist"""
    expenses = []
    
    # Debug info
    csv_exists = os.path.exists(CSV_DATA_FILE)
    json_exists = os.path.exists(JSON_DATA_FILE)
    
    # First try to load from CSV
    if csv_exists:
        try:
            df = pd.read_csv(CSV_DATA_FILE, encoding='utf-8')
            if not df.empty:
                # Convert DataFrame back to list of dictionaries
                expenses = df.to_dict('records')
                # Debug: Show what was loaded
                st.write(f"🔄 Debug: Loaded {len(expenses)} expenses from CSV file")
                return expenses
        except Exception as e:
            st.error(f"Error loading CSV file: {e}")
    
    # Fallback to JSON file
    if json_exists:
        try:
            with open(JSON_DATA_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                expenses = data.get('expenses', [])
                if expenses:
                    st.write(f"🔄 Debug: Loaded {len(expenses)} expenses from JSON file")
                return expenses
        except Exception as e:
            st.error(f"Error loading JSON file: {e}")
    
    # If no files exist, inform user
    if not csv_exists and not json_exists:
        st.info("ℹ️ No existing data files found. Starting with empty expense list.")
    
    return expenses

def load_data():
    """Initialize session state with data from files - only if not already loaded"""
    if 'expenses' not in st.session_state:
        loaded_expenses = load_data_from_files()
        st.session_state.expenses = loaded_expenses
        if loaded_expenses:
            st.success(f"✅ Loaded {len(loaded_expenses)} expenses from saved data")

# Save data
def save_data():
    """Save data to both CSV and JSON formats with error handling"""
    try:
        if st.session_state.expenses:
            # Save to CSV (primary storage)
            df = pd.DataFrame(st.session_state.expenses)
            df.to_csv(CSV_DATA_FILE, index=False, encoding='utf-8')
            
            # Also save to JSON as backup
            data = {'expenses': st.session_state.expenses}
            with open(JSON_DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
                
            # Clear cache to ensure fresh data
            load_data_from_files.clear()
            
            # Debug info
            st.success(f"💾 Data saved successfully! ({len(st.session_state.expenses)} expenses)")
        else:
            # Create empty files
            pd.DataFrame(columns=['amount', 'category', 'description', 'date', 'timestamp']).to_csv(CSV_DATA_FILE, index=False, encoding='utf-8')
            with open(JSON_DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump({'expenses': []}, f)
            
            # Clear cache
            load_data_from_files.clear()
            st.info("📄 Empty data files created.")
                
    except Exception as e:
        st.error(f"Error saving data: {e}")
        # Fallback: try to save to a different location
        try:
            fallback_file = f"expenses_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            df = pd.DataFrame(st.session_state.expenses)
            df.to_csv(fallback_file, index=False, encoding='utf-8')
            st.warning(f"Data saved to fallback file: {fallback_file}")
        except Exception as fallback_error:
            st.error("Unable to save data. Please download a backup.")

# Enhanced backup function for cloud deployment
def create_backup():
    """Create a timestamped backup of the data with cloud optimization"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_csv = f"expense_backup_{timestamp}.csv"
    backup_json = f"expense_backup_{timestamp}.json"
    
    try:
        if st.session_state.expenses:
            # CSV backup
            df = pd.DataFrame(st.session_state.expenses)
            df.to_csv(backup_csv, index=False, encoding='utf-8')
            
            # JSON backup
            data = {'expenses': st.session_state.expenses}
            with open(backup_json, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            
            return backup_csv, backup_json
        else:
            return None, None
    except Exception as e:
        st.error(f"Error creating backup: {e}")
        return None, None

# CSV Import function
def import_csv_data(uploaded_file):
    """Import data from uploaded CSV file"""
    try:
        df = pd.read_csv(uploaded_file, encoding='utf-8')
        required_columns = ['amount', 'category', 'description', 'date', 'timestamp']
        
        # Check if all required columns exist
        if all(col in df.columns for col in required_columns):
            # Convert DataFrame to list of dictionaries
            imported_expenses = df.to_dict('records')
            
            # Validate data types
            for expense in imported_expenses:
                expense['amount'] = float(expense['amount'])
                # Ensure date and timestamp are strings
                expense['date'] = str(expense['date'])
                expense['timestamp'] = str(expense['timestamp'])
            
            return imported_expenses
        else:
            missing_cols = [col for col in required_columns if col not in df.columns]
            st.error(f"❌ Missing required columns: {missing_cols}")
            return None
            
    except Exception as e:
        st.error(f"❌ Error importing CSV: {e}")
        return None

# Load data on startup
load_data()

# Cloud deployment warning
if is_cloud_deployment():
    st.info("""
    🌐 **Cloud Deployment Notice**: This app is running on Streamlit Cloud. 
    Data will persist during your session but may be reset between deployments. 
    Please use the backup/export features regularly to save your data permanently.
    """)

# Main header
st.markdown('<div class="main-header">💰 Expense Tracker Pro</div>', unsafe_allow_html=True)

# Sidebar navigation
st.sidebar.title("📊 Navigation")
page = st.sidebar.selectbox(
    "Choose a page:",
    ["🏠 Dashboard", "➕ Add Expense", "🧮 Calculator", "📈 Analytics", "📋 Summary Report", "⚙️ Settings"]
)

# Dashboard Page
if page == "🏠 Dashboard":
    st.title("📊 Dashboard")
    
    # Quick stats
    if st.session_state.expenses:
        df = pd.DataFrame(st.session_state.expenses)
        df['date'] = pd.to_datetime(df['date'])
        
        total_expenses = df['amount'].sum()
        avg_daily = df.groupby(df['date'].dt.date)['amount'].sum().mean()
        highest_expense = df['amount'].max()
        total_transactions = len(df)
        
        # Metrics in columns
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("💸 Total Expenses", f"₹{total_expenses:,.2f}")
        
        with col2:
            st.metric("📅 Avg Daily", f"₹{avg_daily:,.2f}")
        
        with col3:
            st.metric("🔝 Highest", f"₹{highest_expense:,.2f}")
        
        with col4:
            st.metric("📊 Transactions", total_transactions)
        
        # Create two columns for expenses list and quick chart
        col_left, col_right = st.columns([2, 1])
        
        with col_left:
            # All expenses in a beautiful list
            st.subheader("� All Expenses")
            
            # Filter options
            filter_col1, filter_col2 = st.columns(2)
            with filter_col1:
                selected_categories = st.multiselect(
                    "Filter by Category",
                    options=df['category'].unique(),
                    default=df['category'].unique()[:5] if len(df['category'].unique()) > 5 else df['category'].unique()
                )
            
            with filter_col2:
                days_back = st.selectbox("Show last", [7, 14, 30, 60, 90, 365, "All"], index=2)
            
            # Apply filters
            filtered_df = df[df['category'].isin(selected_categories)]
            
            if days_back != "All":
                cutoff_date = datetime.now().date() - timedelta(days=days_back)
                filtered_df = filtered_df[filtered_df['date'].dt.date >= cutoff_date]
            
            # Sort by date (newest first)
            filtered_df = filtered_df.sort_values('date', ascending=False)
            
            # Display expenses in a beautiful list
            st.markdown(f'<div class="expense-list">', unsafe_allow_html=True)
            
            for _, expense in filtered_df.head(20).iterrows():  # Show top 20
                st.markdown(f"""
                <div class="expense-item">
                    <div>
                        <div class="expense-description">{expense['description']}</div>
                        <div class="expense-category">{expense['category']} • {expense['date'].strftime('%b %d, %Y')}</div>
                    </div>
                    <div class="expense-amount">₹{expense['amount']:,.2f}</div>
                </div>
                """, unsafe_allow_html=True)
            
            if len(filtered_df) > 20:
                st.info(f"Showing 20 of {len(filtered_df)} expenses. Use filters to narrow down.")
            
            st.markdown('</div>', unsafe_allow_html=True)
        
        with col_right:
            # Quick category breakdown
            st.subheader("📊 Quick Stats")
            
            # Category pie chart (small)
            category_totals = filtered_df.groupby('category')['amount'].sum().head(5)
            
            fig_mini = px.pie(
                values=category_totals.values, 
                names=category_totals.index,
                title='Top 5 Categories',
                color_discrete_sequence=px.colors.qualitative.Set3
            )
            fig_mini.update_layout(
                height=300,
                showlegend=False,
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font=dict(color='white', size=10),
                title_font_size=14
            )
            st.plotly_chart(fig_mini, use_container_width=True)
            
            # Weekly spending trend (mini)
            weekly_data = filtered_df.groupby(filtered_df['date'].dt.date)['amount'].sum().tail(7)
            
            fig_weekly = px.bar(
                x=weekly_data.index, 
                y=weekly_data.values,
                title='Last 7 Days',
                color=weekly_data.values,
                color_continuous_scale='Viridis'
            )
            fig_weekly.update_layout(
                height=250,
                showlegend=False,
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font=dict(color='white', size=10),
                title_font_size=14,
                xaxis_title="",
                yaxis_title="Amount"
            )
            st.plotly_chart(fig_weekly, use_container_width=True)
        
        # Main trend chart at bottom
        st.subheader("📈 Spending Trend")
        daily_expenses = df.groupby(df['date'].dt.date)['amount'].sum().reset_index()
        daily_expenses.columns = ['Date', 'Amount']
        
        fig = px.area(daily_expenses, x='Date', y='Amount', 
                     title='Daily Expense Trend',
                     color_discrete_sequence=['#00d4aa'])
        fig.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color='white'),
            title_font_size=18,
            height=400
        )
        fig.update_traces(fill='tonexty', fillcolor='rgba(0, 212, 170, 0.3)')
        st.plotly_chart(fig, use_container_width=True)
        
    else:
        st.markdown("""
        <div style="text-align: center; padding: 3rem;">
            <h2 style="color: white; margin-bottom: 1rem;">👋 Welcome to Expense Tracker Pro!</h2>
            <p style="color: rgba(255,255,255,0.8); font-size: 1.2rem;">Start by adding your first expense or try the calculator.</p>
        </div>
        """, unsafe_allow_html=True)
        st.balloons()

# Add Expense Page
elif page == "➕ Add Expense":
    st.title("➕ Add New Expense")
    
    with st.form("expense_form"):
        col1, col2 = st.columns(2)
        
        with col1:
            # Check if there's a quick add amount from calculator
            default_amount = getattr(st.session_state, 'quick_add_amount', 0.01)
            amount = st.number_input("💰 Amount (₹)", min_value=0.01, step=0.01, value=default_amount)
            
            # Clear the quick add amount after using it
            if hasattr(st.session_state, 'quick_add_amount'):
                del st.session_state.quick_add_amount
            
            category = st.selectbox(
                "🏷️ Category",
                st.session_state.custom_categories
            )
        
        with col2:
            description = st.text_input("📝 Description")
            date = st.date_input("📅 Date", value=datetime.now().date())
        
        submitted = st.form_submit_button("💾 Add Expense", use_container_width=True)
        
        if submitted:
            if amount > 0 and description:
                new_expense = {
                    'amount': amount,
                    'category': category,
                    'description': description,
                    'date': date.isoformat(),
                    'timestamp': datetime.now().isoformat()
                }
                st.session_state.expenses.append(new_expense)
                save_data()
                st.success(f"✅ Added expense: ₹{amount:,.2f} for {description}")
                st.balloons()
            else:
                st.error("❌ Please fill in all fields with valid values.")
    
    # Quick suggestion section
    st.markdown("---")
    st.subheader("💡 Quick Suggestions")
    
    # Show common expense amounts
    common_amounts = [50, 100, 200, 500, 1000, 2000]
    amount_cols = st.columns(6)
    
    for i, amt in enumerate(common_amounts):
        with amount_cols[i]:
            if st.button(f"₹{amt}", key=f"quick_{amt}", use_container_width=True):
                st.session_state.quick_add_amount = amt
                st.experimental_rerun()
    
    # Calculator integration tip
    st.info("💡 **Tip**: Use the Calculator page to compute amounts, then click 'Add as Expense' to quickly transfer the amount here!")

# Calculator Page
elif page == "🧮 Calculator":
    st.title("🧮 Apple-Style Calculator")
    
    # Calculator functions
    def clear_all():
        st.session_state.calculator_display = "0"
        st.session_state.calculator_previous = 0
        st.session_state.calculator_operation = None
        st.session_state.calculator_should_clear = False
        st.session_state.calculator_decimal_added = False
    
    def add_digit(digit):
        if st.session_state.calculator_display == "0" or getattr(st.session_state, 'calculator_should_clear', False):
            st.session_state.calculator_display = str(digit)
            st.session_state.calculator_should_clear = False
        else:
            st.session_state.calculator_display += str(digit)
    
    def add_decimal():
        if not getattr(st.session_state, 'calculator_decimal_added', False):
            if getattr(st.session_state, 'calculator_should_clear', False):
                st.session_state.calculator_display = "0."
                st.session_state.calculator_should_clear = False
            else:
                st.session_state.calculator_display += "."
            st.session_state.calculator_decimal_added = True
    
    def set_operation(op):
        try:
            st.session_state.calculator_previous = float(st.session_state.calculator_display)
            st.session_state.calculator_operation = op
            st.session_state.calculator_should_clear = True
            st.session_state.calculator_decimal_added = False
        except:
            pass
    
    def calculate_result():
        try:
            current = float(st.session_state.calculator_display)
            previous = st.session_state.calculator_previous
            op = st.session_state.calculator_operation
            
            if op == "+":
                result = previous + current
            elif op == "-":
                result = previous - current
            elif op == "×":
                result = previous * current
            elif op == "÷":
                if current != 0:
                    result = previous / current
                else:
                    st.session_state.calculator_display = "Error"
                    return
            else:
                return
            
            # Format result
            if result == int(result):
                st.session_state.calculator_display = str(int(result))
            else:
                st.session_state.calculator_display = f"{result:.10g}"
            
            st.session_state.calculator_operation = None
            st.session_state.calculator_should_clear = True
            st.session_state.calculator_decimal_added = False
        except:
            st.session_state.calculator_display = "Error"
    
    def toggle_sign():
        try:
            current = float(st.session_state.calculator_display)
            result = -current
            if result == int(result):
                st.session_state.calculator_display = str(int(result))
            else:
                st.session_state.calculator_display = f"{result:.10g}"
        except:
            pass
    
    def calculate_percentage():
        try:
            current = float(st.session_state.calculator_display)
            result = current / 100
            if result == int(result):
                st.session_state.calculator_display = str(int(result))
            else:
                st.session_state.calculator_display = f"{result:.10g}"
        except:
            pass
    
    # Initialize session state variables if not exist
    if 'calculator_should_clear' not in st.session_state:
        st.session_state.calculator_should_clear = False
    if 'calculator_decimal_added' not in st.session_state:
        st.session_state.calculator_decimal_added = False
    
    # Calculator UI
    st.markdown(f"""
    <div class="calculator-container">
        <div class="calculator-display">{st.session_state.calculator_display}</div>
    </div>
    """, unsafe_allow_html=True)
    
    # Create calculator layout with proper spacing
    col_spacer1, col_calc, col_spacer2 = st.columns([1, 2, 1])
    
    with col_calc:
        # Row 1: AC, ±, %, ÷
        row1_col1, row1_col2, row1_col3, row1_col4 = st.columns(4)
        with row1_col1:
            if st.button("AC", key="ac", help="All Clear"):
                clear_all()
        with row1_col2:
            if st.button("±", key="plus_minus", help="Toggle Sign"):
                toggle_sign()
        with row1_col3:
            if st.button("%", key="percent", help="Percentage"):
                calculate_percentage()
        with row1_col4:
            if st.button("÷", key="divide", help="Divide"):
                set_operation("÷")
        
        # Row 2: 7, 8, 9, ×
        row2_col1, row2_col2, row2_col3, row2_col4 = st.columns(4)
        with row2_col1:
            if st.button("7", key="7"):
                add_digit("7")
        with row2_col2:
            if st.button("8", key="8"):
                add_digit("8")
        with row2_col3:
            if st.button("9", key="9"):
                add_digit("9")
        with row2_col4:
            if st.button("×", key="multiply", help="Multiply"):
                set_operation("×")
        
        # Row 3: 4, 5, 6, −
        row3_col1, row3_col2, row3_col3, row3_col4 = st.columns(4)
        with row3_col1:
            if st.button("4", key="4"):
                add_digit("4")
        with row3_col2:
            if st.button("5", key="5"):
                add_digit("5")
        with row3_col3:
            if st.button("6", key="6"):
                add_digit("6")
        with row3_col4:
            if st.button("−", key="subtract", help="Subtract"):
                set_operation("-")
        
        # Row 4: 1, 2, 3, +
        row4_col1, row4_col2, row4_col3, row4_col4 = st.columns(4)
        with row4_col1:
            if st.button("1", key="1"):
                add_digit("1")
        with row4_col2:
            if st.button("2", key="2"):
                add_digit("2")
        with row4_col3:
            if st.button("3", key="3"):
                add_digit("3")
        with row4_col4:
            if st.button("+", key="add", help="Add"):
                set_operation("+")
        
        # Row 5: 0 (wide), ., =
        row5_col1, row5_col2, row5_col3 = st.columns([2, 1, 1])
        with row5_col1:
            if st.button("0", key="0"):
                add_digit("0")
        with row5_col2:
            if st.button(".", key="decimal", help="Decimal Point"):
                add_decimal()
        with row5_col3:
            if st.button("=", key="equals", help="Calculate"):
                calculate_result()
    
    # Quick actions section
    st.markdown("---")
    st.subheader("⚡ Quick Actions")
    
    quick_col1, quick_col2 = st.columns(2)
    
    with quick_col1:
        if st.button("📝 Add as Expense", use_container_width=True):
            try:
                amount = float(st.session_state.calculator_display)
                if amount > 0:
                    # Store the amount in session state for the add expense page
                    st.session_state.quick_add_amount = amount
                    st.success(f"Amount ₹{amount:,.2f} ready to be added as expense!")
                    st.info("Go to 'Add Expense' page to complete the entry.")
                else:
                    st.warning("Please enter a positive amount.")
            except:
                st.error("Please enter a valid number first.")
    
    with quick_col2:
        if st.button("🧹 Clear All", use_container_width=True):
            clear_all()
            st.success("Calculator cleared!")
    
    # Usage tips
    st.markdown("""
    <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 12px; margin-top: 1rem;">
        <h4 style="color: white; margin-bottom: 0.5rem;">💡 Calculator Tips:</h4>
        <ul style="color: rgba(255,255,255,0.8); margin: 0;">
            <li>AC: Clear all calculations</li>
            <li>±: Change positive/negative sign</li>
            <li>%: Convert to percentage (divide by 100)</li>
            <li>Use 'Add as Expense' to quickly create an expense entry</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

# Analytics Page
elif page == "📈 Analytics":
    st.title("📈 Expense Analytics")
    
    if st.session_state.expenses:
        df = pd.DataFrame(st.session_state.expenses)
        df['date'] = pd.to_datetime(df['date'])
        df['month'] = df['date'].dt.to_period('M')
        
        # Time period filter
        col1, col2 = st.columns(2)
        with col1:
            start_date = st.date_input("📅 Start Date", 
                                     value=df['date'].min().date())
        with col2:
            end_date = st.date_input("📅 End Date", 
                                   value=df['date'].max().date())
        
        # Filter data
        mask = (df['date'].dt.date >= start_date) & (df['date'].dt.date <= end_date)
        filtered_df = df.loc[mask]
        
        if not filtered_df.empty:
            # Category-wise expenses (Pie Chart)
            st.subheader("🥧 Expenses by Category")
            category_expenses = filtered_df.groupby('category')['amount'].sum().reset_index()
            
            fig_pie = px.pie(category_expenses, values='amount', names='category',
                           title='Expense Distribution by Category',
                           color_discrete_sequence=px.colors.qualitative.Set3)
            fig_pie.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font=dict(color='white'),
                title_font_size=18,
                height=500
            )
            fig_pie.update_traces(
                textposition='inside', 
                textinfo='percent+label',
                hovertemplate='<b>%{label}</b><br>Amount: ₹%{value:,.2f}<br>Percentage: %{percent}<extra></extra>'
            )
            st.plotly_chart(fig_pie, use_container_width=True)
            
            # Monthly trends
            st.subheader("📊 Monthly Expense Trends")
            monthly_expenses = filtered_df.groupby('month')['amount'].sum().reset_index()
            monthly_expenses['month_str'] = monthly_expenses['month'].astype(str)
            
            fig_bar = px.bar(monthly_expenses, x='month_str', y='amount',
                           title='Monthly Expense Trends',
                           color='amount',
                           color_continuous_scale='Viridis')
            fig_bar.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font=dict(color='white'),
                title_font_size=18,
                xaxis_title='Month',
                yaxis_title='Amount (₹)',
                height=400
            )
            fig_bar.update_traces(
                hovertemplate='<b>%{x}</b><br>Total: ₹%{y:,.2f}<extra></extra>'
            )
            st.plotly_chart(fig_bar, use_container_width=True)
            
            # Top expenses
            st.subheader("🔝 Highest Expenses")
            top_expenses = filtered_df.nlargest(10, 'amount')[['description', 'category', 'amount', 'date']]
            top_expenses['amount'] = top_expenses['amount'].apply(lambda x: f"₹{x:,.2f}")
            top_expenses['date'] = top_expenses['date'].dt.strftime('%Y-%m-%d')
            st.dataframe(top_expenses, use_container_width=True)
            
            # Category comparison
            st.subheader("📈 Category Comparison")
            fig_cat = px.box(filtered_df, x='category', y='amount',
                           title='Expense Distribution by Category')
            fig_cat.update_xaxes(tickangle=45)
            fig_cat.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font=dict(color='white'),
                title_font_size=18,
                height=500
            )
            fig_cat.update_traces(
                marker_color='#00d4aa',
                hovertemplate='<b>%{x}</b><br>Amount: ₹%{y:,.2f}<extra></extra>'
            )
            st.plotly_chart(fig_cat, use_container_width=True)
            
        else:
            st.warning("⚠️ No data found for the selected date range.")
    else:
        st.info("📝 No expenses recorded yet. Add some expenses to see analytics.")

# Summary Report Page
elif page == "📋 Summary Report":
    st.title("📋 Comprehensive Summary Report")
    
    if st.session_state.expenses:
        df = pd.DataFrame(st.session_state.expenses)
        df['date'] = pd.to_datetime(df['date'])
        
        # Report period selection
        report_period = st.selectbox(
            "📅 Select Report Period",
            ["Last 7 Days", "Last 30 Days", "Last 3 Months", "Last 6 Months", "All Time"]
        )
        
        # Filter data based on period
        today = datetime.now().date()
        if report_period == "Last 7 Days":
            start_date = today - timedelta(days=7)
        elif report_period == "Last 30 Days":
            start_date = today - timedelta(days=30)
        elif report_period == "Last 3 Months":
            start_date = today - timedelta(days=90)
        elif report_period == "Last 6 Months":
            start_date = today - timedelta(days=180)
        else:
            start_date = df['date'].min().date()
        
        mask = df['date'].dt.date >= start_date
        period_df = df.loc[mask]
        
        if not period_df.empty:
            # Summary statistics
            st.subheader(f"📊 Summary for {report_period}")
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                total_spent = period_df['amount'].sum()
                st.metric("💸 Total Spent", f"₹{total_spent:,.2f}")
                
                avg_transaction = period_df['amount'].mean()
                st.metric("📊 Avg Transaction", f"₹{avg_transaction:,.2f}")
            
            with col2:
                num_transactions = len(period_df)
                st.metric("🔢 Total Transactions", num_transactions)
                
                days_with_expenses = period_df['date'].dt.date.nunique()
                st.metric("📅 Active Days", days_with_expenses)
            
            with col3:
                highest_day = period_df.groupby(period_df['date'].dt.date)['amount'].sum().max()
                st.metric("📈 Highest Day", f"₹{highest_day:,.2f}")
                
                avg_daily = total_spent / max(1, (today - start_date).days)
                st.metric("📊 Avg Daily", f"₹{avg_daily:,.2f}")
            
            # Category breakdown
            st.subheader("🏷️ Category Breakdown")
            category_summary = period_df.groupby('category').agg({
                'amount': ['sum', 'count', 'mean']
            }).round(2)
            category_summary.columns = ['Total (₹)', 'Count', 'Average (₹)']
            category_summary = category_summary.sort_values('Total (₹)', ascending=False)
            
            # Add percentage
            category_summary['Percentage'] = (category_summary['Total (₹)'] / total_spent * 100).round(1)
            category_summary['Percentage'] = category_summary['Percentage'].astype(str) + '%'
            
            st.dataframe(category_summary, use_container_width=True)
            
            # Spending patterns
            st.subheader("📈 Spending Patterns")
            
            # Day of week analysis
            period_df['day_of_week'] = period_df['date'].dt.day_name()
            day_spending = period_df.groupby('day_of_week')['amount'].sum().reindex([
                'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
            ])
            
            fig_dow = px.bar(x=day_spending.index, y=day_spending.values,
                           title='Spending by Day of Week',
                           labels={'x': 'Day', 'y': 'Amount (₹)'},
                           color=day_spending.values,
                           color_continuous_scale='Viridis')
            fig_dow.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)'
            )
            st.plotly_chart(fig_dow, use_container_width=True)
            
            # Export options
            st.subheader("📤 Export Options")
            
            if st.button("📊 Generate Excel Report", use_container_width=True):
                # Create Excel file
                excel_filename = f"expense_report_{report_period.replace(' ', '_')}_{today}.xlsx"
                
                with pd.ExcelWriter(excel_filename, engine='openpyxl') as writer:
                    period_df.to_excel(writer, sheet_name='Raw Data', index=False)
                    category_summary.to_excel(writer, sheet_name='Category Summary')
                    day_spending.to_excel(writer, sheet_name='Day of Week')
                
                st.success(f"✅ Excel report generated: {excel_filename}")
                
                # Provide download link
                with open(excel_filename, 'rb') as f:
                    st.download_button(
                        label="⬇️ Download Excel Report",
                        data=f.read(),
                        file_name=excel_filename,
                        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    )
            
            # Insights and recommendations
            st.subheader("💡 Insights & Recommendations")
            
            insights = []
            
            # Top spending category
            top_category = category_summary.index[0]
            top_amount = category_summary.iloc[0]['Total (₹)']
            top_percentage = category_summary.iloc[0]['Percentage']
            insights.append(f"🔍 Your highest spending category is **{top_category}** with ₹{top_amount:,.2f} ({top_percentage})")
            
            # Spending frequency
            if avg_daily > avg_transaction:
                insights.append("📊 You tend to make multiple smaller transactions rather than fewer large ones.")
            else:
                insights.append("📊 You tend to make fewer but larger transactions.")
            
            # Day of week pattern
            highest_day = day_spending.idxmax()
            insights.append(f"📅 You spend the most on **{highest_day}s** with an average of ₹{day_spending[highest_day]:,.2f}")
            
            # Budget recommendation
            monthly_avg = total_spent / max(1, (today - start_date).days) * 30
            insights.append(f"💰 Based on current trends, your monthly expense projection is ₹{monthly_avg:,.2f}")
            
            for insight in insights:
                st.info(insight)
                
        else:
            st.warning("⚠️ No expenses found for the selected period.")
    else:
        st.info("📝 No expenses recorded yet. Add some expenses to generate a report.")

# Settings Page
elif page == "⚙️ Settings":
    st.title("⚙️ Settings")
    
    # Create tabs for different settings sections
    tab1, tab2, tab3 = st.tabs(["🏷️ Categories", "🗑️ Data Management", "📊 App Info"])
    
    with tab1:
        st.subheader("🏷️ Manage Categories")
        st.markdown("Customize your expense categories to match your spending habits.")
        
        # Current categories
        st.markdown("### Current Categories")
        
        col1, col2 = st.columns([3, 1])
        
        with col1:
            # Display current categories in a nice grid
            categories_per_row = 3
            categories = st.session_state.custom_categories
            
            for i in range(0, len(categories), categories_per_row):
                cols = st.columns(categories_per_row)
                for j, col in enumerate(cols):
                    if i + j < len(categories):
                        with col:
                            category = categories[i + j]
                            # Create a delete button for each category (except if it's the last one)
                            if len(categories) > 1:
                                if st.button(f"❌ {category}", key=f"delete_{i+j}", help="Delete this category"):
                                    st.session_state.custom_categories.remove(category)
                                    save_data()  # Save changes
                                    st.rerun()
                            else:
                                st.markdown(f"🔒 {category} (minimum 1 category required)")
        
        with col2:
            st.markdown("### Quick Actions")
            if st.button("🔄 Reset to Default", help="Reset to original categories"):
                st.session_state.custom_categories = [
                    "🍔 Food & Dining", "🚗 Transportation", "🛒 Shopping", 
                    "🏠 Bills & Utilities", "🎬 Entertainment", "🏥 Healthcare",
                    "📚 Education", "💼 Business", "👕 Clothing", "🎁 Gifts",
                    "🏖️ Travel", "💳 Banking", "🔧 Maintenance", "📱 Technology",
                    "🏃 Fitness", "🎨 Hobbies", "📰 Subscriptions", "🔄 Other"
                ]
                save_data()
                st.success("✅ Categories reset to default!")
                st.rerun()
        
        # Add new category
        st.markdown("### Add New Category")
        
        with st.form("add_category_form"):
            col1, col2 = st.columns([3, 1])
            
            with col1:
                new_category = st.text_input("Category Name", placeholder="e.g., 🎮 Gaming")
            
            with col2:
                submitted = st.form_submit_button("➕ Add", use_container_width=True)
            
            if submitted and new_category:
                if new_category not in st.session_state.custom_categories:
                    st.session_state.custom_categories.append(new_category)
                    save_data()
                    st.success(f"✅ Added category: {new_category}")
                    st.rerun()
                else:
                    st.error("❌ Category already exists!")
            elif submitted:
                st.error("❌ Please enter a category name!")
        
        # Preset category suggestions
        st.markdown("### Quick Add Suggestions")
        preset_categories = [
            "🎮 Gaming", "🚕 Ride Sharing", "🍕 Takeout", "💊 Pharmacy", 
            "🎪 Events", "🧽 Cleaning", "🎂 Celebrations", "📦 Delivery",
            "🏺 Antiques", "🌱 Gardening", "🎯 Sports", "🧘 Wellness"
        ]
        
        # Show preset categories that aren't already added
        available_presets = [cat for cat in preset_categories if cat not in st.session_state.custom_categories]
        
        if available_presets:
            cols = st.columns(4)
            for i, preset in enumerate(available_presets[:8]):  # Show max 8
                with cols[i % 4]:
                    if st.button(f"➕ {preset}", key=f"preset_{i}"):
                        st.session_state.custom_categories.append(preset)
                        save_data()
                        st.success(f"✅ Added {preset}")
                        st.rerun()
        else:
            st.info("🎉 You've added all our preset categories!")
    
    with tab2:
        st.subheader("🗑️ Data Management")
        st.markdown("Manage your expense data and application settings.")
        
        # Data overview
        if st.session_state.expenses:
            df = pd.DataFrame(st.session_state.expenses)
            total_expenses = len(df)
            total_amount = df['amount'].sum()
            date_range = f"{df['date'].min()} to {df['date'].max()}"
            
            # Data summary in metrics
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("📊 Total Expenses", total_expenses)
            with col2:
                st.metric("💰 Total Amount", f"₹{total_amount:,.2f}")
            with col3:
                st.metric("📅 Date Range", date_range)
        else:
            st.info("📭 No expense data found.")
        
        st.markdown("---")
        
        # Export section
        st.markdown("### 📤 Export Data")
        
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("📊 Export CSV", use_container_width=True):
                if st.session_state.expenses:
                    df = pd.DataFrame(st.session_state.expenses)
                    csv = df.to_csv(index=False)
                    st.download_button(
                        label="💾 Download CSV File",
                        data=csv,
                        file_name=f"expenses_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                        mime="text/csv",
                        use_container_width=True
                    )
                else:
                    st.warning("No data to export!")
        
        with col2:
            if st.button("📋 Export JSON", use_container_width=True):
                if st.session_state.expenses:
                    data = {'expenses': st.session_state.expenses}
                    json_str = json.dumps(data, indent=2)
                    st.download_button(
                        label="💾 Download JSON File",
                        data=json_str,
                        file_name=f"expenses_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                        mime="application/json",
                        use_container_width=True
                    )
                else:
                    st.warning("No data to export!")
        
        st.markdown("### 📥 Import Data")
        
        uploaded_file = st.file_uploader("Choose a file to import", type=['csv', 'json'])
        
        if uploaded_file is not None:
            col1, col2 = st.columns(2)
            
            with col1:
                if st.button("🔄 Replace All Data", use_container_width=True):
                    try:
                        if uploaded_file.name.endswith('.csv'):
                            df = pd.read_csv(uploaded_file, encoding='utf-8')
                            required_columns = ['amount', 'category', 'description', 'date', 'timestamp']
                            if all(col in df.columns for col in required_columns):
                                st.session_state.expenses = df.to_dict('records')
                                save_data()
                                st.success(f"✅ Imported {len(df)} expenses from CSV!")
                                st.rerun()
                            else:
                                st.error("❌ Invalid CSV format. Required columns: amount, category, description, date, timestamp")
                        else:  # JSON
                            data = json.load(uploaded_file)
                            if 'expenses' in data:
                                st.session_state.expenses = data['expenses']
                                save_data()
                                st.success(f"✅ Imported {len(data['expenses'])} expenses from JSON!")
                                st.rerun()
                            else:
                                st.error("❌ Invalid JSON format. Expected {'expenses': [...]}")
                    except Exception as e:
                        st.error(f"❌ Error importing file: {e}")
            
            with col2:
                if st.button("➕ Merge with Existing", use_container_width=True):
                    try:
                        if uploaded_file.name.endswith('.csv'):
                            df = pd.read_csv(uploaded_file, encoding='utf-8')
                            required_columns = ['amount', 'category', 'description', 'date', 'timestamp']
                            if all(col in df.columns for col in required_columns):
                                new_expenses = df.to_dict('records')
                                st.session_state.expenses.extend(new_expenses)
                                save_data()
                                st.success(f"✅ Merged {len(new_expenses)} expenses from CSV!")
                                st.rerun()
                            else:
                                st.error("❌ Invalid CSV format. Required columns: amount, category, description, date, timestamp")
                        else:  # JSON
                            data = json.load(uploaded_file)
                            if 'expenses' in data:
                                st.session_state.expenses.extend(data['expenses'])
                                save_data()
                                st.success(f"✅ Merged {len(data['expenses'])} expenses from JSON!")
                                st.rerun()
                            else:
                                st.error("❌ Invalid JSON format. Expected {'expenses': [...]}")
                    except Exception as e:
                        st.error(f"❌ Error merging file: {e}")
        
        st.markdown("---")
        
        # Backup section
        st.markdown("### 💾 Create Backup")
        
        if st.button("📦 Create Full Backup", use_container_width=True):
            if st.session_state.expenses:
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                
                # Create backup files
                df = pd.DataFrame(st.session_state.expenses)
                csv_backup = df.to_csv(index=False)
                json_backup = json.dumps({'expenses': st.session_state.expenses}, indent=2)
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.download_button(
                        label="💾 Download CSV Backup",
                        data=csv_backup,
                        file_name=f"expense_backup_{timestamp}.csv",
                        mime="text/csv",
                        use_container_width=True
                    )
                
                with col2:
                    st.download_button(
                        label="💾 Download JSON Backup",
                        data=json_backup,
                        file_name=f"expense_backup_{timestamp}.json",
                        mime="application/json",
                        use_container_width=True
                    )
                
                st.success("✅ Backup files ready for download!")
            else:
                st.warning("📭 No data to backup!")
        
        st.markdown("---")
        
        # Danger zone
        st.markdown("### ⚠️ Danger Zone")
        
        st.warning("⚠️ **Careful!** These actions cannot be undone.")
        
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("🧹 Clear All Expenses", use_container_width=True, type="secondary"):
                if st.session_state.expenses:
                    # Create automatic backup before clearing
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    df = pd.DataFrame(st.session_state.expenses)
                    backup_csv = df.to_csv(index=False)
                    
                    # Save backup file
                    backup_filename = f"auto_backup_before_clear_{timestamp}.csv"
                    with open(backup_filename, 'w', encoding='utf-8') as f:
                        f.write(backup_csv)
                    
                    # Clear expenses
                    st.session_state.expenses = []
                    save_data()
                    
                    st.success(f"✅ All expenses cleared! Backup saved as: {backup_filename}")
                    st.rerun()
                else:
                    st.info("📭 No expenses to clear!")
        
        with col2:
            if st.button("🔄 Reset Everything", use_container_width=True, type="secondary"):
                if st.session_state.expenses or len(st.session_state.custom_categories) != 18:
                    # Create backup
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    if st.session_state.expenses:
                        df = pd.DataFrame(st.session_state.expenses)
                        backup_csv = df.to_csv(index=False)
                        backup_filename = f"auto_backup_before_reset_{timestamp}.csv"
                        with open(backup_filename, 'w', encoding='utf-8') as f:
                            f.write(backup_csv)
                    
                    # Reset everything
                    st.session_state.expenses = []
                    st.session_state.custom_categories = [
                        "🍔 Food & Dining", "🚗 Transportation", "🛒 Shopping", 
                        "🏠 Bills & Utilities", "🎬 Entertainment", "🏥 Healthcare",
                        "📚 Education", "💼 Business", "👕 Clothing", "🎁 Gifts",
                        "🏖️ Travel", "💳 Banking", "🔧 Maintenance", "📱 Technology",
                        "🏃 Fitness", "🎨 Hobbies", "📰 Subscriptions", "🔄 Other"
                    ]
                    save_data()
                    
                    st.success("✅ Everything reset to defaults! Backup created if you had data.")
                    st.rerun()
                else:
                    st.info("📭 Nothing to reset!")
    
    with tab3:
        st.subheader("📊 App Information")
        
        # App statistics
        st.markdown("### 📈 Usage Statistics")
        
        if st.session_state.expenses:
            df = pd.DataFrame(st.session_state.expenses)
            
            # Calculate various stats
            total_transactions = len(df)
            total_amount = df['amount'].sum()
            avg_transaction = df['amount'].mean()
            categories_used = df['category'].nunique()
            date_range_days = (pd.to_datetime(df['date']).max() - pd.to_datetime(df['date']).min()).days + 1;
            
            # Display stats in columns
            col1, col2 = st.columns(2)
            
            with col1:
                st.metric("📊 Total Transactions", f"{total_transactions:,}")
                st.metric("💰 Total Amount", f"₹{total_amount:,.2f}")
                st.metric("📊 Average Transaction", f"₹{avg_transaction:.2f}")
            
            with col2:
                st.metric("🏷️ Categories Used", f"{categories_used}")
                st.metric("📅 Days Tracked", f"{date_range_days}")
                st.metric("📈 Daily Average", f"₹{total_amount/max(date_range_days, 1):.2f}")
            
            # Category usage chart
            st.markdown("### 📊 Category Usage")
            category_counts = df['category'].value_counts()
            
            fig = px.bar(
                x=category_counts.values,
                y=category_counts.index,
                orientation='h',
                title='Transactions by Category',
                labels={'x': 'Number of Transactions', 'y': 'Category'},
                color=category_counts.values,
                color_continuous_scale='Viridis'
            )
            fig.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font=dict(color='white'),
                height=400
            )
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("📭 No data available for statistics.")
        
        st.markdown("---")
        
        # App info
        st.markdown("### ℹ️ About Expense Tracker Pro")
        
        st.markdown("""
        <div style="background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); 
                    border-radius: 12px; padding: 1.5rem; margin: 1rem 0;">
            <h4 style="color: var(--success-color); margin-bottom: 1rem;">💰 Expense Tracker Pro</h4>
            <div style="color: rgba(255,255,255,0.9); line-height: 1.8;">
                <p><strong>📱 Version:</strong> 2.0.0 - Enhanced with Settings</p>
                <p><strong>🎯 Purpose:</strong> Modern expense tracking with Apple-style calculator</p>
                <p><strong>🔧 Built with:</strong> Streamlit, Pandas, Plotly</p>
                <p><strong>💾 Storage:</strong> Local CSV files for data persistence</p>
                <p><strong>🎨 Design:</strong> Mobile-first with glass-morphism effects</p>
                <p><strong>🔒 Privacy:</strong> All data stays on your device</p>
                <br>
                <p><em>🌟 Features include: Apple calculator, custom categories, advanced analytics, 
                CSV/JSON import/export, mobile responsiveness, and beautiful visualizations!</em></p>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        # Data file info
        st.markdown("### 📁 Data Storage Information")
        
        col1, col2 = st.columns(2)
        
        with col1:
            csv_exists = os.path.exists(CSV_DATA_FILE)
            st.metric("📊 CSV File", "✅ Exists" if csv_exists else "❌ Missing")
            if csv_exists:
                try:
                    file_size = os.path.getsize(CSV_DATA_FILE)
                    st.caption(f"Size: {file_size:,} bytes")
                except:
                    st.caption("Size: Unknown")
        
        with col2:
            json_exists = os.path.exists(JSON_DATA_FILE)
            st.metric("📋 JSON Backup", "✅ Exists" if json_exists else "❌ Missing")
            if json_exists:
                try:
                    file_size = os.path.getsize(JSON_DATA_FILE)
                    st.caption(f"Size: {file_size:,} bytes")
                except:
                    st.caption("Size: Unknown")
        
        # Current session info
        st.markdown("### 🖥️ Current Session")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.metric("🏷️ Custom Categories", len(st.session_state.custom_categories))
            st.metric("🧮 Calculator Display", st.session_state.calculator_display)
        
        with col2:
            st.metric("📊 Expenses in Memory", len(st.session_state.expenses))
            st.metric("⏰ Page Load Time", datetime.now().strftime('%H:%M:%S'))

# Footer
st.markdown("---")
st.markdown("""
<div style="background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); 
            border-radius: 12px; padding: 1.5rem; margin: 1rem 0;">
    <h4 style="color: var(--success-color); margin-bottom: 1rem;">💾 Data Persistence Features</h4>
    <div style="color: rgba(255,255,255,0.9); line-height: 1.6;">
        <p><strong>🔒 Automatic Saving:</strong> Your data is automatically saved to <code>expenses_data.csv</code> after every change</p>
        <p><strong>📊 CSV Format:</strong> Primary storage in CSV format for easy data analysis and Excel compatibility</p>
        <p><strong>📋 JSON Backup:</strong> Automatic JSON backup for additional data security</p>
        <p><strong>🔄 Import/Export:</strong> Full CSV import/export capabilities for data migration</p>
        <p><strong>💿 Local Storage:</strong> All data stays on your device - complete privacy protection</p>
    </div>
</div>
""", unsafe_allow_html=True)

# Modern footer with app info
st.markdown("""
<div style="text-align: center; padding: 2rem; margin-top: 3rem; 
            background: var(--glass-bg); backdrop-filter: blur(20px); 
            border: 1px solid var(--glass-border); border-radius: 20px;">
    <div style="color: white; font-size: 1.2rem; margin-bottom: 1rem;">
        � <strong>Expense Tracker Pro</strong> 📊
    </div>
    <div style="color: rgba(255,255,255,0.8); font-size: 0.9rem; line-height: 1.6;">
        🚀 Modern • 📱 Mobile-Optimized • 🧮 Apple-Style Calculator<br>
        Built with ❤️ using Streamlit & Advanced CSS
    </div>
    <div style="margin-top: 1rem; color: rgba(255,255,255,0.6); font-size: 0.8rem;">
        📱 Perfect for mobile browsers • 💻 Works on all devices
    </div>
</div>
""", unsafe_allow_html=True)

# Cloud deployment warning
if is_cloud_deployment():
    st.info("""
    🌐 **Cloud Deployment Notice**: This app is running on Streamlit Cloud. 
    Data will persist during your session but may be reset between deployments. 
    Please use the backup/export features regularly to save your data permanently.
    """)
