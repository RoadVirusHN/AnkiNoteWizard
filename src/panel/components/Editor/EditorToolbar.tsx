import { useTranslation } from "react-i18next";
import editorStyles from "./editor.module.css"; // 아래 작성된 CSS 모듈 연결
import { RefObject, useEffect } from "react";

interface EditorToolbarProps {
  toolbarRef: RefObject<HTMLDivElement|null>;
  keyName: string;
}

// INFO : react strict 모드에서는 quill js의 한계로 dropdown류가 버튼을 2개씩 생성해서 먹통, 테스트 필요시 root.tsx에서
// <React.StrictMode> 제거하고 테스트
export default function EditorToolbar({ toolbarRef, keyName }: EditorToolbarProps) {
  const { t } = useTranslation('components', { keyPrefix: 'editorToolbar' });
  // WARN : position : sticky는 오직 scroll 부모와 이 요소 사이의 모든 조상 태그의 overflow가 모두 visible일 때만 작동함.
  // 부모 title 툴팁 유출 억까 방지
  const handleToolbarMouseOver = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  useEffect(()=>{
    const toolbar = document.querySelector('.ql-toolbar'); // 또는 툴바 ref

    if (toolbar) {
      toolbar.addEventListener('click', (e) => {
        // 1. 클릭된 요소가 드롭다운 옵션(.ql-picker-item)인지 확인
        const item = (e.target as Element)?.closest('.ql-picker-item');
        if (!item) return;

        // 2. 해당 드롭다운(.ql-picker)과 짝지어진 숨겨진 <select> 찾기
        const picker = item.closest('.ql-picker');
        const select = picker?.previousElementSibling;

        if (select && select.tagName === 'SELECT') {
          const value = item.getAttribute('data-value') || '';
          
          // 3. select 값을 강제로 동기화하고 bubbles: true를 포함해 change 이벤트 재발송
          (select as HTMLSelectElement).value = value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }
  },[]);
// disable 글씨 색깔 연함
// clicked 바탕 파란색
// hover 버튼 위아래 조명
// disable + hover pointer 금지
// deactivate : disabled class 
 return (
      <div 
        ref={toolbarRef} 
        className={`${editorStyles.ankiToolbar}`}
        onMouseOver={handleToolbarMouseOver}
        onClick={(e)=>{e.stopPropagation();e.preventDefault();}}
      >
        {/* 그룹 1: Anki 제어 버튼 (Fields, Cards, 설정) */}
        {/* <div className={editorStyles.toolGroup}>
          <button type="button" className={editorStyles.ankiActionBtn}>Fields...</button>
          <button type="button" className={editorStyles.ankiActionBtn}>Cards...</button>
          <button type="button" className={editorStyles.ankiIconBtn} title={t('tooltipSettings', '설정')}>⚙️</button>
        </div>

        <div className={editorStyles.divider} /> */}

        {/* 그룹 2: 기본 서식 (B, I, U) */}
        <div className={editorStyles.toolGroup}>
          <button type="button" className="ql-bold" title={t('tooltipBold')}>B</button>
          <button type="button" className="ql-italic" title={t('tooltipItalic')}>I</button>
          <button type="button" className="ql-underline" title={t('tooltipUnderline')}>U</button>
        </div>

        <div className={editorStyles.divider} />

        {/* 그룹 3: 첨자 (위첨자, 아래첨자) */}
        <div className={editorStyles.toolGroup}>
          {/* Quill v2 스펙: data-value로 super/sub 제어 */}
          <button type="button" className="ql-script" value="super" title={t('tooltipSuper')}>X²</button>
          <button type="button" className="ql-script" value="sub" title={t('tooltipSub')}>X₂</button>
        </div>

        <div className={editorStyles.divider} />

        {/* 그룹 4: 색상 및 형광펜, 스크롤 안넘어가게 중앙정도로 커스텀하기 */}
        <div className={editorStyles.toolGroup}>
          {/* 글자색 컬러피커 (Quill 내장 드롭다운) */}
          <select className="ql-color" title={t('tooltipColor')} defaultValue=""></select>
          {/* 배경색 컬러피커 (붓/형광펜) */}
          <select className="ql-background" title={t('tooltipBgColor')} defaultValue=""></select>
        </div>

        <div className={editorStyles.divider} />

        {/* 그룹 5: 서식 지우개 */}
        <div className={editorStyles.toolGroup}>
          <button type="button" className="ql-clean" title={t('tooltipClean')}>🧼</button>
        </div>

        <div className={editorStyles.divider} />

        {/* 그룹 6: 리스트 및 정렬 */}
        <div className={editorStyles.toolGroup}>
          <button type="button" className="ql-list" value="bullet" title={t('tooltipBullet')}>•≡</button>
          <button type="button" className="ql-list" value="ordered" title={t('tooltipOrdered')}>1≡</button>
          <select id={keyName+"_align"} className="ql-align" title={t('tooltipAlign', '정렬')}></select>
        </div>

        <div className={editorStyles.divider} />

        {/* 그룹 7: 미디어 및 확장 플러그인 (파일첨부, 녹음, 수식) */}
        <div className={editorStyles.toolGroup}>
          {/* 📎 파일 첨부 버튼 (기존 이미지 기능 하이재킹 가능) */}
          <button type="button" className="ql-image" title={t('tooltipFile')}>📎</button>
          
          {/* 🎙️ 커스텀 녹음 버튼 (나중에 수동 구현할 이벤트 타깃 클래스 부착) */}
          <button type="button" className="ql-voice-record" title={t('tooltipVoice')}>🎙️</button>
          
          {/* fx 수식 입력 모듈 */}
          <button type="button" className="ql-formula" title={t('tooltipFormula')}>fx</button>
        </div>
      </div>
  );
}
