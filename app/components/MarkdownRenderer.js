'use client';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { themes } from '../styles/markdownThemes';

export default function MarkdownRenderer({ content, isMobile, currentTheme = 'wabisabi', markdownStyle }) {
  const preprocessMarkdown = (text) => {
    return text.replace(/\*\*[^*]+\*\*(?![.,!?;:，。！？；：])/g, match => match + ' ');
  };

  // 获取样式配置或使用默认值
  const styleConfig = markdownStyle || {
    header: { showHeader: false },
    background: { backgroundColor: '#ffffff', backgroundImage: 'none' },
    card: {
      isGlassmorphism: false,
      hasShadow: false,
      opacity: 1,
      blur: 10,
      backgroundColor: '#ffffff',
      textColor: '#2c3e50',
      borderRadius: 10,
      padding: 20,
      width: '100%',
      verticalSpacing: 20
    },
    footer: { showFooter: false }
  };

  // 将十六进制颜色转换为RGB格式
  const hexToRgb = (hex) => {
    // 去掉可能存在的 # 前缀
    hex = hex.replace(/^#/, '');
    
    // 解析十六进制值
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    
    return `${r}, ${g}, ${b}`;
  };

  // 获取卡片背景色样式
  const getCardBackgroundStyle = () => {
    if (styleConfig.card.isGlassmorphism) {
      return `rgba(${hexToRgb(styleConfig.card.backgroundColor)}, ${styleConfig.card.opacity})`;
    }
    return styleConfig.card.backgroundColor;
  };

  // 获取卡片阴影样式
  const getCardShadowStyle = () => {
    return styleConfig.card.hasShadow ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)' : 'none';
  };

  return (
    <div className="relative w-full h-full">
      <div className="h-full">
        {/* 背景样式 */}
        <div 
          className="absolute inset-0 z-0" 
          style={{
            backgroundColor: styleConfig.background.backgroundColor,
            backgroundImage: styleConfig.background.backgroundImage
          }}
        />
        
        {/* 头部区域 */}
        {styleConfig.header.showHeader && styleConfig.header.headerImage && (
          <div className="relative z-10 w-full">
            <img 
              src={styleConfig.header.headerImage} 
              alt="Header" 
              className="w-full object-cover"
              style={{ maxHeight: '200px' }}
            />
          </div>
        )}
        
        {/* Markdown内容区域 */}
        <div className="markdown-container relative z-10">
          <div 
            className="markdown-card"
            style={{
              backgroundColor: getCardBackgroundStyle(),
              color: styleConfig.card.textColor,
              backdropFilter: styleConfig.card.isGlassmorphism ? `blur(${styleConfig.card.blur}px)` : 'none',
              WebkitBackdropFilter: styleConfig.card.isGlassmorphism ? `blur(${styleConfig.card.blur}px)` : 'none',
              boxShadow: getCardShadowStyle(),
              borderRadius: `${styleConfig.card.borderRadius}px`,
              padding: `${styleConfig.card.padding}px`,
              margin: `${styleConfig.card.verticalSpacing}px auto`,
              boxSizing: 'border-box',
              position: 'relative'
            }}
          >
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
                strong: ({node, ...props}) => {
                  if (styleConfig.strong && styleConfig.strong.template) {
                    let style = {};
                    if (styleConfig.strong.template === 'bold') {
                      style = {
                        color: styleConfig.strong.color || '#3F7B7C',
                        fontWeight: 'bold'
                      };
                    } else if (styleConfig.strong.template === 'highlight') {
                      style = {
                        color: 'white',
                        backgroundColor: styleConfig.strong.themeColor || '#3F7B7C',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        display: 'inline-block'
                      };
                    } else if (styleConfig.strong.template === 'wavy line') {
                      style = {
                        textDecoration: 'underline wavy',
                        textDecorationColor: styleConfig.strong.themeColor || '#3F7B7C',
                        textDecorationThickness: '2px'
                      };
                    }
                    return <strong style={style} {...props} />;
                  }
                  return <strong {...props} />;
                },
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
            
            {/* 页脚区域 */}
            {styleConfig.footer.showFooter && (
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                {styleConfig.footer.showBrand && (
                  <div className="flex items-center">
                    {styleConfig.footer.brandLogo && (
                      <img 
                        src={styleConfig.footer.brandLogo} 
                        alt="Brand" 
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    )}
                    <div className="text-xs">
                      <div>{styleConfig.footer.brandName || 'Markdown Styler'}</div>
                      <div>分享于 Markdown Styler</div>
                    </div>
                  </div>
                )}
                
                {styleConfig.footer.showQrCode && styleConfig.footer.qrCode && (
                  <img 
                    src={styleConfig.footer.qrCode} 
                    alt="QR Code" 
                    className="w-12 h-12"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        ${themes[currentTheme]?.styles || themes.wabisabi.styles}
        .markdown-container {
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          padding: 20px;
          position: relative;
        }
        .markdown-body {
          width: 100%;
          overflow-wrap: break-word;
          background: transparent;
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