# Contributing to MITUGYM

Thank you for your interest in contributing to MITUGYM! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mitugym-app.git
   cd mitugym-app
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start development server**:
   ```bash
   npm start
   ```

## 🛠️ Development Guidelines

### Code Style
- Follow TypeScript strict mode
- Use ESLint and Prettier (run `npm run lint` and `npm run format`)
- Write meaningful commit messages
- Follow the existing file structure and naming conventions

### Testing
- Write tests for new components and utilities
- Run tests before submitting: `npm test`
- Maintain test coverage for critical functionality

### Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow existing code patterns
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub with:
   - Clear description of changes
   - Screenshots for UI changes
   - Reference to any related issues

## 📝 Commit Message Format

Use conventional commits format:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

## 🐛 Reporting Issues

1. Check existing issues first
2. Use the issue template
3. Provide detailed reproduction steps
4. Include device/OS information for bugs

## 💡 Feature Requests

1. Check if the feature already exists
2. Explain the use case and benefits
3. Provide mockups or examples if applicable

## 📱 Testing on Devices

- Test on both iOS and Android
- Test different screen sizes
- Verify accessibility features
- Check performance on lower-end devices

## 🎨 Design Guidelines

- Follow the existing design system in `lib/theme.ts`
- Maintain consistency with current UI patterns
- Ensure proper contrast and accessibility
- Use the established color palette

## 📞 Questions?

- Open an issue for discussion
- Check existing documentation first
- Be respectful and constructive

Thank you for contributing to MITUGYM! 🏋️‍♂️
