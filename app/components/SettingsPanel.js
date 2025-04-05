'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Download, Copy, Image, X } from 'lucide-react';
import { themes } from '../styles/markdownThemes';
import html2canvas from 'html2canvas';
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription } from "@/components/ui/toast"

export default function SettingsPanel({ currentTheme, setCurrentTheme, onClose, isMobile }) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const copyAsImage = async () => {
    const markdownBody = document.querySelector('.markdown-body');
    if (!markdownBody) return;
    
    try {
      const element = markdownBody;
      
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
      
      element.style.backgroundColor = '';
      element.style.padding = '';

      try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        setToastMessage('图片已复制到剪贴板');
      } catch (clipboardError) {
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
    const markdownBody = document.querySelector('.markdown-body');
    if (!markdownBody) return;
    
    try {
      const element = markdownBody;
      
      const images = element.getElementsByTagName('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      
      await Promise.all(imagePromises);
      
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
      
      element.style.backgroundColor = '';
      element.style.padding = '';
      
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = 'markdown-content.png';
      link.click();
      
      setToastMessage('图片已下载');
      setShowToast(true);
    } catch (err) {
      console.error('导出图片失败:', err);
      setToastMessage('导出图片失败，请重试');
      setShowToast(true);
    }
  };

  const copyHtmlToClipboard = async () => {
    const markdownBody = document.querySelector('.markdown-body');
    if (!markdownBody) return;
    
    const currentThemeConfig = themes[currentTheme];
    
    const tempElement = document.createElement('div');
    tempElement.innerHTML = markdownBody.innerHTML;
    
    const themeStyleElement = document.createElement('style');
    themeStyleElement.textContent = currentThemeConfig.styles;
    
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
      setToastMessage('富文本已复制到剪贴板');
      setShowToast(true);
    } catch (err) {
      console.error('复制失败:', err);
      setToastMessage('复制失败，请重试');
      setShowToast(true);
    }
  };

  return (
    <div className={`${isMobile ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : ''}`}>
      <div className={`${isMobile ? 'fixed inset-y-0 right-0 w-[300px] bg-background shadow-lg' : 'h-full'}`}>
        <div className="flex flex-col h-full">
          {/* 标题栏 */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">设置</h2>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* 设置内容 */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* 主题设置 */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">主题</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(themes).map(([themeKey, theme]) => (
                    <Button
                      key={themeKey}
                      variant={currentTheme === themeKey ? "default" : "outline"}
                      onClick={() => setCurrentTheme(themeKey)}
                      className="w-full justify-start"
                      size="sm"
                    >
                      {theme.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 导出选项 */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">导出</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAsImage}
                    className="w-full justify-start"
                  >
                    <Image className="h-4 w-4" />
                    复制图片
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadAsImage}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4" />
                    下载图片
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyHtmlToClipboard}
                    className="w-full justify-start"
                  >
                    <Copy className="h-4 w-4" />
                    复制富文本
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      <ToastProvider>
        <Toast open={showToast} onOpenChange={setShowToast}>
          <ToastTitle>操作提示</ToastTitle>
          <ToastDescription>{toastMessage}</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    </div>
  );
}