import { describe, it, expect } from 'jest';
import { marked } from 'marked';

// 导出解析函数用于测试
export function parseMarkdown(text: string) {
    console.log('=== Starting Markdown parsing ===');
    console.log('Text length:', text.length);
    console.log('First 500 chars:', text.substring(0, 500));
    
    const tokens = marked.lexer(text);
    console.log('=== Marked tokens ===');
    console.log('Total tokens:', tokens.length);
    
    tokens.forEach((token, index) => {
      console.log(`Token ${index}:`, {
        type: token.type,
        text: token.text?.substring(0, 100),
        depth: token.depth,
        header: token.header,
        rows: token.rows?.length
      });
    });
    
    const parsedSlides: any[] = [];
    let currentSlide: any = null;

    for (const token of tokens) {
      console.log(`\n=== Processing token type: ${token.type} ===`);

      if (token.type === 'heading' && token.depth === 3) {
        console.log('Found H3 header:', token.text);
        if (currentSlide && currentSlide.originalText) {
          console.log('Saving slide:', {
            title: currentSlide.title,
            wordsCount: currentSlide.words?.length,
            phrasesCount: currentSlide.phrases?.length
          });
          parsedSlides.push(currentSlide);
        }
        currentSlide = {
          title: token.text.trim(),
          originalText: '',
          translation: '',
          words: [],
          phrases: [],
          grammar: []
        };
        continue;
      }

      if (!currentSlide) continue;

      if (token.type === 'paragraph') {
        const text = token.text || '';
        console.log('Paragraph text:', text.substring(0, 200));
        
        // Check for original text
        if (text.includes('**原文：**')) {
          const originalTextMatch = text.match(/\*\*原文：\*\*\s*(.+)/);
          if (originalTextMatch) {
            currentSlide.originalText = originalTextMatch[1].trim();
            console.log('✓ Found original text:', currentSlide.originalText);
          }
        }
        
        // Check for translation (in blockquote format)
        if (text.startsWith('>')) {
          const translationText = text.substring(1).trim();
          if (!currentSlide.translation.includes(translationText)) {
            currentSlide.translation += translationText + ' ';
            console.log('✓ Adding translation:', translationText);
          }
        }
      }

      if (token.type === 'list') {
        const listText = token.text || '';
        console.log('List text:', listText.substring(0, 200));
        
        // Parse grammar points (bullet list)
        if (listText.includes('一般') || listText.includes('时态') || listText.includes('句型')) {
          const grammarData = parseGrammarFromList(listText);
          if (grammarData) {
            currentSlide.grammar?.push(grammarData);
            console.log('✓ Added grammar:', grammarData);
          }
        }
      }

      if (token.type === 'table') {
        const header = token.header || [];
        const rows = token.rows || [];
        
        console.log('Found table with header:', header);
        console.log('Table rows:', rows.length);

        // Check if this is a word table
        if (header.includes('词') && header.includes('音标')) {
          console.log('=== This is a word table ===');
          for (const row of rows) {
            console.log('Processing word row:', row);
            if (row.length >= 5) {
              const word = {
                word: row[0]?.trim() || '',
                pronunciation: row[1]?.trim() || '',
                type: row[2]?.trim() || '',
                meaning: row[4]?.trim() || ''
              };
              if (word.word && word.word !== '词') {
                currentSlide.words?.push(word);
                console.log('✓ Added word:', word);
              }
            }
          }
        }
        
        // Check if this is a phrase table
        if (header.includes('表达') && header.includes('意思')) {
          console.log('=== This is a phrase table ===');
          for (const row of rows) {
            console.log('Processing phrase row:', row);
            if (row.length >= 2) {
              const phrase = {
                expression: row[0]?.trim() || '',
                meaning: row[1]?.trim() || ''
              };
              if (phrase.expression && phrase.expression !== '表达') {
                currentSlide.phrases?.push(phrase);
                console.log('✓ Added phrase:', phrase);
              }
            }
          }
        }
      }
    }

    // Add the last slide
    if (currentSlide && currentSlide.originalText) {
      console.log('=== Saving last slide ===');
      console.log('Last slide data:', {
        title: currentSlide.title,
        wordsCount: currentSlide.words?.length,
        phrasesCount: currentSlide.phrases?.length,
        words: currentSlide.words,
        phrases: currentSlide.phrases
      });
      parsedSlides.push(currentSlide);
    }

    console.log('=== Parsing complete ===');
    console.log('Total parsed slides:', parsedSlides.length);
    return parsedSlides;
  }

