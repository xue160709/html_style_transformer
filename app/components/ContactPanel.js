'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function ContactPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    // 添加全局点击事件监听器
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-50">
      {/* 点击按钮 */}
      <button 
        className="w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/>
          <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>
        </svg>
      </button>

      {/* 二维码面板 */}
      <div className={`absolute bottom-16 right-0 w-[320px] bg-white rounded-lg shadow-lg p-4 transition-all duration-300 ${
        isOpen ? 'opacity-100 visible transform translate-y-0' : 'opacity-0 invisible transform translate-y-2'
      }`}>
        <p className="text-base text-gray-700 mb-0">
          可以通过以下方式联系作者，欢迎提想法和建议！
        </p>
        <div className="flex gap-2 justify-center">
          <div className="text-center w-[150px]">
            <div className="relative w-[150px] h-[150px]">
              <Image
                src="/xhs.png"
                alt="小红书"
                fill
                sizes="150px"
                style={{ objectFit: 'contain' }}
                className="rounded-lg shadow-md"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">小红书</p>
          </div>
          <div className="text-center w-[150px]">
            <div className="relative w-[150px] h-[150px]">
              <Image
                src="/wx.png"
                alt="公众号"
                fill
                sizes="150px"
                style={{ objectFit: 'contain' }}
                className="rounded-lg shadow-md"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">公众号</p>
          </div>
        </div>
      </div>
    </div>
  );
} 