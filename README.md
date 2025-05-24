# Ranked Voting Site

[![CI](https://github.com/USERNAME/Ranked-Voting-Site/workflows/Continuous%20Integration/badge.svg)](https://github.com/USERNAME/Ranked-Voting-Site/actions/workflows/ci.yml)
[![Backend Tests](https://github.com/USERNAME/Ranked-Voting-Site/workflows/Backend%20Tests/badge.svg)](https://github.com/USERNAME/Ranked-Voting-Site/actions/workflows/backend-tests.yml)
[![Frontend Tests](https://github.com/USERNAME/Ranked-Voting-Site/workflows/Frontend%20Tests/badge.svg)](https://github.com/USERNAME/Ranked-Voting-Site/actions/workflows/frontend-tests.yml)
[![codecov](https://codecov.io/gh/USERNAME/Ranked-Voting-Site/branch/main/graph/badge.svg)](https://codecov.io/gh/USERNAME/Ranked-Voting-Site)

A full-stack web application for conducting ranked choice voting polls with real-time results calculation.

## 🏗️ Architecture

- **Frontend**: React with Vite
- **Backend**: Express.js with MongoDB
- **Testing**: Jest with comprehensive test coverage
- **CI/CD**: GitHub Actions for automated testing and deployment

## 📁 Project Structure

```
Ranked-Voting-Site/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── constants/  # API endpoints and constants
│   │   └── utils/      # Utility functions
│   └── package.json
├── backend/            # Express.js backend API
│   ├── model/          # MongoDB models
│   ├── __tests__/      # Jest test suite
│   └── package.json
└── .github/
    └── workflows/      # CI/CD workflows
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (for production) or MongoDB Memory Server (for testing)

### Backend Setup
```bash
cd backend
npm install
npm run dev          # Development with auto-reload
npm start           # Production
npm test            # Run tests
npm run test:coverage # Run tests with coverage
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev         # Development server
npm run build       # Production build
npm run lint        # Code linting
```

## 🔄 Voting System

The application implements **Ranked Choice Voting (RCV)**:

1. **Poll Creation**: Create polls with multiple choices
2. **Voting**: Users rank choices in order of preference
3. **Results Calculation**: 
   - If a choice has >50% first-preference votes → Winner
   - Otherwise, eliminate lowest vote-getter and redistribute votes
   - Repeat until a majority winner is found

## 🧪 Testing

### Backend Tests (44 tests)
- **Unit Tests**: Voting algorithm functions
- **API Tests**: All endpoints with success/error cases
- **Model Tests**: Database operations and validation
- **Integration Tests**: Complete poll lifecycle

```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Frontend Tests
- **Linting**: ESLint for code quality
- **Build Tests**: Ensure production builds work

```bash
cd frontend
npm run lint          # Code linting
npm run build         # Build verification
```

## 🔧 CI/CD Pipeline

Automated workflows run on **push** and **pull requests** to `main` and `dev` branches:

### Backend Tests Workflow
- ✅ Runs Jest test suite (44 tests)
- ✅ Generates coverage reports
- ✅ Tests on Node.js 18.x and 20.x
- ✅ Uploads coverage to Codecov

### Frontend Tests Workflow  
- ✅ Runs ESLint code quality checks
- ✅ Verifies production build
- ✅ Tests on Node.js 18.x and 20.x

### Comprehensive CI Workflow
- ✅ **Backend Tests**: Full test suite with coverage
- ✅ **Frontend Tests**: Linting and build verification
- ✅ **Security Audit**: Dependency vulnerability scanning
- ✅ **Integration Tests**: End-to-end functionality
- ✅ **Deployment Check**: Ready-for-production validation

### Workflow Files
- `.github/workflows/backend-tests.yml` - Backend-specific testing
- `.github/workflows/frontend-tests.yml` - Frontend-specific testing  
- `.github/workflows/ci.yml` - Comprehensive CI pipeline

## 📊 Test Coverage

Current backend test coverage:
- **44 tests passing**
- **100% coverage** on database models
- **Comprehensive API testing** with error scenarios
- **Complete voting algorithm coverage**

## 🛠️ Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes** 
   - Write code with tests
   - Ensure linting passes

3. **Test Locally**
   ```bash
   cd backend && npm test
   cd frontend && npm run lint && npm run build
   ```

4. **Push Changes**
   ```bash
   git push origin feature/new-feature
   ```

5. **Create Pull Request**
   - CI/CD automatically runs all tests
   - Code review and approval required
   - Merge to `dev` → `main` for deployment

## 🔐 Environment Variables

Backend requires:
```bash
# environment.js
export const env = {
    uri: "your_mongodb_connection_string"
};
```

## 📈 API Endpoints

- `GET /` - Health check
- `POST /create` - Create new poll
- `GET /poll?pollId=ID` - Get poll details
- `POST /vote` - Submit ranked vote
- `GET /votes?pollId=ID` - Get poll results

## 🎯 Features

- ✅ **Poll Creation**: Custom choices and unique poll IDs
- ✅ **Ranked Voting**: Drag-and-drop vote ranking
- ✅ **Real-time Results**: Instant winner calculation
- ✅ **Validation**: Comprehensive input validation
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Responsive Design**: Works on all devices

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all CI checks pass
5. Submit a pull request

## 📄 License

[Add your license here]
