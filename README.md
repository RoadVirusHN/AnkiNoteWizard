# Anki Card Wizard 🪄

> 웹 페이지 정보를 스캔해 간단하고 빠르게 [Anki](https://apps.ankiweb.net/) Note를 추가,생성하는 크롬 확장 프로그램.

## 💡Motivation

어느 날, 발음기호와 예시 문장, 그림이 포함된 영단어 플래쉬 카드 하나를 작성하는데 평균 3분이 소요되었고, 하루에 영단어 30개를 Anki에 추가하는데 일 평균 90분의 시간이 든다는 것을 깨달았습니다. 

이 비효율을 해결하기 위해 **Anki Card Wizard**을 개발하게 되었습니다.

현재는 개인적인 사용이 주 목적이지만, 후일 많은 사람들을 위해 배포하고 싶습니다.

## 🛠️ Features

### 카드 스캔 및 추가/수정 기능

_웹 페이지 내에서 정보를 Anki 앱에 Note로 쉽고 빠르게 추가해보세요!_

### 템플릿 추가/수정 기능

_Anki Note를 웹 페이지 내 스캔하고, 자동 생성하기 위한 정보를 입력하세요!_

### 노트 직접 추가 기능

_원하는 노트를 템플릿을 이용해 직접 간편하게 작성해보세요!_

### 앱 설정 기능

_폰트 크기, 테마, 국제화(한국어, 영어), AnkiConnect 연결 설정 등을 변경 가능 합니다._




## 🤖 Tech Stacks & Architecture
- React : 확장 프로그램 frontend 구현, 컴포넌트화
- zustand : 중앙 상태 관리, chrome storage와의 연동을 통해 앱 종료 혹은 기기 변경 시에도 일부 상태와 설정 유지를 통한 유저 경험 향상.
- Typescript : 타입 지원
- react-i18next : 국제화 지원
- Monaco Editor : 오프라인 웹 코드 에디터, 카드 및 템플릿 수정에 이용됨.
- Webpack : 멀티엔트리 번들러, 

// 대충 Chrome Extension "Anki Card Wizard" <=> AnkiConnect <=> Anki app 연결 사진.

## 📦 Installation

### 일반 사용자
Chrome 웹스토어 링크 (배포 후 추가 예정)

### 개발자
```bash
git clone https://github.com/RoadVirusHN/AnkiCardWizard.git
cd AnkiCardWizard
npm install
npm run build:dev # Generate files for testing build in the 'dist' folder
npm run build:prod # Generate files for deploying build in the 'release' folder
```

## 📓 Usage

### 템플릿 관리
// 템플릿 추가 버튼 누른 후, 템플릿을 추가하는 gif

**템플릿(Template)** 페이지에서 **템플릿**을 관리하실 수 있습니다.

- **템플릿**은 Anki Note를 자동 생성 및 웹 페이지 내 탐색하기 위한 정보 입니다. 
- 스캔 대상 웹페이지, 카드의 코드, 기타 메타 데이터 등을 설정할 수 있습니다.

### Anki 연결 상태 확인

//Anki를 실행 후, 초록 빛으로 바뀌는 indicator gif

상단의 첫번재 **감지(Scan)** 탭의 인디케이터로 Anki와의 연결 상태를 확인 하실 수 있습니다.
- 사이드패널이 열려있고, Anki와 연결이 되지 않았다면(적색 표시) 자동으로 5초마다 연결을 확인합니다.

// 빨간 불이였다가, Anki를 실행하자 파란불로 바뀌는 gif
- Anki 앱을 열고, [AnkiConnect](https://ankiweb.net/shared/info/2055492159) Addon 설치를 꼭 확인해주세요.


### 카드 스캔

// 웹 페이지 보여준 후, 카드 스캔 버튼을 눌러 카드 리스트를 보여주는 gif

**감지(Scan)** 페이지에서 현재 웹페이지에 존재하는 카드를 스캔할 수 있습니다.
- "찾기" 버튼으로 카드를 찾고, 체크된 카드를 "추가" 버튼으로 추가할 수 있습니다.
- 스캔된 카드는 다시 "찾기" 버튼을 누르거나 수동 삭제할때까지 남아있습니다.

### 카드 수정

// 카드 수정 (코드 수정, 태그 수정) 후 추가 gif

스캔된 카드는 클릭하여 세부 내용을 수정할 수 있습니다.

### 카드 추가 및 삭제

// 카드 몇개 삭제 및 체크 후 추가 gif

추가하고 싶은 카드들을 체크 후, **추가(Add)** 버튼으로 추가합니다.
- "삭제" 버튼으로 해당 카드를 리스트에서 제외합니다. (다시 "찾기" 버튼으로 재추가할 수 있습니다.)


### 노트 직접 추가
// 카드를 직접 추가하며 Preview <-> Code 모드 변경 시연 gif
**추가(ADD)** 페이지에서 스캔하지 않고도, 템플릿을 선택하여 직접 추가할 카드를 만들 수 있습니다.
- Preview 모드<-> Code 모드를 전환하여 결과물을 확인하세요.
- "노트 추가" 버튼으로 카드를 Anki에 추가하세요.


### 사용자 설정 변경
// 설정을 변경해서 locale, 테마을 변경하는 gif

**설정(Config)** 페이지에서 사용자 설정을 변경할 수 있습니다.
- Chrome Sync Storage를 이용하므로 크롬 로그인 시, 다른 기기에서도 설정을 연동할 수 있습니다.

### 태그 정보 추출 기능

// 템플릿 설정 창에서 태그 정보 추출 창을 띄우고 채워넣는 gif

카드, 템플릿 수정 시, 태그 정보 추출 기능을 이용하여, Selector, 데이터 등을 가져올 수 있습니다.
- 텍스트 선택 : HTML 태그의 내용을 복사합니다.
- Selector 선택 : HTML 태그의 Css Selector를 선택합니다. (템플릿 수정 시에만 선택 가능)
- 자식 태그 선택 : HTML 태그의 자식 태그를 대상으로 추출합니다. (템플릿 수정 시에만 선택 가능) 

## 👷 RoadMap

### Version Alpha

#### 공통 기능
- [x] 코드 에디터
- [x] 태그 데이터 추출 오버레이 메뉴
  - [x] 텍스트 추출 모드
  - [x] 셀렉터 추출 모드
  - [x] 자식 태그 재귀 메뉴 열기
- [x] 태그 데이터 추출 라이브러리
- [x] 중앙 상태 관리 (zustand)
- [x] 에러 핸들링
  - [x] 에러 페이지
  - [x] 런타임 에러 핸들링
- [ ] 프리뷰 보안 기능 
  - [ ] iframe 프리뷰 모드
  - [ ] shadowDom 프리뷰 모드
  - [ ] 테스트용 카드 & 템플릿
- [ ] TDD?
#### ✅ 감지 기능 
- [x] 템플릿 별 선별 탐색
- [x] Anki 연결 확인 및 재연결
- [x] root tag 기반 탐색
- [x] Unique Tag 탐색
- [x] Non-Unique Tag 탐색
#### 카드 추가 기능
- [x] 카드 추가 기능
- [x] 카드 내용 수정 기능
  - [x] 태그 수정 기능
- [ ] 프리뷰 <-> 코드 모드 전환
- [ ] 카드 프리뷰 기능
#### 템플릿 관련 기능
- [ ] 기본 템플릿
- [x] 템플릿 수정
- [x] 템플릿 추가
- [ ] 템플릿 모델 지원
#### 설정 기능
- [x] 폰트 사이즈
- [x] 테마
- [x] 언어 설정
  - [x] 영어
  - [x] 한국어
- [ ] AnkiConnect 설정

#### 디자인
- [ ] 반응형
- [ ] 템플릿 리스트
- [ ] 카드 리스트
- [x] 에러 페이지
- [ ] 카드 수정 페이지
- [ ] 템플릿 수정 페이지
- [ ] 카드 추가 페이지
### Version 1.0

#### 소리 필드 지원 (예정)

#### Xpath, JS Path 지원 (예정)
Template의 data Path로 CSS Selector 이외의 선택지를 고르실 수 있습니다.

#### 다양한 Anki Note 모델 지원 (예정) 
- Cloze [ ]
- Basic (and reversed card) [ ]
- Image Occlusion [ ]

#### 카드 템플릿 공유 기능 (예정)

- 템플릿 데이터를 JSON, CSV 파일 형식으로 내보내기 혹은 가져오기 가능.


## ❓FAQ
// 기능 완성하고, 사용해보며 궁금할만한 점 추가 예정
## 🪪 License
MIT License.
