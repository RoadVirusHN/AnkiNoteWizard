import React from "react";
import ReactDOM from "react-dom/client";
import Popup from "@/front/components/pages/Popup/Popup";
import { RouterProvider } from "react-router";
import router from "./router/AnkiRouter";

import { loader } from '@monaco-editor/react';

// Webpack이 복사한 로컬 경로(dist/vs)를 명시적으로 지정
loader.config({
  paths: {
    vs: './vs', 
  },
});
const container = document.getElementById('root');
if (container) ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);
