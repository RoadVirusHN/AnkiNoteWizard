1. set Workspace typescript version to node_modules/(workspace) version, instead of dev container version.
2. css-loader 7.1.2 package conflicts with latest webpack, downgraded to css-loader 5.0.0. 
3. 개발/빌드 중에 dev container가 자주 disconnecting 된다면 wsl2의 swap 메모리를 늘려라(사용자폴더/.wslconfig의 [wsl2]의 swap=16gb 세션)
## 프로젝트 라인수 세기
- 프로젝트 루트 폴더에서 아래 실행
```shell
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.mjs" -o -name "*.css" -o -name "*.json" \) ! -name "package-lock.json" ! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/.devcontainer/*" ! -path "*/release/*" ! -path "*/.git/*" | xargs wc -l
```
- 200 줄 이상인 리액트 컴포넌트 수 줄여보기
- 현재 약 6700줄이며, 앞으로 기능 추가시 최대 1만줄 까지 늘어날 가능성 있음, 
  - 의도에 맞게 가벼운 기능 만 유지하자....