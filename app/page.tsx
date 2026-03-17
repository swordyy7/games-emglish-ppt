'use client';

import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { motion, AnimatePresence } from 'framer-motion';

interface Word {
  word: string;
  pronunciation: string;
  type: string;
  meaning: string;
  context?: string;
  collocation?: string;
  coreMeaning?: string;
}

interface Phrase {
  expression: string;
  meaning: string;
  coreMeaning?: string;
}

interface Grammar {
  label: string;
  example: string;
  explanation?: string;
}

interface Slide {
  title: string;
  originalText: string;
  translation: string;
  words: Word[];
  phrases: Phrase[];
  grammar: Grammar[];
}

export default function Presentation() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [showGrammar, setShowGrammar] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [fileName, setFileName] = useState('未选择文件');
  const [showTranslation, setShowTranslation] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSlide = slides[currentSlideIndex];

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsedSlides = parseMarkdown(text);
      
      // Debug: log parsed data
      console.log('Parsed slides:', parsedSlides);
      parsedSlides.forEach((slide, index) => {
        console.log(`Slide ${index}:`, {
          title: slide.title,
          wordsCount: slide.words.length,
          phrasesCount: slide.phrases.length,
          words: slide.words,
          phrases: slide.phrases
        });
      });
      
      setSlides(parsedSlides);
      setCurrentSlideIndex(0);
      setCurrentWordIndex(0);
    };
    reader.readAsText(file);
  };

  // Parse markdown file
