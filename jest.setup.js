import { jest } from '@jest/globals';

// Mock marked if needed
jest.mock('marked', () => ({
  lexer: jest.fn((text: string) => {
    return [
      {
        type: 'heading',
        depth: 3,
        text: text.match(/### (.+)/)?.[1] || '',
      },
      {
        type: 'paragraph',
        text: text.match(/\*\*原文：\*\*\s*(.+)/)?.[1] || '',
      },
    ];
  }),
}));

export {};