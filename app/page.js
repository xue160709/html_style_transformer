'use client';
import { useState, useEffect } from 'react';
import TurndownService from 'turndown';
import MarkdownRenderer from './components/MarkdownRenderer';
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Settings } from 'lucide-react';
import SettingsPanel from './components/SettingsPanel';

// 将 MainContent 组件移到外部
function MainContent({ markdown, handleContentChange, handlePaste, isMobile, currentTheme }) {
  return (
    <div className={`${isMobile ? 'flex-1' : 'flex h-[calc(100vh-64px)]'}`}>
      {isMobile ? (
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">编辑</TabsTrigger>
            <TabsTrigger value="preview">预览</TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="h-[calc(100vh-120px)]">
            <ScrollArea className="h-full">
              <Textarea
                className="w-full resize-none min-h-[calc(100vh-120px)]"
                value={markdown}
                onChange={handleContentChange}
                onPaste={handlePaste}
                placeholder="在这里粘贴 Markdown 或富文本内容..."
              />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="preview" className="h-[calc(100vh-120px)]">
            <ScrollArea className="h-full w-full">
              <div className="prose dark:prose-invert w-full max-w-none">
                <MarkdownRenderer content={markdown} isMobile={isMobile} currentTheme={currentTheme} />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      ) : (
        <>
          {/* 左侧编辑区 */}
          <div className="w-[40%] p-4 overflow-hidden">
            <ScrollArea className="h-full">
              <Textarea
                className="w-full resize-none min-h-[calc(100vh-120px)]"
                value={markdown}
                onChange={handleContentChange}
                onPaste={handlePaste}
                placeholder="在这里粘贴 Markdown 或富文本内容..."
              />
            </ScrollArea>
          </div>
          
          <Separator orientation="vertical" />
          
          {/* 右侧预览区 */}
          <div className="w-[60%] p-4 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="prose dark:prose-invert w-full max-w-none">
                <MarkdownRenderer content={markdown} isMobile={isMobile} currentTheme={currentTheme} />
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const [markdown, setMarkdown] = useState('');
  const turndownService = new TurndownService();
  const [isMobile, setIsMobile] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('wabisabi');
  const [showSettings, setShowSettings] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };
      
      handleResize(); // 初始化
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);
  
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
      
      if (htmlContent) {
        const markdownContent = turndownService.turndown(htmlContent);
        setMarkdown(markdownContent);
      } else {
        const textContent = clipboardData.getData('text/plain');
        setMarkdown(textContent);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部栏 */}
      <div className="h-16 px-4 flex items-center justify-between border-b sticky top-0 z-50 bg-white dark:bg-gray-800">
        <h1 className="text-lg font-semibold">Markdown 编辑器</h1>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="flex flex-1 relative">
        <div className={`flex-1 ${!isMobile && 'mr-[240px]'}`}>
          <MainContent
            markdown={markdown}
            handleContentChange={handleContentChange}
            handlePaste={handlePaste}
            isMobile={isMobile}
            currentTheme={currentTheme}
          />
        </div>
        
        {/* 设置面板 */}
        {(isMobile ? showSettings : true) && (
          <div className={`${isMobile ? '' : 'fixed right-0 top-16 bottom-0 w-[240px] border-l bg-background'}`}>
            <SettingsPanel
              currentTheme={currentTheme}
              setCurrentTheme={setCurrentTheme}
              onClose={() => setShowSettings(false)}
              isMobile={isMobile}
            />
          </div>
        )}
      </div>
    </div>
  );
}
