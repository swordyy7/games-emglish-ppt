const fs = require('fs');

// 不使用 marked，直接解析表格
function parseMarkdown(text) {
    console.log('=== Starting full Markdown parsing ===');
    console.log('Text length:', text.length);
    
    const lines = text.split('\n');
    const parsedSlides = [];
    let currentSlide = null;
    let inOriginalText = false;
    let inWordTable = false;
    let inPhraseTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (i < 25) {
        console.log(`Line ${i}: "${line}"`);
      }

      // Parse section headers (new slide)
      if (line.startsWith('### ')) {
        console.log('Found section header:', line);
        if (currentSlide && currentSlide.originalText) {
          console.log('Saving slide:', {
            title: currentSlide.title,
            wordsCount: currentSlide.words?.length,
            phrasesCount: currentSlide.phrases?.length,
            grammarCount: currentSlide.grammar?.length
          });
          parsedSlides.push(currentSlide);
        }
        currentSlide = {
          title: line.substring(4).trim(),
          originalText: '',
          translation: '',
          words: [],
          phrases: [],
          grammar: []
        };
        continue;
      }

      if (!currentSlide) continue;

      // Parse original text block
      if (line.startsWith('**原文：**')) {
        console.log('Found original text marker');
        inOriginalText = true;
        continue;
      }

      if (inOriginalText) {
        if (line.startsWith('>')) {
          currentSlide.originalText += line.substring(1).trim() + ' ';
          console.log('Adding original text:', line.substring(1).trim());
          continue;
        } else if (line === '' || line.startsWith('**')) {
          console.log('Ending original text');
          inOriginalText = false;
          continue;
        }
      }

      // Parse translation
      if (line.startsWith('>')) {
        if (currentSlide.translation === '') {
          currentSlide.translation += line.substring(1).trim() + ' ';
          console.log('Adding translation:', line.substring(1).trim());
        }
      }

      // Parse word table
      if (line.startsWith('**难点词：**')) {
        console.log('Found word table marker');
        inWordTable = true;
        continue;
      }

      if (inWordTable) {
        console.log('Processing word table line:', line);
        if (line.startsWith('| 词 |') || line.match(/^\|[\s-]+\|$/)) {
          console.log('Skipping header or separator row');
          continue;
        }
        if (line.startsWith('|') && line.includes('|')) {
          const parts = line.split('|').map(p => p.trim()).filter(p => p.length > 0);
          console.log('Word table line parts:', parts);
          // 检查是否是有效的数据行(不是全是横线和空格)
          const hasValidData = parts.some(part => 
            part && !part.match(/^[\s-]+$/) && !part.match(/^[a-z]{2,}$/i) // 不是全是横线，也不是短字母
          );
          console.log('Has valid data:', hasValidData);
          
          if (parts.length >= 5 && hasValidData && parts[0] && parts[1] && parts[2] && parts[4]) {
            const word = {
              word: parts[0],
              pronunciation: parts[1],
              type: parts[2],
              meaning: parts[4]
            };
            currentSlide.words?.push(word);
            console.log('✓ Added word:', word);
          }
        } else if (line.startsWith('**')) {
          console.log('Ending word table');
          inWordTable = false;
        }
        // 不在空行时结束表格，只在遇到新的 ** 开头时结束
      }

      // Parse phrase table
      if (line.startsWith('**固定搭配/短语：**')) {
        console.log('Found phrase table marker');
        inPhraseTable = true;
        continue;
      }

      if (inPhraseTable) {
        console.log('Processing phrase table line:', line);
        if (line.startsWith('| 表达 |') || line.match(/^\|[\s-]+\|$/)) {
          console.log('Skipping header or separator row');
          continue;
        }
        if (line.startsWith('|') && line.includes('|')) {
          const parts = line.split('|').map(p => p.trim()).filter(p => p.length > 0);
          console.log('Phrase table line parts:', parts);
          // 检查是否是有效的数据行
          const hasValidData = parts.some(part => 
            part && !part.match(/^[\s-]+$/) && !part.match(/^[a-z]{2,}$/i) && part.length > 3
          );
          console.log('Has valid data:', hasValidData);
          
          if (parts.length >= 2 && hasValidData && parts[0] && parts[1]) {
            const phrase = {
              expression: parts[0],
              meaning: parts[1]
            };
            currentSlide.phrases?.push(phrase);
            console.log('✓ Added phrase:', phrase);
          }
        } else if (line.startsWith('**')) {
          console.log('Ending phrase table');
          inPhraseTable = false;
        }
        // 不在空行时结束表格，只在遇到新的 ** 开头时结束
      }

      // Parse grammar
      if (line.startsWith('**时态/句型：**')) {
        console.log('Found grammar marker');
        const grammarLines = [];
        i++;
        // 收集语法内容直到遇到下一个 ** 或文件结束
        while (i < lines.length && !lines[i].trim().startsWith('**')) {
          const grammarLine = lines[i].trim();
          if (grammarLine && !grammarLine.startsWith('>')) {
            grammarLines.push(grammarLine);
          }
          i++;
        }
        i--; // 回退一行，因为循环结束时会再次递增
        if (grammarLines.length > 0) {
          const grammarText = grammarLines.join(' ');
          currentSlide.grammar?.push(grammarText);
          console.log('✓ Added grammar:', grammarText);
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
        grammarCount: currentSlide.grammar?.length
      });
      parsedSlides.push(currentSlide);
    }

    console.log('=== Parsing complete ===');
    console.log('Total parsed slides:', parsedSlides.length);
    
    return parsedSlides;
}

// Test with actual game file
const filePath = '/Users/sworddy/Desktop/student/games/LimbusCompany/Episode 00: Selva Oscura/0-1-Pre-Battle.md';
console.log('Reading file:', filePath);
const markdown = fs.readFileSync(filePath, 'utf8');

console.log('Starting test...');
const slides = parseMarkdown(markdown);

console.log('\n=== TEST RESULTS ===');
console.log('Total slides:', slides.length);
if (slides.length > 0) {
  console.log('\nFirst slide:');
  console.log('  Title:', slides[0].title);
  console.log('  Original text:', slides[0].originalText.substring(0, 100) + '...');
  console.log('  Words count:', slides[0].words?.length);
  console.log('  Phrases count:', slides[0].phrases?.length);
  console.log('  Grammar count:', slides[0].grammar?.length);
  if (slides[0].grammar && slides[0].grammar.length > 0) {
    console.log('  Grammar:', slides[0].grammar);
  }
} else {
  console.log('ERROR: No slides parsed!');
}