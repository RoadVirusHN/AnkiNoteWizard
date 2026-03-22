# Anki Card Wizard 🪄

> 웹 페이지 정보를 스캔해 간단하고 빠르게 [Anki](https://apps.ankiweb.net/) Note를 추가,생성하는 크롬 확장 프로그램.

## 💡Motivation

어느 날, 발음기호와 예시 문장, 그림이 포함된 영단어 플래쉬 카드 하나를 작성하는데 평균 3분이 소요되었고, 하루에 영단어 30개를 Anki에 추가하는데 일 평균 90분의 시간이 든다는 것을 깨달았습니다. 

이 비효율을 해결하기 위해 크롬 확장 프로그램을 개발하게 되었습니다.

현재는 개인적인 사용이 주 목적이지만, 후일 많은 사람들을 위해 배포하고 싶습니다.

## 🛠️ Features

### 카드 스캔 및 추가/수정 기능

_웹 페이지 내에서 정보를 Anki 앱에 Note로 쉽고 빠르게 추가해보세요!_

**카드**는 미리 설정한 템플릿에 따라 웹 페이지 내의 정보를 탐색 및 Note로 가공한 결과입니다.
- 카드는 추가하기 전에 미리보기 후, 원한다면 내용을 수정하실 수 있습니다.

### 템플릿 추가/수정 기능

_Anki Note를 웹 페이지 내 스캔하고, 자동 생성하기 위한 정보를 입력하세요!_

**템플릿**은 Anki Note를 자동 생성 및 웹 페이지 내 탐색하기 위한 정보 입니다. 

추가된 템플릿을 이용해 페이지 내에서 일치하는 HTML 정보를 스캔해 Anki note로 추가할 수 있습니다.



### 앱 설정 기능

폰트 크기, 테마, 국제화(한국어, 영어), AnkiConnect 연결 설정 등을 변경 가능 합니다.


## 🤖 Tech Stacks & Architecture
- React
- zustand
- Typescript
- Webpack

대충 Chrome Extension "Anki Card Wizard" <=> AnkiConnect <=> Anki app 연결 사진.

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

## 👷 RoadMap

### 소리 필드 지원 (예정)

### Xpath, JS Path 지원 (예정)
Template의 data Path로 CSS Selector 이외의 선택지를 고르실 수 있습니다.

### 다양한 Anki Note 모델 지원 (예정) 
- Cloze [ ]
- Basic (and reversed card) [ ]
- Image Occlusion [ ]

### 카드 템플릿 공유 기능 (예정)

- 템플릿 데이터를 JSON, CSV 파일 형식으로 내보내기 혹은 가져오기 가능.


## 🪪 License
MIT License.
