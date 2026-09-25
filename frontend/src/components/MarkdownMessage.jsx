import { useState, useMemo } from 'react';
import { marked } from 'marked';
import Prism from 'prismjs';

// Load language components for Prism
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Interactive CodeBlock component with syntax highlighting and Copy button
 */
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const cleanLang = (language || 'text').trim().toLowerCase();

  const highlightedHtml = useMemo(() => {
    const grammar = Prism.languages[cleanLang] || Prism.languages.clike || Prism.languages.text;
    if (grammar) {
      try {
        return Prism.highlight(code, grammar, cleanLang);
      } catch (e) {
        console.warn('Prism highlight error:', e);
      }
    }
    // Fallback: escape HTML
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }, [code, cleanLang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3.5 rounded-lg border border-[#34362F] dark:border-[#2C2E28] bg-[#181A17] dark:bg-[#101210] overflow-hidden shadow-sm">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#222521] dark:bg-[#181A16] border-b border-[#34362F] dark:border-[#2C2E28]">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#A09E96]">
          {cleanLang || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono text-[#A09E96] hover:text-[#ECEAE3] hover:bg-[#2F332D] transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-[#38A18C]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span className="text-[#38A18C]">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 16 16">
                <rect height="8" rx="1.5" width="8" x="5.5" y="5.5"></rect>
                <path d="M3.5 10.5h-1a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1"></path>
              </svg>
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-3.5 overflow-x-auto text-[13px] leading-[1.65] font-mono text-[#E4E2DC]">
        <pre className="!bg-transparent !p-0 !m-0 font-mono">
          <code
            className={`language-${cleanLang}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  );
}

/**
 * MarkdownMessage component for parsing full assistant messages
 * Separates code blocks into syntax-highlighted blocks and formats markdown
 */
export default function MarkdownMessage({ content }) {
  if (!content) return null;

  const blocks = useMemo(() => {
    try {
      const tokens = marked.lexer(content);
      const parsedBlocks = [];
      let currentHtmlChunk = '';

      for (const token of tokens) {
        if (token.type === 'code') {
          if (currentHtmlChunk.trim()) {
            parsedBlocks.push({
              type: 'html',
              content: marked.parse(currentHtmlChunk),
            });
            currentHtmlChunk = '';
          }
          parsedBlocks.push({
            type: 'code',
            code: token.text,
            lang: token.lang || 'text',
          });
        } else {
          currentHtmlChunk += token.raw;
        }
      }

      if (currentHtmlChunk.trim()) {
        parsedBlocks.push({
          type: 'html',
          content: marked.parse(currentHtmlChunk),
        });
      }

      return parsedBlocks;
    } catch (e) {
      console.warn('Markdown parsing error:', e);
      return [{ type: 'text', content }];
    }
  }, [content]);

  return (
    <div className="vault-markdown-message text-[15px] leading-[1.7] text-[#20211F] dark:text-[#ECEAE3]">
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return <CodeBlock key={idx} code={block.code} language={block.lang} />;
        }
        if (block.type === 'html') {
          return (
            <div
              key={idx}
              className="vault-prose"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
        }
        return <div key={idx} className="whitespace-pre-wrap">{block.content}</div>;
      })}
    </div>
  );
}
