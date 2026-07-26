import React from "react";
import ReactDOM from "react-dom/client";

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
// WARN : monaco 패키지에서 필요한 기능만 골라서 import 하는 방식으로 최적화하기
// 2. 언어 지원 (HTML, CSS 색깔 나오게 하기)
//import 'monaco-editor/esm/vs/language/html/monaco.contribution';
//import 'monaco-editor/esm/vs/language/css/monaco.contribution';

// 3. 필수 UI 기능 (필요한 것만 주석 해제해서 쓰세요)
// import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController'; // Ctrl+F
// import 'monaco-editor/esm/vs/editor/contrib/hover/browser/hover'; // 마우스 올렸을 때 설명
// import 'monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu'; // 우클릭 메뉴


import { loader } from '@monaco-editor/react';
import App from "./App";
import localforage from "localforage";

localforage.config({
    driver      : [localforage.INDEXEDDB, localforage.LOCALSTORAGE], 
    name        : 'AnkiNoteWizard',
    version     : 1.0,
    storeName   : 'anki_note_wizard_db',  
});
// // Webpack이 복사한 로컬 경로(dist/vs)를 명시적으로 지정
loader.config({monaco});

document.addEventListener("DOMContentLoaded", ()=>{
  //chrome.runtime.sendMessage({type: "INJECT_CONTENT_SCRIPT"});
});
const container = document.getElementById('root');
if (container) ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);
