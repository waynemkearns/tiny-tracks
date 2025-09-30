import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveValue(value: string): R;
      toHaveTextContent(text: string): R;
    }
  }
}

// This is necessary to make the file a module
export {};
