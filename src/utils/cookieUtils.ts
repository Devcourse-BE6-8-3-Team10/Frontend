// 쿠키 관리를 위한 유틸리티 함수들 (AccessToken과 RefreshToken)

// 쿠키 설정
export const setCookie = (name: string, value: string, minutes: number = 60 * 24 * 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + minutes * 60 * 1000);
  const cookieValue = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  document.cookie = cookieValue;
};

// 쿠키 가져오기
export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// 쿠키 삭제
export const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// AccessToken 쿠키 설정
export const setAccessTokenCookie = (token: string) => {
  setCookie('accessToken', token, 30); // 30분
};

// AccessToken 쿠키 가져오기
export const getAccessTokenCookie = (): string | null => {
  return getCookie('accessToken');
};

// AccessToken 쿠키 삭제
export const clearAccessTokenCookie = () => {
  deleteCookie('accessToken');
};

// RefreshToken 쿠키 설정
export const setRefreshTokenCookie = (token: string) => {
  setCookie('refreshToken', token, 60 * 24 * 7); // 7일
};

// RefreshToken 쿠키 가져오기
export const getRefreshTokenCookie = (): string | null => {
  return getCookie('refreshToken');
};

// RefreshToken 쿠키 삭제
export const clearRefreshTokenCookie = () => {
  deleteCookie('refreshToken');
}; 