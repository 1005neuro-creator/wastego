# 분리고 — 분리배출 대행 서비스 앱

지금 이 폴더에는 실제로 작동하는 앱의 전체 코드가 들어있습니다.
Supabase(데이터베이스/로그인)는 이미 연결되어 있고, 아래 순서대로 따라하면
**내 컴퓨터에서 실행 → 인터넷에 배포 → 휴대폰에 설치**까지 끝낼 수 있습니다.

---

## 0. 미리 설치할 것: Node.js

이미 설치되어 있다면 건너뛰세요.

1. https://nodejs.org 접속
2. **LTS** 버전 다운로드 (왼쪽 큰 버튼)
3. 설치 파일 실행 → 계속 "다음" 눌러서 설치
4. 설치 후 터미널(Mac: "터미널" 앱 / Windows: "명령 프롬프트" 또는 "PowerShell")을 열고 아래 입력:

```
node -v
```

버전 번호(예: `v20.11.0`)가 나오면 성공입니다.

---

## 1. 프로젝트 실행해보기 (내 컴퓨터에서)

이 `wastego` 폴더를 다운로드한 위치로 터미널에서 이동합니다. 예를 들어 다운로드 폴더에 있다면:

```
cd Downloads/wastego
```

그 다음, 필요한 패키지를 설치합니다 (처음 한 번만, 1~2분 소요):

```
npm install
```

설치가 끝나면 실행:

```
npm run dev
```

터미널에 `Local: http://localhost:5173/` 같은 주소가 나옵니다.
**Ctrl(or Cmd)을 누른 채 그 주소를 클릭**하거나, 브라우저에 직접 입력하면
앱이 열립니다.

여기서 회원가입(이용자/기사 선택)을 해보고, 요청을 만들어보고,
다른 탭에서 기사 계정으로 로그인해서 수락하는 흐름을 테스트해보세요.

> 종료할 때는 터미널에서 `Ctrl + C`

---

## 2. 인터넷에 배포하기 (Vercel)

이 단계를 마치면 `https://분리고-아무거나.vercel.app` 같은
**실제 인터넷 주소**가 생기고, 누구나 휴대폰/PC로 접속할 수 있습니다.

### 2-1. GitHub에 코드 올리기

GitHub 계정이 없다면 https://github.com 에서 무료 가입.

1. GitHub에서 **New repository** 클릭 → 이름 `wastego` 입력 → Create
2. 터미널에서 (이 프로젝트 폴더 안에서):

```
git init
git add .
git commit -m "분리고 첫 배포"
git branch -M main
git remote add origin https://github.com/내깃허브아이디/wastego.git
git push -u origin main
```

(`내깃허브아이디` 부분만 본인 것으로 바꾸세요. GitHub repository 페이지에
정확한 명령어가 그대로 안내되어 있으니 그걸 복사해도 됩니다.)

> `.env` 파일은 `.gitignore`에 의해 **자동으로 GitHub에 안 올라갑니다**
> (키 보안을 위해 의도된 설정입니다). 그래서 3단계에서 Vercel에 따로 입력해야 해요.

### 2-2. Vercel로 배포

1. https://vercel.com 접속 → GitHub 계정으로 로그인
2. **Add New → Project** 클릭
3. 방금 올린 `wastego` repository 선택 → **Import**
4. **Environment Variables** 섹션에서 아래 두 개를 추가:
   - `VITE_SUPABASE_URL` = `https://pbldhwxhlqyimxaqghyu.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (본인의 publishable key)
5. **Deploy** 클릭 → 1~2분 후 완료
6. 생성된 주소 클릭 → 실제 작동하는 앱 확인!

이후 코드를 수정하고 싶으면, 같은 폴더에서:
```
git add .
git commit -m "수정 내용"
git push
```
하면 Vercel이 자동으로 다시 배포합니다.

---

## 3. 휴대폰에 앱처럼 설치 (PWA)

이미 PWA 설정이 코드에 포함되어 있습니다 (`vite.config.js`, `manifest`).
Vercel 배포가 끝난 주소로 휴대폰 브라우저에서 접속한 뒤:

- **iPhone (Safari)**: 공유 버튼 → "홈 화면에 추가"
- **Android (Chrome)**: 메뉴(⋮) → "앱 설치" 또는 "홈 화면에 추가"

홈 화면에 분리고 아이콘이 생기고, 탭하면 일반 앱처럼 전체 화면으로 열립니다.

> 지금 포함된 아이콘은 임시 디자인입니다. 나중에 `public/icon-192.png`,
> `public/icon-512.png` 파일을 원하는 로고 이미지로 교체하면 됩니다.

---

## 자주 막히는 부분

**`npm install`에서 에러가 난다** → Node.js 버전이 너무 오래된 경우가 많습니다.
`node -v`로 확인해서 18 이상인지 체크하세요.

**로그인해도 화면이 멈춰있다** → Supabase의 "Email confirmation"이 켜져있으면
가입 후 이메일 인증 전까지 로그인이 안 됩니다. Supabase 대시보드 →
**Authentication → Providers → Email**에서 "Confirm email"을 꺼두면
테스트할 때 더 편합니다 (실서비스 전엔 다시 켜는 것을 권장).

**기사 화면에 요청이 안 보인다** → 이용자 계정으로 요청을 먼저 하나 만들어야
기사 화면의 "대기중" 목록에 나타납니다.

**Vercel 배포 후 화면이 하얗게 나온다** → Environment Variables를 안 넣었을
가능성이 높습니다. Vercel 프로젝트 → Settings → Environment Variables 확인 후
다시 배포(Redeploy).

---

## 다음에 더 할 수 있는 것

- 결제 연동 (토스페이먼츠 등)
- 카카오맵으로 실제 위치 기반 매칭
- 기사 평점/리뷰 시스템
- 관리자 대시보드 (전체 요청 모니터링)

필요하면 언제든 요청하세요.
