# Deploy to Vercel

This project is configured for easy deployment to Vercel.

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/expense-tracker-pro)

## Manual Deployment

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

## Environment Variables

No environment variables are required for basic functionality. The app uses localStorage for data persistence.

## Build Configuration

- **Framework**: Vite + React
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Performance Features

- ✅ Code splitting for optimal loading
- ✅ Asset optimization
- ✅ Progressive Web App ready
- ✅ Modern browser targeting
- ✅ Minimal bundle size

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Features Included

- 📊 Expense tracking and analytics
- 🎨 Glass-morphism design
- 🌙 Dark/Light theme toggle
- 📱 Mobile responsive
- 💾 Local data persistence
- 📈 Interactive charts
- 🧮 Built-in calculator
- 📋 CSV export/import

## Production URL

Once deployed, your app will be available at:
`https://your-project-name.vercel.app`
