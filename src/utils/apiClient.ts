import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { ChatMessage, ChatRoom } from "./websocket";
import { getAccessTokenCookie, clearAccessTokenCookie, clearRefreshTokenCookie } from './cookieUtils';

// 특허 관련 타입 정의
interface Patent {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  status: string;
  createdAt: string;
}

// 페이지네이션 관련 타입 정의
interface Pageable {
  page: number;
  size: number;
  sort: string[];
}

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "https://www.devteam10.org",
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - 자동으로 AccessToken 추가 (쿠키에서 읽어옴)
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessTokenCookie();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // 401/403 에러 시 자동 로그아웃 처리
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAccessTokenCookie();
      clearRefreshTokenCookie();
      // 현재 경로가 로그인 페이지가 아닌 경우에만 리다이렉트
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 채팅 관련 API 함수들
export const chatAPI = {
  // 채팅방 목록 조회
  getChatRooms: async (): Promise<ChatRoom[]> => {
    const response = await apiClient.get("/api/chat/rooms");
    return response.data;
  },

  // 특정 채팅방 조회
  getChatRoom: async (roomId: number): Promise<ChatRoom> => {
    const response = await apiClient.get(`/api/chat/rooms/${roomId}`);
    return response.data;
  },

  // 채팅방 생성
  createChatRoom: async (roomData: {
    name: string;
    participants: string[];
  }): Promise<ChatRoom> => {
    const response = await apiClient.post("/api/chat/rooms", roomData);
    return response.data;
  },

  // 채팅방 참여
  joinChatRoom: async (roomId: number): Promise<void> => {
    await apiClient.post(`/api/chat/rooms/${roomId}/join`);
  },

  // 채팅방 나가기
  leaveChatRoom: async (roomId: number): Promise<void> => {
    await apiClient.post(`/api/chat/rooms/${roomId}/leave`);
  },

  // 채팅 메시지 히스토리 조회
  getChatHistory: async (
    roomId: number,
    page: number = 0,
    size: number = 50
  ): Promise<{
    messages: ChatMessage[];
    hasMore: boolean;
    totalElements: number;
  }> => {
    const response = await apiClient.get(`/api/chat/rooms/${roomId}/messages`, {
      params: { page, size },
    });
    return response.data;
  },

  // 1:1 채팅방 생성 또는 조회
  getOrCreatePrivateChat: async (otherUserId: string): Promise<ChatRoom> => {
    const response = await apiClient.post("/api/chat/private", { otherUserId });
    return response.data;
  },

  // 채팅방 삭제
  deleteChatRoom: async (roomId: number): Promise<void> => {
    await apiClient.delete(`/api/chat/rooms/${roomId}`);
  },
};

// 특허 관련 API 함수들
export const patentAPI = {
  // 최근 등록된 특허 목록 조회
  getRecentPatents: async (): Promise<Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    price: number;
    status: string;
    createdAt: string;
  }>> => {
    const response = await apiClient.get("/api/posts");
    return response.data.data || response.data;
  },

  // 인기 특허 목록 조회
  getPopularPatents: async (): Promise<Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    price: number;
    status: string;
    createdAt: string;
  }>> => {
    const response = await apiClient.get("/api/posts/popular");
    return response.data.data || response.data;
  },

  // 특정 게시글의 파일 목록 조회
  getPostFiles: async (postId: number): Promise<Array<{
    id: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }>> => {
    const response = await apiClient.get(`/api/posts/${postId}/files`);
    return response.data.data || [];
  },

  // 내 특허 목록 조회
  getMyPatents: async (): Promise<Patent[]> => {
    const response = await apiClient.get("/api/posts/me");
    return response.data;
  },

  // 찜한 특허 목록 조회
  getLikedPatents: async (): Promise<Patent[]> => {
    const response = await apiClient.get("/api/likes/me");
    return response.data;
  },
};

