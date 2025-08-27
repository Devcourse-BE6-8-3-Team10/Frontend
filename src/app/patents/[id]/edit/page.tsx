'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/utils/apiClient';
import { useAuth } from '@/contexts/AuthContext';

export default function PatentEditPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
  });

  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchPostDetail = async () => {
    try {
      const response = await apiClient.get(`/api/posts/${postId}`);
      const post = response.data.data;
      setFormData({
        title: post.title,
        description: post.description,
        category: post.category,
        price: post.price,
      });
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      alert('게시글 정보를 불러오는 데 실패했습니다.');
      router.push('/patents');
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading) {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      fetchPostDetail(); // 내부 함수 호출
    }
  }
}, [authLoading, isAuthenticated, router, postId]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'price') {
      const rawValue = value.replace(/,/g, '');
      const parsedValue = parseInt(rawValue) || 0;
      setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await apiClient.patch(`/api/posts/${postId}`, formData);
      alert('게시글이 수정되었습니다.');
      router.push(`/patents/${postId}`);
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      alert('게시글 수정에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a4fa2] via-[#1a365d] to-[#1a365d]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">게시글 수정</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">기술분야</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">기술분야를 선택하세요</option>
                <option value="PRODUCT">물건발명</option>
                <option value="METHOD">방법발명</option>
                <option value="USE">용도발명</option>
                <option value="DESIGN">디자인권</option>
                <option value="TRADEMARK">상표권</option>
                <option value="COPYRIGHT">저작권</option>
                <option value="ETC">기타</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">가격 (원)</label>
              <input
                type="text"
                name="price"
                value={formData.price === 0 ? '' : formData.price.toLocaleString()}
                onChange={handleChange}
                onFocus={(e) => e.target.value = formData.price === 0 ? '' : formData.price.toString()}
                onBlur={(e) => {
                  const value = parseInt(e.target.value.replace(/,/g, '')) || 0;
                  e.target.value = value === 0 ? '' : value.toLocaleString();
                  setFormData((prev) => ({ ...prev, price: value }));
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                저장하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}