'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/utils/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function PatentRegisterPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
  const [shakeErrors, setShakeErrors] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="pb-10">
        <section className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">로딩 중...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // 해당 필드의 에러 상태 및 흔들림 상태 초기화
    setValidationErrors((prev) => ({ ...prev, [name]: false }));
    setShakeErrors((prev) => ({ ...prev, [name]: false }));

    if (name === 'price') {
      const rawValue = value.replace(/,/g, ''); // 쉼표 제거
      const parsedValue = parseInt(rawValue) || 0;
      setFormData((prev) => ({
        ...prev,
        [name]: parsedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const postResponse = await apiClient.post('/api/posts', formData);
      const postId = postResponse.data.id;

      if (!postId) {
        throw new Error('특허 등록에 실패했습니다.');
      }

      if (files.length > 0) {
        const fileFormData = new FormData();
        files.forEach((file) => {
          fileFormData.append('files', file);
        });

        await apiClient.post(`/api/posts/${postId}/files`, fileFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setIsSubmitted(true);
      router.push('/patents');
    } catch (error) {
      console.error('특허 등록 실패:', error);
      alert('특허 등록에 실패했습니다.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2a4fa2] via-[#1a365d] to-[#1a365d]">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              특허 등록이 완료되었습니다
            </h1>
            <p className="text-gray-600 mb-6">
              등록하신 특허는 검토 후 승인됩니다. 승인까지 1-2일 소요됩니다.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">등록 정보</h3>
              <p className="text-sm text-gray-600">
                등록번호: PAT-{Date.now()}
              </p>
              <p className="text-sm text-gray-600">
                등록일시: {new Date().toLocaleString('ko-KR')}
              </p>
            </div>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setStep(1);
                setFormData({
                  title: '',
                  description: '',
                  category: '',
                  price: 0,
                });
                setFiles([]);
              }}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              새 특허 등록
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a4fa2] via-[#1a365d] to-[#1a365d]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">특허 등록</h1>

          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-2 text-sm text-gray-600">
              <span className={step >= 1 ? 'text-blue-600 font-medium' : ''}>
                게시글 작성
              </span>
              <span className="mx-4">→</span>
              <span className={step >= 2 ? 'text-blue-600 font-medium' : ''}>
                파일 업로드
              </span>
              <span className="mx-4">→</span>
              <span className={step >= 3 ? 'text-blue-600 font-medium' : ''}>
                등록 완료
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  게시글 작성
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border ${validationErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${shakeErrors.title ? 'animate-shake' : ''}`}
                    placeholder="제목을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기술분야 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border ${validationErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${shakeErrors.category ? 'animate-shake' : ''}`}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={10}
                    className={`w-full px-3 py-2 border ${validationErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${shakeErrors.description ? 'animate-shake' : ''}`}
                    placeholder="내용을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가격 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price === 0 ? '' : formData.price.toLocaleString()}
                    onChange={handleChange}
                    onFocus={(e) => {
                      // 포커스 시 쉼표 제거된 숫자 표시
                      e.target.value = formData.price === 0 ? '' : formData.price.toString();
                    }}
                    onBlur={(e) => {
                      // 포커스 아웃 시 쉼표 추가된 숫자 표시
                      const value = parseInt(e.target.value.replace(/,/g, '')) || 0;
                      e.target.value = value === 0 ? '' : value.toLocaleString();
                      setFormData((prev) => ({ ...prev, price: value }));
                    }}
                    required
                    className={`w-full px-3 py-2 border ${validationErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${shakeErrors.price ? 'animate-shake' : ''}`}
                    placeholder="가격을 입력하세요"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const errors: { [key: string]: boolean } = {};
                      const shake: { [key: string]: boolean } = {};
                      let isValid = true;

                      if (!formData.title) {
                        errors.title = true;
                        shake.title = true;
                        isValid = false;
                      }
                      if (!formData.category) {
                        errors.category = true;
                        shake.category = true;
                        isValid = false;
                      }
                      if (!formData.description) {
                        errors.description = true;
                        shake.description = true;
                        isValid = false;
                      }
                      if (formData.price <= 0) {
                        errors.price = true;
                        shake.price = true;
                        isValid = false;
                      }

                      setValidationErrors(errors); // 에러 상태 업데이트
                      setShakeErrors(shake); // 흔들림 상태 업데이트

                      if (isValid) {
                        setStep(2);
                      } else {
                        alert('필수 입력 항목을 모두 채워주세요.'); // 한 번만 알림
                        // 짧은 시간 후 흔들림 상태 초기화
                        setTimeout(() => {
                          setShakeErrors({});
                        }, 500); // 0.5초 후 초기화
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  파일 업로드
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      파일 선택
                    </label>
                    <input
                      type="file"
                      name="files"
                      multiple
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      여러 파일을 선택할 수 있습니다.
                    </p>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-md font-semibold text-gray-800 mb-2">
                        선택된 파일 ({files.length}개)
                      </h3>
                      <ul className="border border-gray-300 rounded-lg p-4 space-y-2">
                        {files.map((file, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                          >
                            <span className="text-gray-700 text-sm">
                              {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              className="text-red-500 hover:text-red-700 ml-4"
                            >
                              X
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    이전
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    등록 완료
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
