'use client';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { themes } from '../styles/markdownThemes';

export default function MarkdownRenderer({ content, isMobile, currentTheme }) {
  const preprocessMarkdown = (text) => {
    return text.replace(/\*\*[^*]+\*\*(?![.,!?;:，。！？；：])/g, match => match + ' ');
  };

  return (
    <div className="relative w-full h-full">
      <div className="h-full">
        <div className="markdown-container">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            className={`markdown-body ${currentTheme}`}
            components={{
              h1: ({node, ...props}) => <h1 className="markdown-h1" {...props} />,
              h2: ({node, ...props}) => <h2 className="markdown-h2" {...props} />,
              h3: ({node, ...props}) => <h3 className="markdown-h3" {...props} />,
              h4: ({node, ...props}) => <h4 className="markdown-h4" {...props} />,
              h5: ({node, ...props}) => <h5 className="markdown-h5" {...props} />,
              h6: ({node, ...props}) => <h6 className="markdown-h6" {...props} />,
              li: ({node, ...props}) => <li className="markdown-li" {...props} />,
              img: ({node, ...props}) => (
                <img
                  className="max-w-full h-auto"
                  {...props}
                  crossOrigin="anonymous"
                  loading="eager"
                  style={{
                    maxWidth: '100%',
                    display: 'block',
                    margin: '1em 0'
                  }}
                />
              ),
            }}
          >
            {preprocessMarkdown(content)}
          </ReactMarkdown>
        </div>
      </div>

      <style jsx global>{`
        ${themes[currentTheme].styles}
        .markdown-container {
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          padding: 20px;
        }
        .markdown-body {
          width: 100%;
          overflow-wrap: break-word;
          color: ${themes[currentTheme].textColor || '#2c3e50'};
          background: ${themes[currentTheme].background || '#ffffff'};
        }
        .markdown-body img {
          max-width: 100%;
          height: auto;
        }
        @media (max-width: 768px) {
          .markdown-container {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
} 