// 회원 관련 API 함수들
export const memberAPI = {
  // 회원 정보 수정
  updateMemberInfo: async (data: {
    name: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<void> => {
    await apiClient.patch('/api/members/me', data);
  },

  // 마이페이지 정보 조회
  getMyPageInfo: async (): Promise<{
    id: number;
    email: string;
    name: string;
    role: string;
    profileUrl?: string;
    status: string;
    createdAt: string;
  }> => {
    const response = await apiClient.get('/api/members/me');
    return response.data;
  },

  // 회원 탈퇴
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/api/members/me');
  },

  // 회원 확인 (비밀번호 찾기용)
  verifyMember: async (data: {
    name: string;
    email: string;
  }): Promise<void> => {
    const response = await fetch(`${apiClient.defaults.baseURL}/api/members/verify-member`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: { message?: string } = await response.json();
      throw new Error(errorData.message || '회원 확인에 실패했습니다.');
    }
  },

  // 비밀번호 찾기 및 변경
  findAndUpdatePassword: async (data: {
    name: string;
    email: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> => {
    const response = await fetch(`${apiClient.defaults.baseURL}/api/members/find-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: { message?: string } = await response.json();
      throw new Error(errorData.message || '비밀번호 변경에 실패했습니다.');
    }
  },
};

// 거래 관련 API 함수들
export const tradeAPI = {
  // 본인 모든 거래 조회
  getMyTrades: async (page: number = 0, size: number = 10): Promise<{
    content: TradeDto[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  }> => {
    const response = await apiClient.get("/api/trades", {
      params: { page, size },
    });
    return response.data.data;
  },

  // 거래 상세 조회
  getTradeDetail: async (tradeId: number): Promise<TradeDetailDto> => {
    const response = await apiClient.get(`/api/trades/${tradeId}`);
    return response.data.data;
  },
  // 거래 생성
  createTrade: async (postId: number): Promise<void> => {
    await apiClient.post("/api/trades", { postId });
  },
};

// 거래 관련 타입 정의
export interface TradeDto {
  id: number;
  postId: number;
  sellerId: number;
  buyerId: number;
  price: number;
  status: string;
  createdAt: string;
}

export interface TradeDetailDto {
  id: number;
  postId: number;
  postTitle: string;
  postCategory: string;
  price: number;
  status: string;
  createdAt: string;
  sellerEmail: string;
  buyerEmail: string;
}

// 관리자 관련 API 함수들
export const adminAPI = {
  // 전체 회원 목록 조회 (관리자 전용)
  getAllMembers: async (): Promise<{ 
    resultCode: string;
    msg: string;
    data: { 
      content: Array<{
        id: number;
        email: string;
        name: string;
        role: string;
        profileUrl?: string;
        status: string;
        createdAt: string;
        modifiedAt?: string;
        deletedAt?: string;
      }>;
      totalElements: number;
      totalPages: number;
      pageable: Pageable;
    } 
  }> => {
    const response = await apiClient.get('/api/admin/members');
    return response.data;
  },

  // 회원 상세 정보 조회 (관리자 전용)
  getMemberDetail: async (memberId: number): Promise<{ 
    resultCode: string;
    msg: string;
    data: {
      id: number;
      email: string;
      name: string;
      role: string;
      profileUrl?: string;
      status: string;
      createdAt: string;
      modifiedAt?: string;
      deletedAt?: string;
    } 
  }> => {
    const response = await apiClient.get(`/api/admin/members/${memberId}`);
    return response.data;
  },

  // 회원 정보 수정 (관리자 전용)
  updateMemberByAdmin: async (memberId: number, data: {
    name?: string;
    status?: string;
    profileUrl?: string | null;
  }): Promise<void> => {
    await apiClient.patch(`/api/admin/members/${memberId}`, data);
  },

  // 회원 삭제 (관리자 전용)
  deleteMemberByAdmin: async (memberId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/members/${memberId}`);
  },

  // 모든 특허 조회 (관리자 전용)
  getAllPatents: async (): Promise<{ 
    resultCode: string;
    msg: string;
    data: { 
      content: Array<{
        id: number;
        title: string;
        description: string;
        category: string;
        price: number;
        status: string;
        createdAt: string;
        modifiedAt?: string;
        favoriteCnt: number;
        authorId: number;
        authorName?: string;
      }>;
      totalElements: number;
      totalPages: number;
      pageable: Pageable;
    } 
  }> => {
    const response = await apiClient.get('/api/admin/patents');
    return response.data;
  },

  // 특허 정보 수정 (관리자 전용)
  updatePatentByAdmin: async (patentId: number, data: {
    title?: string;
    description?: string;
    category?: string;
    price?: number;
    status?: string;
  }): Promise<void> => {
    await apiClient.patch(`/api/admin/patents/${patentId}`, data);
  },

  // 특허 상세 정보 조회 (관리자 전용)
  getPatentDetail: async (patentId: number): Promise<{ 
    resultCode: string;
    msg: string;
    data: {
      id: number;
      title: string;
      description: string;
      category: string;
      price: number;
      status: string;
      createdAt: string;
      modifiedAt?: string;
      favoriteCnt: number;
      authorId: number;
      authorName?: string;
    } 
  }> => {
    const response = await apiClient.get(`/api/admin/patents/${patentId}`);
    return response.data;
  },

  // 특허 삭제 (관리자 전용)
  deletePatentByAdmin: async (patentId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/patents/${patentId}`);
  },
};

export default apiClient;
