# 📒 주식 가계부 (PWA)

브라우저에서 바로 쓰고, 스마트폰·PC에 **앱처럼 설치**할 수 있는 주식 거래 기록 앱입니다.

## ✨ 기능

- 매수 / 매도 거래 기록
- 평균 단가 기반 실현 손익 자동 계산
- 브라우저 localStorage 영구 저장
- CSV 내보내기
- **앱 설치 버튼** (Android/Chrome/Edge: 자동 팝업 / iOS: 배너 안내)
- **오프라인 동작** (Service Worker 캐시)
- 모바일 반응형

## 🗂️ 파일 구조

```
stock-ledger/
├── index.html      # 마크업
├── style.css       # 스타일
├── app.js          # 거래 데이터 로직
├── pwa.js          # 설치 버튼 + Service Worker 등록
├── sw.js           # Service Worker (오프라인 캐시)
├── manifest.json   # PWA 메타 정보
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

## 🚀 GitHub Pages 배포

1. GitHub 새 저장소 생성
2. 모든 파일 업로드 (icons 폴더 포함)
3. Settings → Pages → Branch: `main` / `/(root)` → Save
4. `https://<유저명>.github.io/<저장소명>/` 접속

> ⚠️ **HTTPS 필수**: PWA 설치는 HTTPS에서만 동작합니다. GitHub Pages는 자동으로 HTTPS를 제공합니다.

## 📲 설치 방법

| 환경 | 방법 |
|---|---|
| Android Chrome | 주소창 우측 설치 아이콘 또는 헤더 **앱 설치** 버튼 |
| PC Chrome/Edge | 주소창 우측 설치 아이콘 또는 헤더 **앱 설치** 버튼 |
| iPhone/iPad Safari | 하단 공유 버튼 → 홈 화면에 추가 (배너 안내) |

## 💡 손익 계산

```
실현 손익 = (매도 단가 − 가중평균 매수 단가) × 수량
```
