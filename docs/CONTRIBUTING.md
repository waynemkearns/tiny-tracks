# Contributing to TinyTracks

First off, thank you for considering contributing to TinyTracks! It's people like you that make TinyTracks such a great tool for parents.

## Development Process

We use GitHub to host code, track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

1. Make sure all tests pass before submitting a PR
2. Update documentation if you're changing functionality
3. Follow the code style of the project
4. Add tests for new features

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to making participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

## Style Guide

### JavaScript / TypeScript

We follow a modified version of the Airbnb JavaScript Style Guide with TypeScript extensions:

- 2 space indentation
- Semicolons are required
- Prefer `const` over `let`, avoid `var`
- Use TypeScript types for all variables and function returns
- Use interfaces for objects with methods, types for plain objects
- Use arrow functions for callbacks

### Component Structure

Components should follow this structure:

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  function handleClick() {
    setIsOpen(!isOpen);
    onAction();
  }
  
  return (
    <div className="my-component">
      <h2>{title}</h2>
      <Button onClick={handleClick}>
        {isOpen ? 'Close' : 'Open'}
      </Button>
    </div>
  );
}
```

### CSS / Styling

We use TailwindCSS for styling:

- Use utility classes whenever possible
- Group related utilities together (layout, typography, colors, etc.)
- Use custom CSS only when Tailwind doesn't provide the functionality

### Testing

- Write tests for all new features
- Test both happy paths and edge cases
- Mock external dependencies
- Keep tests focused and small

## Commit Message Guidelines

We use conventional commits:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `build:` Changes that affect the build system or external dependencies
- `ci:` Changes to our CI configuration files and scripts

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
