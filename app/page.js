'use client';
import { useState, useEffect } from 'react';
import MarkdownRenderer from './components/MarkdownRenderer';
import SettingsPanel from './components/SettingsPanel';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Resizable } from 're-resizable';

// 默认的Markdown内容
const DefaultContent = `# Markdown 样式转换器

这是一个简单的**Markdown样式转换器**，你可以：

- 编辑左侧的Markdown内容
- 在右侧查看实时渲染结果
- 使用设置面板自定义样式

## 支持的功能

1. 实时预览
2. 多种主题切换
3. 自定义背景、卡片样式
4. 添加页眉和页脚
5. 导出为图片或HTML

> 这是一个引用，可以用来强调重要内容

\`\`\`javascript
// 这是一段代码
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

![示例图片](https://images.unsplash.com/photo-1604580864964-0462f5d5b1a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80)

祝您使用愉快！
`;

export default function Home() {
  const [content, setContent] = useState(DefaultContent);
  const [currentTheme, setCurrentTheme] = useState('wabisabi');
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [markdownStyle, setMarkdownStyle] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 初始检查
    checkMobile();
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', checkMobile);
    
    // 清理监听
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  return (
    <main className="flex h-screen flex-col">
      <header className="bg-background border-b p-4 flex-shrink-0">
        <div className="container flex justify-between items-center">
          <h1 className="text-xl font-semibold">Markdown 样式转换器</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {!isMobile && (
          <Resizable
            defaultSize={{ width: '40%', height: '100%' }}
            minWidth="30%"
            maxWidth="70%"
            enable={{ right: true }}
            className="border-r bg-background shadow-inner flex"
          >
            <textarea
              className="w-full p-6 resize-none focus:outline-none bg-background/50 font-mono text-[15px] leading-relaxed placeholder:text-muted-foreground/50 selection:bg-muted selection:text-foreground transition-colors duration-200"
              value={content}
              onChange={handleContentChange}
              placeholder="输入 Markdown 内容..."
              spellCheck="false"
            />
          </Resizable>
        )}

        <div className={`flex-1 h-full overflow-auto relative ${isMobile ? 'w-full' : ''}`}>
          {isMobile ? (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="edit">编辑器</TabsTrigger>
                <TabsTrigger value="preview">预览</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="p-4 bg-muted/20 h-[calc(100vh-8rem)]">
                <textarea
                  className="w-full h-full p-4 resize-none focus:outline-none bg-transparent border rounded-md"
                  value={content}
                  onChange={handleContentChange}
                  placeholder="输入 Markdown 内容..."
                />
              </TabsContent>
              <TabsContent value="preview" className="h-[calc(100vh-8rem)]">
                <MarkdownRenderer 
                  content={content} 
                  isMobile={isMobile} 
                  currentTheme={currentTheme} 
                  markdownStyle={markdownStyle}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="h-full">
              <MarkdownRenderer 
                content={content} 
                isMobile={isMobile} 
                currentTheme={currentTheme} 
                markdownStyle={markdownStyle}
              />
            </div>
          )}
        </div>

        {showSettingsPanel && (
          <div className="w-[300px] border-l h-full bg-background shrink-0">
            <SettingsPanel 
              currentTheme={currentTheme} 
              setCurrentTheme={setCurrentTheme} 
              onClose={() => setShowSettingsPanel(false)} 
              isMobile={isMobile} 
              setMarkdownStyle={setMarkdownStyle}
            />
          </div>
        )}

        {isMobile && showSettingsPanel && (
          <SettingsPanel 
            currentTheme={currentTheme} 
            setCurrentTheme={setCurrentTheme} 
            onClose={() => setShowSettingsPanel(false)} 
            isMobile={isMobile}
            setMarkdownStyle={setMarkdownStyle}
          />
        )}
      </div>
    </main>
  );
}
