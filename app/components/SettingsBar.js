'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Download, Copy, Image, Settings } from 'lucide-react';
import { themes } from '../styles/markdownThemes';
import html2canvas from 'html2canvas';
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription } from "@/components/ui/toast"

export default function SettingsBar({ currentTheme, setCurrentTheme }) {
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
    <div className="h-16 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-semibold">主题设置</h1>
        <div className="flex items-center space-x-1">
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
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={copyAsImage}
          className="flex items-center gap-1"
        >
          <Image className="h-4 w-4" />
          复制图片
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadAsImage}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          下载图片
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={copyHtmlToClipboard}
          className="flex items-center gap-1"
        >
          <Copy className="h-4 w-4" />
          复制富文本
        </Button>
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