function parseGrammarFromList(listText: string) {
    const lines = listText.split('\n');
    const grammar: any = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('-')) {
        if (trimmed.includes('：')) {
          const [label, desc] = trimmed.split('：');
          grammar.label = label.replace(/^-/, '').trim();
          grammar.example = desc.trim();
        }
      }
      if (trimmed.includes('=')) {
        const parts = trimmed.split('=');
        if (parts.length >= 2) {
          grammar.explanation = parts[1].trim();
        }
      }
    }

    return grammar.label ? grammar : null;
}

describe('parseMarkdown', () => {
  it('应该正确解析测试文件', () => {
    const testMarkdown = `### 1. 开场独白

**原文：**
> I stood in the middle of a black forest, my reasons and past all lost to me.

**难点词：**

| 词 | 音标 | 词性 | 词根/词缀 | 意思 | 常见搭配 |
|----|------|------|-----------|------|----------|
| stood | /stʊd/ | v. | stand 过去式 | 站 | stand in |
| lost | /lɒst/ | adj. | lose 的过去分词 | 失去的 | lost to me |

**固定搭配/短语：**

| 表达 | 意思 | 例句 | 一般什么时候用 |
|------|------|------|----------------|
| in the middle of | 在……中央 | I stood in the middle of the room. | 描述位置时 |
| lost to me | 对我而言已失去 | Those memories are lost to me. | 表达失去时 |

**时态/句型：**
- 一般过去时：描述过去发生的事情

**整段翻译：**
> 我站在一片黑色森林的中央，我的理由和过往全都离我而去。`;

    const slides = parseMarkdown(testMarkdown);

    console.log('解析结果:', JSON.stringify(slides, null, 2));

    // 基本断言
    expect(slides).toBeDefined();
    expect(slides.length).toBeGreaterThan(0);
    expect(slides[0].title).toBe('1. 开场独白');
    expect(slides[0].originalText).toContain('I stood in the middle of a black forest');
    
    // 难点词断言
    expect(slides[0].words).toBeDefined();
    expect(slides[0].words.length).toBe(2);
    expect(slides[0].words[0].word).toBe('stood');
    expect(slides[0].words[0].pronunciation).toBe('/stʊd/');
    expect(slides[0].words[0].meaning).toBe('站');
    expect(slides[0].words[1].word).toBe('lost');
    expect(slides[0].words[1].meaning).toBe('失去的');
    
    // 固定搭配断言
    expect(slides[0].phrases).toBeDefined();
    expect(slides[0].phrases.length).toBe(2);
    expect(slides[0].phrases[0].expression).toBe('in the middle of');
    expect(slides[0].phrases[0].meaning).toBe('在……中央');
    expect(slides[0].phrases[1].expression).toBe('lost to me');
    expect(slides[0].phrases[1].meaning).toBe('对我而言已失去');
  });

  it('应该正确解析多个幻灯片', () => {
    const testMarkdown = `### 1. 第一句

**原文：**
> Hello world.

**难点词：**

| 词 | 音标 | 词性 | 词根/词缀 | 意思 | 常见搭配 |
|----|------|------|-----------|------|----------|
| Hello | /həˈloʊ/ | interj. | - | 你好 | Hello world |

**固定搭配/短语：**

| 表达 | 意思 | 例句 | 一般什么时候用 |
|------|------|------|----------------|
| Hello world | 你好世界 | Hello world | 程序入门时 |

---

### 2. 第二句

**原文：**
> Good morning.

**难点词：**

| 词 | 音标 | 词性 | 词根/词缀 | 意思 | 常见搭配 |
|----|------|------|-----------|------|----------|
| Good | /ɡʊd/ | adj. | - | 好的 | Good morning |

**固定搭配/短语：**

| 表达 | 意思 | 例句 | 一般什么时候用 |
|------|------|------|----------------|
| Good morning | 早上好 | Good morning | 问候时 |`;

    const slides = parseMarkdown(testMarkdown);

    console.log('多幻灯片解析结果:', JSON.stringify(slides, null, 2));

    expect(slides).toBeDefined();
    expect(slides.length).toBe(2);
    expect(slides[0].title).toBe('1. 第一句');
    expect(slides[1].title).toBe('2. 第二句');
    expect(slides[0].words.length).toBe(1);
    expect(slides[1].words.length).toBe(1);
  });

  it('应该正确处理空内容', () => {
    const testMarkdown = `### 空测试

**原文：**
> No content here.`;

    const slides = parseMarkdown(testMarkdown);

    console.log('空内容解析结果:', JSON.stringify(slides, null, 2));

    expect(slides).toBeDefined();
    expect(slides.length).toBe(1);
    expect(slides[0].words.length).toBe(0);
    expect(slides[0].phrases.length).toBe(0);
  });
});