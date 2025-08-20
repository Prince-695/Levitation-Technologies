# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

# MERN Stack PDF Invoice Generator

A full-stack MERN application for generating professional PDF invoices with 18% GST calculation.

## 🚀 Features

### Backend Features
- **User Authentication**: JWT-based registration and login system
- **PDF Generation**: Professional invoice PDFs using Puppeteer
- **MongoDB Integration**: Atlas cloud database with Mongoose ODM
- **Security**: Password hashing with bcryptjs, CORS, Helmet, and rate limiting
- **Validation**: Joi schema validation for all API endpoints
- **Error Handling**: Centralized error handling middleware

### Frontend Features
- **React 19.1.1**: Modern React with TypeScript
- **Authentication Flow**: Login/Register with protected routes
- **Product Management**: Add, edit, delete products with real-time calculations
- **Invoice Generation**: One-click PDF download with professional template
- **Responsive Design**: Clean, user-friendly interface

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js 4.21.2
- **MongoDB Atlas** for cloud database
- **Mongoose** 8.8.4 for ODM
- **JWT** for authentication
- **Puppeteer** 21.11.0 for PDF generation
- **bcryptjs** for password hashing
- **Joi** for validation

### Frontend
- **React** 19.1.1 with TypeScript
- **Vite** for build tool
- **React Router DOM** for navigation
- **Axios** for API calls
- **Context API** for state management

## 📁 Project Structure

```
MERN Stack PDF Generator/
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── config/        # Database and JWT configuration
│   │   ├── controllers/   # Route handlers
│   │   ├── middlewares/   # Auth, validation, error handling
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic (PDF generation)
│   │   └── utils/         # Utility functions
│   ├── templates/         # HTML templates for PDF
│   ├── app.js            # Express app configuration
│   ├── server.js         # Server entry point
│   └── package.json
└── client/               # Frontend React application
    ├── src/
    │   ├── components/   # React components
    │   ├── context/      # Authentication context
    │   ├── services/     # API service layer
    │   ├── types/        # TypeScript interfaces
    │   └── main.tsx      # React entry point
    └── package.json
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v20.19+ recommended)
- pnpm package manager
- MongoDB Atlas account

### Backend Setup

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create `.env` file with:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   ```

4. Start the server:
   ```bash
   node server.js
   ```

Server runs on: http://localhost:5000

### Frontend Setup

1. Navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

Frontend runs on: http://localhost:5173

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Invoices
- `POST /api/invoices/generate-pdf` - Generate and download PDF (protected)
- `GET /api/invoices/history` - Get invoice history (protected)
- `GET /api/invoices/:id` - Get specific invoice (protected)

### Health Check
- `GET /health` - Server health status

## 🧪 Testing the Application

1. **Start both servers** (backend on :5000, frontend on :5173)

2. **Register a new user**:
   - Navigate to http://localhost:5173
   - Click "Register here" 
   - Fill in the registration form

3. **Login**:
   - Use your registered credentials
   - You'll be redirected to the dashboard

4. **Add products**:
   - Click "Add Product"
   - Enter product name, quantity, and rate
   - Product amount calculates automatically

5. **Generate invoice**:
   - Add multiple products
   - View real-time GST (18%) and total calculations
   - Click "Generate Invoice PDF"
   - PDF downloads automatically

## 🔐 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: Frontend and backend route protection
- **CORS Configuration**: Secure cross-origin requests
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Joi schemas for all inputs
- **Environment Variables**: Sensitive data protection

## 📄 PDF Template Features

- **Professional Design**: Levitation branding
- **Company Details**: Complete business information
- **Product Table**: Itemized listing with calculations
- **GST Calculation**: Automatic 18% GST computation
- **Total Summary**: Clear breakdown of charges
- **Auto Invoice Numbers**: Unique invoice numbering

## 🚀 Deployment Ready

- **Environment Variables**: Configured for different environments
- **Error Handling**: Production-ready error responses
- **Database**: Cloud MongoDB Atlas integration
- **Build Process**: Optimized Vite build for frontend
- **CORS**: Configured for production domains

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📧 Contact

For any questions or support, please contact the development team.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
