# Backend Test Suite

This directory contains a comprehensive Jest test suite for the ranked voting backend API.

## Test Structure

### Test Files

- **`__tests__/setup.js`** - Test database setup utilities using MongoDB Memory Server
- **`__tests__/utils.test.js`** - Unit tests for utility functions (voting logic)
- **`__tests__/api.test.js`** - Integration tests for all API endpoints
- **`__tests__/models.test.js`** - Tests for MongoDB models (Poll and Vote)

### Test Coverage

The test suite covers:

#### API Endpoints
- `GET /` - Basic health check
- `POST /create` - Poll creation with validation
- `GET /poll` - Poll retrieval by ID
- `POST /vote` - Vote submission with validation
- `GET /votes` - Results calculation with ranked choice voting

#### Utility Functions
- `determineChoice()` - Finding next valid choice for a voter
- `isWinner()` - Checking if a choice has majority (>50%)
- `determineEliminated()` - Finding choice with lowest votes for elimination
- `countVotes()` - Full ranked choice voting algorithm

#### Database Models
- Poll creation, retrieval, and validation
- Vote creation and querying
- Model relationships and constraints

#### Integration Tests
- Complete poll lifecycle from creation to results
- Error handling and edge cases
- Data validation and security

## Running Tests

### Prerequisites
```bash
npm install
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Configuration

The test suite uses:
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library for API testing
- **MongoDB Memory Server** - In-memory MongoDB for isolated testing
- **ES Modules** - Modern JavaScript module system

Configuration is in `jest.config.js`:
- Node.js test environment
- 30-second timeout for database operations
- Coverage collection from all `.js` files
- Excludes `node_modules`, `coverage`, and setup files

## Test Database

Tests use MongoDB Memory Server which:
- Creates a fresh in-memory MongoDB instance for each test run
- Automatically cleans up after tests complete
- Provides complete isolation between test runs
- No external database dependencies

## Test Results

Current test coverage:
- **44 tests** passing
- **100% coverage** on database models
- **Comprehensive API testing** with error cases
- **Unit tests** for all voting logic functions

## Key Test Scenarios

### Voting Logic Tests
- Majority winner detection
- Ranked choice elimination rounds
- Vote redistribution after elimination
- Edge cases (ties, single votes, etc.)

### API Validation Tests
- Invalid poll IDs
- Malformed vote data
- Duplicate poll creation
- Missing or incorrect choices

### Database Tests
- Model creation and retrieval
- Data validation
- Relationship handling
- Error conditions

## Adding New Tests

When adding new features:

1. **Unit tests** - Add to `utils.test.js` for new utility functions
2. **API tests** - Add to `api.test.js` for new endpoints
3. **Model tests** - Add to `models.test.js` for new database schemas
4. **Integration tests** - Add end-to-end scenarios to `api.test.js`

Follow the existing patterns for setup, teardown, and assertions. 