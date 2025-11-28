import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import router from "./router/AnkiRouter";

import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';

// // Webpack이 복사한 로컬 경로(dist/vs)를 명시적으로 지정
loader.config({monaco});

document.addEventListener("DOMContentLoaded", ()=>{
  //chrome.runtime.sendMessage({type: "INJECT_CONTENT_SCRIPT"});
});
const container = document.getElementById('root');
if (container) ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);
