'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavigationProps {
  user?: {
    name: string;
    email: string;
  };
}

export default function AdminNavigation({ user }: AdminNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/members', label: '회원 관리', icon: '👥' },
    { href: '/admin/patents', label: '특허 관리', icon: '📋' },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl">
      {/* 관리자 정보 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center">
          <span className="text-red-600 text-xl">👑</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1a365d]">관리자 계정</h2>
          <p className="text-gray-600 text-sm">
            {user ? `${user.name} (${user.email})` : '관리자'}
          </p>
        </div>
      </div>

      {/* 네비게이션 메뉴 */}
      <div className="flex gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === item.href
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
} 