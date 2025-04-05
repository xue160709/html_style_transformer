'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { themes } from '../styles/markdownThemes';
import { Button } from "@/components/ui/button"
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { ChevronRight, Settings, Download, Copy, Image, Sun, Moon } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function MarkdownRenderer({ content, isMobile }) {
  const [currentTheme, setCurrentTheme] = useState('wabisabi');
  const [isMounted, setIsMounted] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const markdownRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const preprocessMarkdown = (text) => {
    return text.replace(/\*\*[^*]+\*\*(?![.,!?;:，。！？；：])/g, match => match + ' ');
  };

  const copyHtmlToClipboard = async () => {
    if (!markdownRef.current || !isMounted) return;
    
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
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        const type = 'text/html';
        const blob = new Blob([tempElement.outerHTML], { type });
        const data = [new ClipboardItem({ [type]: blob })];
        await navigator.clipboard.write(data);
        setShowToast(true);
      }
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const copyAsImage = async () => {
    if (!markdownRef.current || !isMounted) return;
    
    try {
      // 确保文档有焦点
      if (!document.hasFocus()) {
        document.body.focus();
      }
      
      const element = markdownRef.current;
      
      // 等待所有图片加载完成
      const images = element.getElementsByTagName('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      
      await Promise.all(imagePromises);
      
      // 添加临时样式
      element.style.backgroundColor = 'white';
      element.style.padding = '20px';
      
      const canvas = await html2canvas(element, {
        width: 1080,
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
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

      try {
        // 尝试使用新的 Clipboard API
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        setToastMessage('图片已复制到剪贴板');
      } catch (clipboardError) {
        // 如果 Clipboard API 失败，提供备选方案：打开新窗口让用户手动复制
        const imageUrl = canvas.toDataURL('image/png');
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <img src="${imageUrl}" style="max-width: 100%;" />
            <div style="margin-top: 10px; text-align: center;">
              <p>请右键点击图片并选择"复制图片"</p>
            </div>
          `);
          setToastMessage('请在新窗口中右键复制图片');
        } else {
          throw new Error('无法打开新窗口，请检查是否被浏览器拦截');
        }
      }
      
      setShowToast(true);
    } catch (err) {
      console.error('复制图片失败:', err);
      setToastMessage(err.message || '复制图片失败，请重试');
      setShowToast(true);
    }
  };

  const downloadAsImage = async () => {
    if (!markdownRef.current || !isMounted) return;
    
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
        logging: false, // 关闭调试日志
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
      
      if (typeof window !== 'undefined') {
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = image;
        link.download = 'markdown-content.png';
        link.click();
        
        setShowToast(true);
      }
    } catch (err) {
      console.error('导出图片失败:', err);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="relative w-full h-full">
      {/* 预览区域 */}
      <div className="h-full">
        {/* 顶部工具栏 */}
        <div className="h-14 border-b flex items-center justify-between px-4 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold">预览</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowWorkspace(!showWorkspace)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Markdown 预览内容 */}
        <div className="h-[calc(100%-3.5rem)] overflow-auto">
          <div ref={markdownRef} className="markdown-container">
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
      </div>

      {/* 工作区侧边栏 */}
      <div
        className={`fixed ${isMobile ? 'inset-x-0 bottom-0 h-[80vh] rounded-t-xl' : 'right-0 top-0 h-full w-[320px]'} 
        bg-white dark:bg-gray-800 border-l transform transition-transform duration-300 
        ${showWorkspace ? 'translate-y-0' : isMobile ? 'translate-y-full' : 'translate-x-full'} z-50`}
      >
        <div className="h-14 border-b flex items-center justify-between px-4">
          <h2 className="font-semibold">设置</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowWorkspace(false)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-6 overflow-auto" style={{ height: 'calc(100% - 3.5rem)' }}>
          {/* 主题选择 */}
          <div className="space-y-2">
            <h3 className="font-medium">主题</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(themes).map(([themeKey, theme]) => (
                <Button
                  key={themeKey}
                  variant={currentTheme === themeKey ? "default" : "outline"}
                  onClick={() => setCurrentTheme(themeKey)}
                  size="sm"
                  className="w-full"
                >
                  {theme.name}
                </Button>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-2">
            <h3 className="font-medium">操作</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={copyAsImage}
                className="w-full flex items-center gap-2"
              >
                <Image className="h-4 w-4" />
                复制图片
              </Button>
              <Button
                variant="outline"
                onClick={downloadAsImage}
                className="w-full flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                下载图片
              </Button>
              <Button
                variant="outline"
                onClick={copyHtmlToClipboard}
                className="w-full flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                复制富文本
              </Button>
            </div>
          </div>

          {/* 其他设置选项 */}
          <div className="space-y-2">
            <h3 className="font-medium">图片设置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">宽度</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
                  defaultValue="440"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">高度</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700"
                  defaultValue="586"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast提示 */}
      <ToastProvider>
        <Toast open={showToast} onOpenChange={setShowToast}>
          <ToastTitle>操作提示</ToastTitle>
          <ToastDescription>{toastMessage}</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>

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
          color: ${isDarkMode ? '#ffffff' : themes[currentTheme].textColor || '#2c3e50'};
          background: ${isDarkMode ? 'transparent' : themes[currentTheme].background || '#ffffff'};
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