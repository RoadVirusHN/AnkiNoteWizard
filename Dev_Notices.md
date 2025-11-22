1. set Workspace typescript version to node_modules/(workspace) version, instead of dev container version.
2. css-loader 7.1.2 package conflicts with latest webpack, downgraded to css-loader 5.0.0. 
3. known bugs : Template modify 시 기존 field가 복사됨, 다른 탭에서 url이 바뀌면 detect 결과물이 사라짐 (content 나누기가 안됬음, 우선순위 낮음)