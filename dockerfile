# 1. Node.js 기반 이미지 사용
FROM node:20

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. package.json만 먼저 복사 (캐시 최적화)
COPY package*.json ./

# 4. 의존성 설치
RUN npm install

# 5. 나머지 소스 복사
COPY . .

# 6. 개발 서버 포트 열기
EXPOSE 3000

# 7. 개발 모드 실행
CMD ["npm", "run", "dev"]