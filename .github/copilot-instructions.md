# Copilot Instructions for Expense Tracker Pro

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a modern React.js expense tracker application built with Vite, designed to replace a Streamlit Python application with the same functionality. The application features a glass-morphism design with mobile responsiveness.

## Key Features to Maintain
- **Dashboard**: Metrics display, expense filters, charts, recent expenses list
- **Add Expense**: Form with categories, quick amount buttons, calculator integration
- **Calculator**: Apple-style calculator with direct expense transfer capability
- **Analytics**: Category breakdowns, spending trends, interactive charts
- **Reports**: Summary statistics, export functionality (CSV/TXT), recommendations
- **Settings**: Category management, data import/export, app information

## Technical Stack
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Recharts** for data visualization
- **date-fns** for date manipulation
- **Lucide React** for icons
- **localStorage** for data persistence
- **CSS3** with custom properties for theming

## Design Guidelines
- Use glass-morphism design with backdrop blur effects
- Implement gradient backgrounds and soft shadows
- Ensure mobile-first responsive design
- Use modern color schemes with proper contrast
- Implement smooth animations and transitions
- Follow Apple-style UI patterns for the calculator

## Code Style
- Use functional components with hooks
- Implement proper error handling
- Use consistent naming conventions (camelCase)
- Add proper TypeScript-style JSDoc comments
- Structure components with clear separation of concerns
- Use custom hooks for shared logic

## Data Management
- Store expenses in localStorage with proper backup/restore
- Implement data validation and error handling
- Support CSV import/export functionality
- Maintain data persistence across sessions
- Use React Context for global state management

## Performance Considerations
- Implement proper component memoization where needed
- Use lazy loading for heavy components
- Optimize chart rendering for large datasets
- Implement efficient filtering and sorting
- Use proper key props for list items
