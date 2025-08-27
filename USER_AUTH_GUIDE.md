# 사용자 인증 시스템 가이드

## 개요

이 프로젝트는 JWT(JSON Web Token) 기반의 인증 시스템을 사용합니다. 
AccessToken과 RefreshToken을 쿠키로 관리하여 자동 전송되는 편리한 구조입니다.

## 인증 구조

### 토큰 관리 방식
- **AccessToken**: 쿠키에 저장 (자동 전송)
- **RefreshToken**: HttpOnly 쿠키에 저장 (보안 강화)

### 장점
- ✅ **편의성**: 헤더 없이도 API 호출 가능
- ✅ **자동화**: 쿠키가 자동으로 전송됨
- ✅ **보안**: RefreshToken은 HttpOnly로 XSS 공격 방지
- ✅ **호환성**: 웹과 앱 환경 모두 지원

## 사용 방법

### 1. 로그인
```javascript
const response = await apiClient.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password'
});

// 로그인 성공 시 쿠키에 자동으로 토큰이 저장됩니다
```

### 2. API 호출
```javascript
// 방법 1: fetch 사용 (헤더 없이도 자동 전송)
const response = await fetch('https://www.devteam10.org/api/v1/posts/1');

// 방법 2: apiClient 사용 (권장)
const response = await apiClient.get('/api/v1/posts/1');
```

### 3. 사용자 정보 조회
```javascript
const userInfo = await apiClient.get('/api/auth/me');
```

### 4. 로그아웃
```javascript
await apiClient.post('/api/auth/logout');
// 로그아웃 시 쿠키가 자동으로 삭제됩니다
```

## React 컴포넌트에서 사용

### AuthContext 사용
```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div>
      <h1>안녕하세요, {user?.name}님!</h1>
      <button onClick={logout}>로그아웃</button>
    </div>
  );
}
```

### 로그인 페이지 예시
```javascript
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/utils/apiClient';

function LoginPage() {
  const { login } = useAuth();

  const handleLogin = async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.data) {
        const { accessToken, refreshToken, memberInfo } = response.data.data;
        
        login({
          id: memberInfo.id.toString(),
          email: memberInfo.email,
          name: memberInfo.name,
        }, accessToken, refreshToken);

        // 로그인 성공 후 리다이렉트
        router.push('/');
      }
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* 로그인 폼 */}
    </form>
  );
}
```

## 토큰 관리

### 토큰 자동 갱신
- AccessToken이 만료되면 RefreshToken을 사용하여 자동 갱신
- 갱신된 토큰은 쿠키에 자동 저장

### 토큰 만료 처리
- 401/403 에러 시 자동으로 로그아웃 처리
- 로그인 페이지로 자동 리다이렉트

## 보안 고려사항

### 쿠키 설정
- **AccessToken**: HttpOnly=false (JavaScript 접근 가능)
- **RefreshToken**: HttpOnly=true (JavaScript 접근 불가, 보안 강화)
- **Secure**: 개발환경=false, 프로덕션=true
- **SameSite**: Strict (CSRF 공격 방지)

### CORS 설정
- 프론트엔드와 백엔드 간 쿠키 전송을 위한 설정 필요
- `credentials: 'include'` 설정 필요

## 개발 환경 설정

### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=https://www.devteam10.org
```

### Backend (application.yml)
```yaml
jwt:
  access-token-validity: 1800000  # 30분
  refresh-token-validity: 604800000  # 7일
```

## 문제 해결

### 쿠키가 전송되지 않는 경우
1. 도메인과 경로 설정 확인
2. CORS 설정 확인
3. 브라우저 개발자 도구에서 쿠키 확인

### 토큰 만료 시
1. 자동 갱신이 실패하면 로그인 페이지로 리다이렉트
2. RefreshToken도 만료된 경우 재로그인 필요

## API 엔드포인트

### 인증 관련
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 사용자 정보 조회
- `POST /api/auth/reissue` - 토큰 재발급

### 보호된 API 예시
- `GET /api/v1/posts` - 게시글 목록
- `POST /api/v1/posts` - 게시글 작성
- `GET /api/member/profile` - 회원 프로필

## 참고 사항

- 모든 API 호출은 쿠키를 통해 자동으로 인증됩니다
- 별도의 Authorization 헤더 설정이 필요하지 않습니다
- 토큰 관리는 백엔드에서 자동으로 처리됩니다 
