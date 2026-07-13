import { useTranslation } from "react-i18next";
import editorStyles from "./editor.module.css"; // 아래 작성된 CSS 모듈 연결

interface EditorProps {
  toolbarId: string;
  editorId: string;
}

export default function Editor({ toolbarId, editorId }: EditorProps) {
  const { t } = useTranslation('components', { keyPrefix: 'fieldScanInput' });

  // 부모 title 툴팁 유출 억까 방지
  const handleToolbarMouseOver = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <div 
        id={toolbarId} 
        className={editorStyles.ankiToolbar}
        onMouseOver={handleToolbarMouseOver}
      >
        {/* 그룹 1: Anki 제어 버튼 (Fields, Cards, 설정) */}
        <div className={editorStyles.toolGroup}>
          <button type="button" className={editorStyles.ankiActionBtn}>Fields...</button>
          <button type="button" className={editorStyles.ankiActionBtn}>Cards...</button>
          <button type="button" className={editorStyles.ankiIconBtn} title={t('tooltipSettings', '설정')}>⚙️</button>
        </div>

        <div className={editorStyles.divider} />

        {/* 그룹 2: 기본 서식 (B, I, U) */}
        <div className={editorStyles.toolGroup}>
          <button type="button" className="ql-bold" title={t('tooltipBold', '굵게 (Ctrl+B)')}>B</button>
          <button type="button" className="ql-italic" title={t('tooltipItalic', '기울임 (Ctrl+I)')}>I</button>
          <button type="button" className="ql-underline" title={t('tooltipUnderline', '밑줄 (Ctrl+U)')}>U</button>
        </div>

        <div className={editorStyles.divider} />

        {/* 그룹 3: 첨자 (위첨자, 아래첨자) */}
        <div className={editorStyles.toolGroup}>
          {/* Quill v2 스펙: data-value로 super/sub 제어 */}
          <button type="button" className="ql-script" data-value="super" title={t('tooltipSuper', '위첨자')}>X²</button>
          <button type="button" className="ql-script" data-value="sub" title={t('tooltipSub', '아래첨자')}>X₂</button>
        </div>

        <div className={editorStyles.divider} />

        {/* 그룹 4: 색상 및 형광펜 */}
        <div className={editorStyles.toolGroup}>
          {/* 글자색 컬러피커 (Quill 내장 드롭다운) */}
          <select className="ql-color" title={t('tooltipColor', '글자 색상')} defaultValue=""></select>
          {/* 배경색 컬러피커 (붓/형광펜) */}
          <select className="ql-background" title={t('tooltipBgColor', '텍스트 배경색')} defaultValue=""></select>
        </div>

        <div className={editorStyles.divider} />

        {/* 그룹 5: 서식 지우개 */}
        <div className={editorStyles.toolGroup}>
          <button type="button" className="ql-clean" title={t('tooltipClean', '모든 서식 지우기')}>🧼</button>
        </div>

        <div className={editorStyles.divider} />

        {/* 그룹 6: 리스트 및 정렬 */}
        <div className={editorStyles.toolGroup}>
          <button type="button" className="ql-list" data-value="bullet" title={t('tooltipBullet', '글머리 기호')}>•≡</button>
          <button type="button" className="ql-list" data-value="ordered" title={t('tooltipOrdered', '번호 매기기')}>1≡</button>
          <select className="ql-align" title={t('tooltipAlign', '정렬')} defaultValue=""></select>
        </div>

        <div className={editorStyles.divider} />

        {/* 그룹 7: 미디어 및 확장 플러그인 (파일첨부, 녹음, 수식) */}
        <div className={editorStyles.toolGroup}>
          {/* 📎 파일 첨부 버튼 (기존 이미지 기능 하이재킹 가능) */}
          <button type="button" className="ql-image" title={t('tooltipFile', '파일 첨부 (이미지/미디어)')}>📎</button>
          
          {/* 🎙️ 커스텀 녹음 버튼 (나중에 수동 구현할 이벤트 타깃 클래스 부착) */}
          <button type="button" className="ql-voice-record" title={t('tooltipVoice', '목소리 녹음')}>🎙️</button>
          
          {/* fx 수식 입력 모듈 */}
          <button type="button" className="ql-formula" title={t('tooltipFormula', '수식 입력 (LaTeX)')}>fx</button>
        </div>
      </div>
      <div id={editorId}></div>
    </>
  );
}
