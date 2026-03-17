// 不使用 marked，直接解析表格
function parseMarkdown(text) {
    console.log('=== Starting simple Markdown parsing ===');
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
            phrasesCount: currentSlide.phrases?.length
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
        words: currentSlide.words,
        phrases: currentSlide.phrases
      });
      parsedSlides.push(currentSlide);
    }

    console.log('=== Parsing complete ===');
    console.log('Total parsed slides:', parsedSlides.length);
    console.log('Final parsed data:', JSON.stringify(parsedSlides, null, 2));
    
    return parsedSlides;
}

// Test with sample data
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
| lost to me | 对我而言已失去 | Those memories are lost to me. | 表达失去时 |`;

console.log('Starting test...');
const slides = parseMarkdown(testMarkdown);

console.log('\n=== TEST RESULTS ===');
console.log('Total slides:', slides.length);
if (slides.length > 0) {
  console.log('First slide title:', slides[0].title);
  console.log('First slide original text:', slides[0].originalText);
  console.log('First slide words count:', slides[0].words?.length);
  console.log('First slide phrases count:', slides[0].phrases?.length);
  console.log('First slide words:', slides[0].words);
  console.log('First slide phrases:', slides[0].phrases);
} else {
  console.log('ERROR: No slides parsed!');
}