const parseMarkdown = (text: string): Slide[] => {
    const lines = text.split('\n');
    const parsedSlides: Slide[] = [];
    let currentSlide: Partial<Slide> | null = null;
    let inOriginalText = false;
    let inWordTable = false;
    let inPhraseTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Parse section headers (new slide)
      if (line.startsWith('### ')) {
        if (currentSlide && currentSlide.originalText) {
          parsedSlides.push(currentSlide as Slide);
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
        inOriginalText = true;
        continue;
      }

      if (inOriginalText) {
        if (line.startsWith('>')) {
          currentSlide.originalText += line.substring(1).trim() + ' ';
          continue;
        } else if (line === '' || line.startsWith('**')) {
          inOriginalText = false;
          continue;
        }
      }

      // Parse translation
      if (line.startsWith('>')) {
        if (currentSlide.translation === '') {
          currentSlide.translation += line.substring(1).trim() + ' ';
        }
      }

      // Parse word table
      if (line.startsWith('**难点词：**')) {
        inWordTable = true;
        continue;
      }

      if (inWordTable) {
        if (line.startsWith('| 词 |') || line.match(/^\|[\s-]+\|$/)) {
          continue;
        }
        if (line.startsWith('|') && line.includes('|')) {
          const parts = line.split('|').map(p => p.trim()).filter(p => p.length > 0);
          // 检查是否是有效的数据行
          const hasValidData = parts.some(part => 
            part && !part.match(/^[\s-]+$/) && !part.match(/^[a-z]{2,}$/i)
          );
          
          if (parts.length >= 4 && hasValidData && parts[0] && parts[1] && parts[2] && parts[3]) {
            currentSlide.words?.push({
              word: parts[0],
              pronunciation: parts[1],
              type: parts[2],
              meaning: parts[3]
            });
          }
        } else if (line.startsWith('**')) {
          inWordTable = false;
        }
      }

      // Parse phrase table
      if (line.startsWith('**固定搭配/短语：**')) {
        inPhraseTable = true;
        continue;
      }

      if (inPhraseTable) {
        if (line.startsWith('| 表达 |') || line.match(/^\|[\s-]+\|$/)) {
          continue;
        }
        if (line.startsWith('|') && line.includes('|')) {
          const parts = line.split('|').map(p => p.trim()).filter(p => p.length > 0);
          // 检查是否是有效的数据行
          const hasValidData = parts.some(part => 
            part && !part.match(/^[\s-]+$/) && !part.match(/^[a-z]{2,}$/i) && part.length > 3
          );
          
          if (parts.length >= 2 && hasValidData && parts[0] && parts[1]) {
            currentSlide.phrases?.push({
              expression: parts[0],
              meaning: parts[1]
            });
          }
        } else if (line.startsWith('**')) {
          inPhraseTable = false;
        }
      }

      // Parse grammar
      if (line.startsWith('**时态/句型：**')) {
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
          currentSlide.grammar?.push({
            label: '时态/句型',
            example: grammarText,
            explanation: ''
          });
        }
      }
    }

    // Add the last slide
    if (currentSlide && currentSlide.originalText) {
      parsedSlides.push(currentSlide as Slide);
    }

    return parsedSlides;
  };

  const parseGrammarFromList = (listText: string): Grammar | null => {
    const lines = listText.split('\n');
    const grammar: Partial<Grammar> = {};

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

    return grammar.label ? grammar as Grammar : null;
  };

  const parseWordTable = (lines: string[], startIndex: number): Word | null => {
    // This function is no longer needed as we parse words directly in parseMarkdown
    return null;
  };

  const parseGrammarSection = (lines: string[], startIndex: number): Grammar | null => {
    // This function is no longer needed as we parse grammar using marked
    return null;
  };

  const showNextWord = () => {
    if (!currentSlide) return;

    // 阶段1: 展示难点词
    if (currentWordIndex < currentSlide.words.length) {
      setCurrentWordIndex(prev => prev + 1);
      return;
    }

    // 阶段2: 展示固定搭配
    if (currentPhraseIndex < currentSlide.phrases.length) {
      setCurrentPhraseIndex(prev => prev + 1);
      return;
    }

    // 阶段3: 隐藏词汇表，显示翻译
    if (showVocabulary && !showTranslation) {
      setShowVocabulary(false);
      setShowTranslation(true);
      return;
    }

    // 所有阶段完成,进入下一页
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setCurrentWordIndex(0);
      setCurrentPhraseIndex(0);
      setShowVocabulary(true);
      setShowTranslation(false);
    }
  };

  // Auto play effect
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      if (!currentSlide) return;

      // 阶段1: 展示难点词
      if (currentWordIndex < currentSlide.words.length) {
        setCurrentWordIndex(prev => prev + 1);
        return;
      }

      // 阶段2: 展示固定搭配
      if (currentPhraseIndex < currentSlide.phrases.length) {
        setCurrentPhraseIndex(prev => prev + 1);
        return;
      }

      // 阶段3: 隐藏词汇表，显示翻译
      if (showVocabulary && !showTranslation) {
        setShowVocabulary(false);
        setShowTranslation(true);
        return;
      }

      // 所有阶段完成,进入下一页
      if (currentSlideIndex < slides.length - 1) {
        setCurrentSlideIndex(prev => prev + 1);
        setCurrentWordIndex(0);
        setCurrentPhraseIndex(0);
        setShowVocabulary(true);
        setShowTranslation(false);
      } else {
        setIsAutoPlaying(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentSlideIndex, currentWordIndex, currentPhraseIndex, showVocabulary, showTranslation, slides, currentSlide]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        e.preventDefault();
        showNextWord();
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsAutoPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, currentWordIndex, currentPhraseIndex, showVocabulary, showTranslation, slides]);

  // Get processed text with highlights
  const getProcessedText = (text: string, words: Word[], wordIndex: number) => {
    let processed = text;
    words.forEach((word, index) => {
      if (index < wordIndex) {
        const regex = new RegExp(`\\b${word.word}\\b`, 'gi');
        processed = processed.replace(regex, `<span class="highlight">${word.word}</span>`);
      }
    });
    return processed;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10 font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif]">
      {/* File Upload Section - Only show when no slides loaded */}
      {slides.length === 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 p-3 bg-[#1A1A1A] rounded-full border border-[#333333] shadow-lg">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".md"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#FFD700] text-black px-4 py-2 rounded-full font-semibold hover:bg-[#FFC700] transition-all flex items-center gap-2 text-sm"
          >
            <span>📁</span>
            <span>选择 Markdown 文件</span>
          </button>
          <span className="text-gray-400 text-xs italic">{fileName}</span>
        </div>
      )}

      {/* Progress Indicator - Only show when slides loaded */}
      {slides.length > 0 && (
        <div className="fixed top-4 right-8 bg-[#1A1A1A] px-4 py-2 rounded-full text-sm text-gray-400 border border-[#333333] z-50">
          <span>{currentSlideIndex + 1}</span> / <span>{slides.length}</span> 页
          {currentSlide && (
            <span className="ml-3 text-xs">
              {currentWordIndex < currentSlide.words.length ? `词汇: ${currentWordIndex + 1}/${currentSlide.words.length}` :
               currentPhraseIndex < currentSlide.phrases.length ? `搭配: ${currentPhraseIndex + 1}/${currentSlide.phrases.length}` :
               '完成'}
            </span>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {showTranslation ? (
          // Final state: Centered original text + translation
          <motion.div
            key="final"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-10"
          >
            {/* Original Text */}
                      <div className="text-center">
                        <div
                          className="text-[56px] leading-[1.2] text-white italic font-normal font-['Georgia','Times New Roman','Palatino',serif]"
                        >                          {currentSlide ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: getProcessedText(
                                  currentSlide.originalText.trim(),
                                  currentSlide.words,
                                  currentSlide.words.length
                                )
                              }}
                            />
                          ) : (
                            <div className="text-gray-400 text-4xl">
                              请选择一个 Markdown 文件开始演示
                            </div>
                          )}
                        </div>
                      </div>
            
                      {/* Translation */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                                  className="text-center w-full"
                                >                        <div className="text-[48px] leading-[1.4] text-[#FF9800] font-normal">
                          {currentSlide?.translation || '暂无译文'}
                        </div>
                      </motion.div>          </motion.div>
        ) : (
          // Vocabulary state: Original text + vocabulary grid
          <motion.div
            key="vocabulary"
            className="w-full h-[95vh] flex flex-col px-8"
          >
            {/* Upper Section - Original Text & Translation */}
            <motion.div
              className={`flex flex-col items-center ${
              (currentSlide?.words.length > 0 && currentWordIndex > 0) || 
              (currentSlide?.phrases.length > 0 && currentWordIndex >= currentSlide.words.length)
                ? 'gap-10 mt-12' 
                : 'justify-center flex-1 gap-10'
            }`}
              layout
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
            >
              {/* Original Text */}
              <div className="text-center mt-8">
                <div
                  className="leading-[1.2] text-white italic font-normal text-[52px] font-['Georgia','Times New Roman','Palatino',serif]"
                >
                  {currentSlide ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getProcessedText(
                          currentSlide.originalText.trim(),
                          currentSlide.words,
                          currentWordIndex
                        )
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 text-4xl">
                      请选择一个 Markdown 文件开始演示
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <AnimatePresence>
              {(currentSlide?.words.length > 0 && currentWordIndex > 0) || 
               (currentSlide?.phrases.length > 0 && currentWordIndex >= currentSlide.words.length) ? (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: '100%' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
                  className="h-[2px] bg-gradient-to-r from-transparent via-[#333333] to-transparent mx-auto mt-8"
                />
              ) : null}
            </AnimatePresence>

            {/* Lower Section - Vocabulary Grid */}
            <AnimatePresence mode="wait">
              {((currentSlide?.words.length > 0 && currentWordIndex > 0) || 
               (currentSlide?.phrases.length > 0 && currentWordIndex >= currentSlide.words.length)) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 100 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
                  className="flex-1 flex flex-col gap-10 pt-6 overflow-y-auto"
                >
                  {/* Words Grid */}
                  <div className="grid grid-cols-2 gap-8">
                    {/* 难点词区域 - 只在有单词时显示 */}
                    {currentSlide?.words.length > 0 && (
                      <div className="flex flex-col gap-6">
                        {currentSlide?.words.map((word, index) => (
                          <AnimatePresence key={index}>
                            {index < currentWordIndex && (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
                                className="flex items-center gap-8"
                              >
                                <div className="text-[48px] font-bold text-[#FF9800]">{word.word}</div>
                                <div className="text-[40px] text-white font-['Source Code Pro','Courier New',monospace]">
                                  {word.pronunciation} <span className="text-gray-400">{word.type}</span>
                                </div>
                                <div className="text-[40px] text-[#FF9800]">{word.meaning}</div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        ))}
                      </div>
                    )}

                    {/* 固定搭配区域 - 只在完成难点词后且有短语时显示 */}
                    {currentSlide?.phrases.length > 0 && currentWordIndex >= currentSlide.words.length && (
                      <div className="flex flex-col gap-6">
                        {currentSlide?.phrases.map((phrase, index) => (
                          <AnimatePresence key={index}>
                            {index < currentPhraseIndex && (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
                                className="flex items-center gap-8"
                              >
                                <div className="text-[48px] font-bold text-[#FF9800]">{phrase.expression}</div>
                                <div className="text-[40px] text-white">{phrase.meaning}</div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}