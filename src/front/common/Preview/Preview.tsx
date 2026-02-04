import DOMPurify from "dompurify";
import previewStyle from "./preview.module.css";
import { ReactEventHandler, useState } from "react";
import root from "react-shadow";
import FilterIcon from "@/public/Icon/Icon-Filter.svg"
import Icon from "../Icon/Icon";
import useLocale from "@/front/utils/useLocale";

/*
  TODO:
  자바스크립트 차단(기본) : Dompurify 자바스크립트 완전 삭제, 외부 링크 접속 url시 경고, shadow Dom으로 CSS, fixed pos 방지
  자바스크립트 허용 : Dompurify + iframe 태그를 이용한 자바스크립 실행, 외부 링크 접속 url시 경고
  폰트는 없을때 기본 폰트 사용, href, src에는 https만 허용, data:는 이미지에만 허용
  외부 이미지 error시 대체 텍스트 표시
  입력길이 제한
  마우스 커서 오버시 위험요소 툴팁 표시


  shadowdom과 css isolation 공부하기
  iframe sandbox 옵션 공부하기

*/

enum PreviewMode {
  SAFE = 'safe',
  ALLOW_JS = 'allow-js',
}
const Preview = ({html} : {html:string}) => {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    RETURN_TRUSTED_TYPE: true,
  });
  const removed = DOMPurify.removed;
  const [mode, setMode] = useState<PreviewMode>(PreviewMode.SAFE);
  const tl = useLocale('component.Preview');
  const handleImageError : ReactEventHandler<HTMLDivElement>= (e) => {
    if (e.currentTarget.tagName === 'IMG') {
      (e.currentTarget as HTMLImageElement).src = "base64-encoded-placeholder-image"; // 대체 이미지 경로  
      // 무한 루프 방지: 대체 이미지마저 로딩 실패할 경우를 대비해 핸들러 제거
      e.currentTarget.onerror = null; 
    }
  };
  return (
  <div>
    <div className={previewStyle.modeSelector}>
      {removed && removed.length > 0 && 
        <Icon 
          url={FilterIcon} 
          title={tl("Some elementsscriptstags were removed for security reasons.")}/>}
      <form>
        <label>
          <input 
            type="radio" 
            name="previewMode" 
            value={PreviewMode.SAFE} 
            checked={mode === PreviewMode.SAFE} 
            onChange={() => setMode(PreviewMode.SAFE)} 
            />
          Safe Mode
        </label>
        <label>
          <input 
            type="radio" 
            name="previewMode" 
            value={PreviewMode.ALLOW_JS} 
            checked={mode === PreviewMode.ALLOW_JS} 
            onChange={() => setMode(PreviewMode.ALLOW_JS)} 
            />
          Allow JavaScript
        </label>
      </form>
    </div>
    {
      mode === PreviewMode.SAFE ?
      <root.div className={`${previewStyle.previewWrapper} ${previewStyle.safeMode}`}>
        <div 
        className={previewStyle.preview}
        onErrorCapture={handleImageError}
        dangerouslySetInnerHTML={{__html: sanitizedHtml}} 
        />
      </root.div> :
      <div className={previewStyle.previewWrapper}>
        <iframe 
          className={previewStyle.preview} 
          // credentialless="true" // 아직 typescript 지원 안함 : 쿠키, 네트워크, 로컬 스토리지 접근 차단
          srcDoc={sanitizedHtml.toString()} 
          onErrorCapture={handleImageError}
          sandbox="allow-scripts allow-popups allow-forms"
          title="Preview Frame"
        />
      </div>
    }
  </div>);
};
export default Preview;