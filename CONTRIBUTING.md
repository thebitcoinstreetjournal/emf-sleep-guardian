# Contributing to EMF Sleep Guardian

Thank you for your interest in contributing to EMF Sleep Guardian! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment (see below)
4. Create a branch for your changes
5. Make your changes
6. Test your changes
7. Submit a pull request

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Setup Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/thebitcoinstreetjournal/emf-sleep-guardian.git
   cd emf-sleep-guardian
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the setup script:
   ```bash
   ./scripts/setup-project.sh
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-reminder-type`
- `bugfix/fix-notification-crash`
- `improvement/enhance-ui-animations`

### Commit Messages

Follow conventional commit format:
- `feat: add new notification sound options`
- `fix: resolve crash when opening settings`
- `docs: update installation instructions`
- `style: improve button styling`
- `refactor: reorganize utils functions`
- `test: add tests for TaskCard component`

## Submitting Changes

1. Push your branch to your fork
2. Create a pull request from your branch to the main repository
3. Provide a clear description of your changes
4. Include screenshots for UI changes
5. Ensure all tests pass
6. Wait for review and address any feedback

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-platform testing (iOS/Android/Web)

## Screenshots (if applicable)
Include screenshots of UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## Style Guidelines

### JavaScript/React Native

- Use ES6+ features
- Follow ESLint configuration
- Use functional components with hooks
- Prefer const over let, avoid var
- Use meaningful variable names
- Add comments for complex logic

### File Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── utils/              # Utility functions
├── services/           # API and external services
├── constants/          # App constants
└── types/              # TypeScript types (if using TS)
```

### Naming Conventions

- Components: PascalCase (`TaskCard.js`)
- Files: camelCase (`notificationService.js`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Functions: camelCase (`calculateHealthScore`)

## Testing

### Running Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
```

### Writing Tests

- Write tests for all new features
- Test both success and error cases
- Mock external dependencies
- Aim for high test coverage
- Use descriptive test names

### Test Structure

```javascript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something when condition is met', () => {
    // Test implementation
  });

  it('should handle error case appropriately', () => {
    // Error case test
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex algorithms
- Explain business logic
- Update README for new features

### JSDoc Example

```javascript
/**
 * Calculates the health score based on completed tasks
 * @param {Array} completedTasks - Array of completed task IDs
 * @returns {number} Health score from 0 to 100
 */
function calculateHealthScore(completedTasks) {
  // Implementation
}
```

## Questions?

If you have questions about contributing, please:
1. Check existing issues and discussions
2. Create a new issue with the "question" label
3. Reach out to maintainers

Thank you for contributing to EMF Sleep Guardian! 🌙