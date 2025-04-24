'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Mermaid from 'mermaid';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // 引入代码高亮样式
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { themes } from '../styles/markdownThemes';
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction } from "@/components/ui/toast"
import html2canvas from 'html2canvas';
import { cn } from "@/lib/utils";

export default function MarkdownRenderer({ content }) {
  const [currentTheme, setCurrentTheme] = useState('wabisabi');
  const markdownRef = useRef(null);
  const [showToast, setShowToast] = useState(false);

  const preprocessMarkdown = (text) => {
    // 去除代码块前的缩进
    text = text.replace(/(^|\n)(\s*)```/g, '$1```');
    
    // 处理加粗文本的空格
    text = text.replace(/\*\*([^*]+)\*\*(\s*(?![.,!?;:，。！？；：\n])|(?=[.,!?;:，。！？；：\n]))/g, (match, p1, p2) => {
      // 如果后面是标点或换行，不添加空格
      if (p2.match(/[.,!?;:，。！？；：\n]/)) {
        return `**${p1}**`;
      }
      // 否则确保只有一个空格
      return `**${p1}** `;
    });

    // 确保列表项前有换行
    text = text.replace(/(?<!\n)(- \*\*[^*]+\*\*[^。]*。?)/g, '\n$1');

    return text;
  };

  const copyHtmlToClipboard = async () => {
    if (!markdownRef.current) return;
    
    // 获取当前主题的样式配置
    const currentThemeConfig = themes[currentTheme];
    
    // 创建临时元素
    const tempElement = document.createElement('div');
    tempElement.innerHTML = markdownRef.current.innerHTML;
    
    // 添加主题特定的样式
    const themeStyleElement = document.createElement('style');
    themeStyleElement.textContent = currentThemeConfig.styles;
    
    // 添加全局样式
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      .markdown-body {
        color: ${currentThemeConfig.textColor || '#2c3e50'};
        line-height: ${currentThemeConfig.lineHeight || '1.75'};
        font-family: ${currentThemeConfig.fontFamily || '"Noto Serif SC", SimSun, serif'};
        background: ${currentThemeConfig.background || '#ffffff'};
        padding: 20px;
        width: 100%;
        max-width: 100%;
        overflow-wrap: break-word;
      }
      ${currentThemeConfig.styles}
    `;
    
    tempElement.insertBefore(styleElement, tempElement.firstChild);
    tempElement.insertBefore(themeStyleElement, tempElement.firstChild);

    // 清理所有 Tailwind 类名，但保留 markdown-body 和其他必要的类名
    const elements = tempElement.getElementsByTagName('*');
    for (let element of elements) {
      const classAttr = element.getAttribute('class');
      if (classAttr) {
        const classesToKeep = classAttr.split(' ').filter(cls => 
          cls.startsWith('markdown-') || ['markdown-body'].includes(cls)
        );
        if (classesToKeep.length) {
          element.setAttribute('class', classesToKeep.join(' '));
        } else {
          element.removeAttribute('class');
        }
      }
    }

    try {
      const type = 'text/html';
      const blob = new Blob([tempElement.outerHTML], { type });
      const data = [new ClipboardItem({ [type]: blob })];
      await navigator.clipboard.write(data);
      
      setShowToast(true);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const downloadAsImage = async () => {
    if (!markdownRef.current) return;
    
    try {
      const element = markdownRef.current;
      
      // 等待所有图片加载完成
      const images = element.getElementsByTagName('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // 即使图片加载失败也继续
        });
      });
      
      await Promise.all(imagePromises);
      
      // 添加临时样式使背景为白色
      element.style.backgroundColor = 'white';
      element.style.padding = '20px';
      
      const canvas = await html2canvas(element, {
        width: 1080,
        scale: 2,
        useCORS: true, // 允许跨域图片
        backgroundColor: '#ffffff',
        logging: true, // 开启调试日志
        onclone: (clonedDoc) => {
          // 确保克隆的文档中的样式被正确应用
          const clonedElement = clonedDoc.querySelector('.markdown-body');
          if (clonedElement) {
            clonedElement.style.width = '1080px';
            clonedElement.style.backgroundColor = 'white';
            clonedElement.style.padding = '20px';
          }
        }
      });
      
      // 恢复原始样式
      element.style.backgroundColor = '';
      element.style.padding = '';
      
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = 'markdown-content.png';
      link.click();
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('生成图片失败:', err);
      alert('生成图片失败，请稍后重试');
    }
  };

  const getComputedColor = (variable) => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();
    // 确保返回有效的颜色格式
    return color.startsWith('hsl') ? '#666666' : color;
  };

  useEffect(() => {
    Mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
      themeVariables: {
        'primaryColor': '#1f2937',
        'primaryTextColor': '#ffffff',
        'primaryBorderColor': '#4b5563',
        'lineColor': '#6b7280',
        'secondaryColor': '#f3f4f6',
        'tertiaryColor': '#e5e7eb'
      }
    });
  }, []);

  const renderMermaid = (code) => {
    try {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      // 使用 mermaidAPI.render 而不是直接调用 render
      return new Promise((resolve, reject) => {
        Mermaid.mermaidAPI.render(id, code)
          .then(({ svg }) => {
            resolve({ svg });
          })
          .catch(error => {
            console.error('Mermaid 渲染错误:', error);
            reject(error);
          });
      });
    } catch (e) {
      console.error('Mermaid 初始化错误:', e);
      return Promise.resolve({ svg: '' });
    }
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            {Object.entries(themes).map(([themeKey, theme]) => (
              <Button
                key={themeKey}
                variant={currentTheme === themeKey ? "default" : "outline"}
                onClick={() => setCurrentTheme(themeKey)}
                size="sm"
              >
                {theme.name}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={downloadAsImage}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md transition-all duration-200 hover:shadow-lg"
            >
              下载图片
            </Button>
            <Button
              variant="default"
              onClick={copyHtmlToClipboard}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md transition-all duration-200 hover:shadow-lg"
            >
              复制富文本
            </Button>
          </div>
        </div>

        <div 
          ref={markdownRef}
          className="markdown-container"
        >
          <ReactMarkdown 
            rehypePlugins={[rehypeRaw,rehypeHighlight]} 
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
                  crossOrigin="anonymous" // 添加跨域支持
                  loading="eager" // 立即加载图片
                  style={{ 
                    maxWidth: '100%',
                    display: 'block', // 确保图片正确显示
                    margin: '1em 0' 
                  }}
                />
              ),
              code: ({node, inline, className, children, ...props}) => {
                const match = /language-(\w+)/.exec(className || '');
                const language = match && match[1];
                
                if (language === 'mermaid') {
                  const [mermaidSvg, setMermaidSvg] = useState('');
                  
                  useEffect(() => {
                    renderMermaid(String(children))
                      .then(({ svg }) => {
                        setMermaidSvg(svg);
                      })
                      .catch(() => {
                        setMermaidSvg('');
                      });
                  }, [children]);
                  
                  return mermaidSvg ? (
                    <div className="my-4 p-4 bg-background border rounded-lg shadow-sm">
                      <div dangerouslySetInnerHTML={{ __html: mermaidSvg }} />
                    </div>
                  ) : (
                    <code className={cn(
                      "block w-full p-4 bg-muted rounded-lg",
                      className
                    )} {...props}>{children}</code>
                  );
                }
                return inline ? (
                  <code className="px-1 py-0.5 bg-muted rounded text-sm" {...props}>
                    {children}
                  </code>
                ) : (
                  <code className={cn(
                    "block w-full p-4 bg-muted rounded-lg overflow-x-auto",
                    className
                  )} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {preprocessMarkdown(content)}
          </ReactMarkdown>
        </div>

        <style jsx global>{`
          ${themes[currentTheme].styles}
          .markdown-container {
            width: 100%;
            max-width: 100%;
            overflow: hidden;
          }
          .markdown-body {
            width: 100%;
            overflow-wrap: break-word;
          }
          .markdown-body img {
            max-width: 100%;
            height: auto;
          }
          .markdown-container pre{
            background-color: transparent;
          }
        `}</style>
      </Card>
      
      <ToastProvider>
        <Toast open={showToast} onOpenChange={setShowToast}>
          <ToastTitle>操作成功</ToastTitle>
          <ToastDescription>
            {showToast === 'copy' ? '内容已复制到剪贴板' : '图片已成功下载'}
          </ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    </>
  );
} 