'use client';
import { useState, useEffect } from 'react';
import TurndownService from 'turndown';
import MarkdownRenderer from './components/MarkdownRenderer';
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import ContactPanel from './components/ContactPanel';

export default function Home() {
  const [markdown, setMarkdown] = useState('');
  const turndownService = new TurndownService();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // 加载默认的Markdown内容
    fetch('/md/1.md')
      .then(response => response.text())
      .then(content => {
        setMarkdown(content);
      })
      .catch(error => {
        console.error('加载Markdown文件失败:', error);
        setMarkdown('# 加载失败\n\n请重试...');
      });
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize(); // 初始化
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const handleContentChange = (e) => {
    setMarkdown(e.target.value);
  };
  
  const handlePaste = (e) => {
    const textarea = e.target;
    const isAllSelected = 
      textarea.selectionStart === 0 && 
      textarea.selectionEnd === textarea.value.length;
    const isEmpty = textarea.value.length === 0;

    if (isAllSelected || isEmpty) {
      e.preventDefault();
      const clipboardData = e.clipboardData || window.clipboardData;
      const htmlContent = clipboardData.getData('text/html');
      const textContent = clipboardData.getData('text/plain');
      
      if (htmlContent) {
        // 如果是 HTML 内容，转换为 Markdown
        let markdownContent = turndownService.turndown(htmlContent);
        // 手动处理转义字符
        markdownContent = markdownContent.replace(/\\([`*_{}[\]()#+\-.!])/g, '$1');
        setMarkdown(markdownContent);
      } else if (textContent) {
        // 如果是纯文本内容，直接设置为 Markdown
        setMarkdown(textContent);
      }
    }
    // 如果不是全选且不为空，则使用默认的粘贴行为
  };

  return (
    <div className="flex h-screen">
      {/* 左侧编辑区 */}
      <div className="w-1/2 p-4 overflow-hidden">
        <ScrollArea className="h-full">
          <Textarea
            className="min-h-[90vh] w-full resize-none"
            value={markdown}
            onChange={handleContentChange}
            onPaste={handlePaste}
            placeholder="在这里粘贴 Markdown 或富文本内容..."
          />
        </ScrollArea>
      </div>
      
      <Separator orientation="vertical" />
      
      {/* 右侧预览区 */}
      <div className="w-1/2 p-4 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="prose dark:prose-invert w-full max-w-none">
            <MarkdownRenderer content={markdown} isMobile={isMobile} />
          </div>
        </ScrollArea>
      </div>
      
      {/* 添加联系面板组件 */}
      <ContactPanel />
    </div>
  );
}
