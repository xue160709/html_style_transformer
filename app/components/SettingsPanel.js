'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Download, Copy, Image, X } from 'lucide-react';
import { themes } from '../styles/markdownThemes';
import html2canvas from 'html2canvas';
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription } from "@/components/ui/toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPanel({ currentTheme, setCurrentTheme, onClose, isMobile, setMarkdownStyle }) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [styleConfig, setStyleConfig] = useState({
    header: {
      showHeader: false,
      headerImage: '',
    },
    background: {
      backgroundColor: '#ffffff',
      backgroundImage: 'none',
    },
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
      verticalSpacing: 20,
    },
    footer: {
      showFooter: false,
      showQrCode: false,
      showBrand: false,
      qrCode: '',
      brandName: 'Markdown Styler',
      brandLogo: '',
    },
    strong: {
      template: 'bold',
      color: '#3F7B7C',
      themeColor: '#3F7B7C',
      fontWeight: 'bold',
      backgroundColor: 'transparent',
      textDecorationLine: 'none',
      textDecorationStyle: 'none',
      textDecorationColor: 'none',
    }
  });

  // 当样式配置改变时，将配置传递给父组件
  useEffect(() => {
    setMarkdownStyle && setMarkdownStyle(styleConfig);
  }, [styleConfig, setMarkdownStyle]);

  const updateStyleConfig = (section, key, value) => {
    setStyleConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateNestedStyleConfig = (section, subSection, key, value) => {
    setStyleConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section][subSection],
          [key]: value
        }
      }
    }));
  };

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

  const applyBackgroundStyle = (bg) => {
    updateStyleConfig('background', 'backgroundColor', bg.backgroundColor);
    updateStyleConfig('background', 'backgroundImage', bg.backgroundImage);
  };

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

  const handleFileUpload = (event, section, key) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      updateStyleConfig(section, key, e.target.result);
    };
    reader.readAsDataURL(file);
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
            <div className="p-4 space-y-4">
              <Tabs defaultValue="theme">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="theme">主题</TabsTrigger>
                  <TabsTrigger value="header">头部</TabsTrigger>
                  <TabsTrigger value="background">背景</TabsTrigger>
                  <TabsTrigger value="card">卡片</TabsTrigger>
                  <TabsTrigger value="footer">尾部</TabsTrigger>
                </TabsList>
                
                {/* 主题设置 */}
                <TabsContent value="theme" className="space-y-4">
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
                        <Image className="h-4 w-4 mr-2" />
                        复制图片
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadAsImage}
                        className="w-full justify-start"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        下载图片
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyHtmlToClipboard}
                        className="w-full justify-start"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        复制富文本
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {/* 头部设置 */}
                <TabsContent value="header" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-header" className="text-sm font-medium">显示头图</Label>
                      <Switch 
                        id="show-header" 
                        checked={styleConfig.header.showHeader}
                        onCheckedChange={(checked) => updateStyleConfig('header', 'showHeader', checked)}
                      />
                    </div>
                    
                    {styleConfig.header.showHeader && (
                      <div className="space-y-2">
                        <Label htmlFor="header-image" className="text-sm font-medium">上传头图</Label>
                        <Input 
                          id="header-image" 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'header', 'headerImage')}
                        />
                        {styleConfig.header.headerImage && (
                          <div className="mt-2">
                            <img 
                              src={styleConfig.header.headerImage} 
                              alt="头图预览" 
                              className="max-w-full h-auto rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* 背景设置 */}
                <TabsContent value="background" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">背景样式</h3>
                    
                    <div className="grid grid-cols-5 gap-1">
                      <button 
                        className="w-full h-8 rounded border" 
                        style={{
                          backgroundColor: "#f5fffa",
                          backgroundImage: `radial-gradient(circle at 90% 10%, rgba(128, 216, 168, 0.4) 0%, rgba(128, 216, 168, 0.1) 30%, transparent 70%),
                                          radial-gradient(circle at 90% 90%, rgba(176, 224, 230, 0.4) 0%, rgba(176, 224, 230, 0.1) 25%, transparent 60%)`
                        }}
                        onClick={() => applyBackgroundStyle({
                          backgroundColor: "#f5fffa",
                          backgroundImage: `radial-gradient(circle at 90% 10%, rgba(128, 216, 168, 0.4) 0%, rgba(128, 216, 168, 0.1) 30%, transparent 70%),
                                          radial-gradient(circle at 90% 90%, rgba(176, 224, 230, 0.4) 0%, rgba(176, 224, 230, 0.1) 25%, transparent 60%)`
                        })}
                      />
                      
                      <button 
                        className="w-full h-8 rounded border" 
                        style={{
                          backgroundColor: "#fff5f5",
                          backgroundImage: `radial-gradient(circle at 90% 10%, rgba(255, 182, 193, 0.4) 0%, rgba(255, 182, 193, 0.1) 30%, transparent 70%),
                                          radial-gradient(circle at 85% 85%, rgba(221, 160, 221, 0.4) 0%, rgba(221, 160, 221, 0.1) 25%, transparent 60%)`
                        }}
                        onClick={() => applyBackgroundStyle({
                          backgroundColor: "#fff5f5",
                          backgroundImage: `radial-gradient(circle at 90% 10%, rgba(255, 182, 193, 0.4) 0%, rgba(255, 182, 193, 0.1) 30%, transparent 70%),
                                          radial-gradient(circle at 85% 85%, rgba(221, 160, 221, 0.4) 0%, rgba(221, 160, 221, 0.1) 25%, transparent 60%)`
                        })}
                      />
                      
                      <button 
                        className="w-full h-8 rounded border" 
                        style={{
                          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%),
                                          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%),
                                          radial-gradient(circle at 80% 80%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%),
                                          radial-gradient(circle at 10% 90%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%)`,
                          backgroundColor: "#7c9885"
                        }}
                        onClick={() => applyBackgroundStyle({
                          backgroundColor: "#7c9885",
                          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%),
                                          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%),
                                          radial-gradient(circle at 80% 80%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%),
                                          radial-gradient(circle at 10% 90%, rgba(255,255,255,0.8) 5%, rgba(255,255,255,0.1) 25%)`
                        })}
                      />
                      
                      <button 
                        className="w-full h-8 rounded border" 
                        style={{
                          backgroundColor: "#f3f4f6",
                          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)`
                        }}
                        onClick={() => applyBackgroundStyle({
                          backgroundColor: "#f3f4f6",
                          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)`
                        })}
                      />
                      
                      <button 
                        className="w-full h-8 rounded border" 
                        style={{
                          backgroundColor: "#2d3436",
                          backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0) 70%),
                                          radial-gradient(circle at 60% 40%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)`
                        }}
                        onClick={() => applyBackgroundStyle({
                          backgroundColor: "#2d3436",
                          backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0) 70%),
                                          radial-gradient(circle at 60% 40%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)`
                        })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-5 gap-1">
                      <button 
                        className="w-full h-8 rounded border" 
                        style={{
                          backgroundColor: "#FFDEE9",
                          backgroundImage: "linear-gradient(0deg, #FFDEE9 0%, #B5FFFC 100%)"
                        }}
                        onClick={() => applyBackgroundStyle({
                          backgroundColor: "#FFDEE9",
                          backgroundImage: "linear-gradient(0deg, #FFDEE9 0%, #B5FFFC 100%)"
                        })}
                      />
                      
                      <button 
                        className="w-full h-8 rounded border" 
                        style={{
                          backgroundColor: "#21D4FD",
                          backgroundImage: "linear-gradient(0deg, #21D4FD 0%, #B721FF 100%)"
                        }}
                        onClick={() => applyBackgroundStyle({
                          backgroundColor: "#21D4FD",
                          backgroundImage: "linear-gradient(0deg, #21D4FD 0%, #B721FF 100%)"
                        })}
                      />
                      
                      <button 
                        className="w-full h-8 rounded border" 
                        style={{
                          backgroundColor: "#FFE53B",
                          backgroundImage: "linear-gradient(180deg, #FFE53B 0%, #FF2525 74%)"
                        }}
                        onClick={() => applyBackgroundStyle({
                          backgroundColor: "#FFE53B",
                          backgroundImage: "linear-gradient(180deg, #FFE53B 0%, #FF2525 74%)"
                        })}
                      />
                      
                      <button 
                        className="w-full h-8 rounded border" 
                        style={{
                          backgroundColor: "#4158D0",
                          backgroundImage: "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)"
                        }}
                        onClick={() => applyBackgroundStyle({
                          backgroundColor: "#4158D0",
                          backgroundImage: "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)"
                        })}
                      />
                      
                      <button 
                        className="w-full h-8 rounded border" 
                        style={{
                          backgroundColor: "#ffffff",
                          backgroundImage: "none"
                        }}
                        onClick={() => applyBackgroundStyle({
                          backgroundColor: "#ffffff",
                          backgroundImage: "none"
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="background-css" className="text-sm font-medium">CSS 代码</Label>
                      <Input 
                        id="background-css" 
                        placeholder="background-color: #fff; background-image: linear-gradient(...)" 
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          let backgroundColor = '';
                          let backgroundImage = '';

                          // 将用户输入的内容按行拆分
                          const lines = inputValue.split(';').map(line => line.trim()).filter(line => line);

                          // 解析每一行内容
                          lines.forEach(line => {
                            if (line.startsWith('background-color:')) {
                              backgroundColor = line.split(':')[1].trim();
                            } else if (line.startsWith('background-image:')) {
                              backgroundImage = line.split(':')[1].trim();
                            }
                          });

                          // 检查是否成功解析到背景颜色和背景图片
                          if (backgroundColor && backgroundImage) {
                            applyBackgroundStyle({
                              backgroundColor: backgroundColor,
                              backgroundImage: backgroundImage
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                {/* 卡片设置 */}
                <TabsContent value="card" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">卡片样式</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="card-background-color" className="text-sm font-medium">卡片背景色</Label>
                        <div className="flex items-center">
                          <Input 
                            id="card-background-color" 
                            type="color" 
                            value={styleConfig.card.backgroundColor}
                            className="w-12 h-8"
                            onChange={(e) => updateStyleConfig('card', 'backgroundColor', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="card-text-color" className="text-sm font-medium">文字颜色</Label>
                        <div className="flex items-center">
                          <Input 
                            id="card-text-color" 
                            type="color" 
                            value={styleConfig.card.textColor}
                            className="w-12 h-8"
                            onChange={(e) => updateStyleConfig('card', 'textColor', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="card-opacity" className="text-sm font-medium">透明度</Label>
                          <span className="text-xs">{styleConfig.card.opacity.toFixed(2)}</span>
                        </div>
                        <Slider
                          id="card-opacity"
                          value={[styleConfig.card.opacity * 100]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(value) => updateStyleConfig('card', 'opacity', value[0] / 100)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="card-border-radius" className="text-sm font-medium">边框圆角</Label>
                          <span className="text-xs">{styleConfig.card.borderRadius}px</span>
                        </div>
                        <Slider
                          id="card-border-radius"
                          value={[styleConfig.card.borderRadius]}
                          min={0}
                          max={20}
                          onValueChange={(value) => updateStyleConfig('card', 'borderRadius', value[0])}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="card-padding" className="text-sm font-medium">内边距</Label>
                          <span className="text-xs">{styleConfig.card.padding}px</span>
                        </div>
                        <Slider
                          id="card-padding"
                          value={[styleConfig.card.padding]}
                          min={0}
                          max={40}
                          onValueChange={(value) => updateStyleConfig('card', 'padding', value[0])}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="glass-effect" className="text-sm font-medium">玻璃效果</Label>
                        <Switch 
                          id="glass-effect" 
                          checked={styleConfig.card.isGlassmorphism}
                          onCheckedChange={(checked) => updateStyleConfig('card', 'isGlassmorphism', checked)}
                        />
                      </div>
                      
                      {styleConfig.card.isGlassmorphism && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="blur-level" className="text-sm font-medium">模糊程度</Label>
                            <span className="text-xs">{styleConfig.card.blur}px</span>
                          </div>
                          <Slider
                            id="blur-level"
                            value={[styleConfig.card.blur]}
                            min={0}
                            max={20}
                            onValueChange={(value) => updateStyleConfig('card', 'blur', value[0])}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="card-shadow" className="text-sm font-medium">卡片阴影</Label>
                        <Switch 
                          id="card-shadow" 
                          checked={styleConfig.card.hasShadow}
                          onCheckedChange={(checked) => updateStyleConfig('card', 'hasShadow', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* 尾部设置 */}
                <TabsContent value="footer" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-footer" className="text-sm font-medium">显示尾部</Label>
                      <Switch 
                        id="show-footer" 
                        checked={styleConfig.footer.showFooter}
                        onCheckedChange={(checked) => updateStyleConfig('footer', 'showFooter', checked)}
                      />
                    </div>
                    
                    {styleConfig.footer.showFooter && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-qrcode" className="text-sm font-medium">显示二维码</Label>
                          <Switch 
                            id="show-qrcode" 
                            checked={styleConfig.footer.showQrCode}
                            onCheckedChange={(checked) => updateStyleConfig('footer', 'showQrCode', checked)}
                          />
                        </div>
                        
                        {styleConfig.footer.showQrCode && (
                          <div className="space-y-2">
                            <Label htmlFor="qrcode-image" className="text-sm font-medium">上传二维码</Label>
                            <Input 
                              id="qrcode-image" 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'footer', 'qrCode')}
                            />
                            {styleConfig.footer.qrCode && (
                              <div className="mt-2">
                                <img 
                                  src={styleConfig.footer.qrCode} 
                                  alt="二维码预览" 
                                  className="max-w-[100px] h-auto"
                                />
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-brand" className="text-sm font-medium">显示品牌</Label>
                          <Switch 
                            id="show-brand" 
                            checked={styleConfig.footer.showBrand}
                            onCheckedChange={(checked) => updateStyleConfig('footer', 'showBrand', checked)}
                          />
                        </div>
                        
                        {styleConfig.footer.showBrand && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="brand-name" className="text-sm font-medium">品牌名称</Label>
                              <Input 
                                id="brand-name" 
                                value={styleConfig.footer.brandName}
                                onChange={(e) => updateStyleConfig('footer', 'brandName', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="brand-logo" className="text-sm font-medium">上传品牌logo</Label>
                              <Input 
                                id="brand-logo" 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'footer', 'brandLogo')}
                              />
                              {styleConfig.footer.brandLogo && (
                                <div className="mt-2">
                                  <img 
                                    src={styleConfig.footer.brandLogo} 
                                    alt="品牌logo预览" 
                                    className="max-w-[100px] h-auto"
                                  />
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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