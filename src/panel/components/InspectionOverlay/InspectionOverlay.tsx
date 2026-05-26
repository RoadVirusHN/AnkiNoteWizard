import { INSPECTION_MODE, InspectionMode } from "@/types/app.types";
import inspectionOverlayStyle from "./InspectionOverlay.module.css";
import { useTranslation } from "react-i18next";

const InspectionOverlay = ({ mode, cancleInspectionMode }: { mode: InspectionMode; cancleInspectionMode: () => void }) => {
  const { t } = useTranslation("components", { keyPrefix: "inspectionOverlay" });

  return (
    <>
      <div className={inspectionOverlayStyle.overlay} onClick={cancleInspectionMode}>
        <div className={inspectionOverlayStyle["instruction-box"]}>
          <span className={inspectionOverlayStyle["left-pointer"]}>◀</span>
          <span className={inspectionOverlayStyle["left-pointer"]}>◀</span>
          <span className={inspectionOverlayStyle["left-pointer"]}>◀</span>
          <span className={inspectionOverlayStyle["left-pointer"]}>◀</span>
          {mode == INSPECTION_MODE.TEXT_EXTRACTION ? (
            <>
              <h1>{t("textModeTitle")}</h1>
              <ol>
                <li>{t("hoverText")}</li>
                <li>{t("clickToCopy")}</li>
                <li>{t("pasteAnywhere")}</li>
              </ol>
            </>
          ) : (
            <>
              <h1>{t("tagModeTitle")}</h1>
              <ol>
                <li>{t("hoverTag")}</li>
                <li>
                  {t("clickToOpenMenu")}
                  <ul>
                    <li>{t("extractTextDescription")}</li>
                    <li>{t("extractSelectorDescription")}</li>
                    <li>{t("selectChildrenDescription")}</li>
                  </ul>
                </li>
                <li>{t("clickToCopy")}</li>
                <li>{t("pasteAnywhere")}</li>
              </ol>
            </>
          )}
          <h2>* {t("exitInstruction")}</h2>
          <span className={inspectionOverlayStyle["left-pointer"]}>◀</span>
          <span className={inspectionOverlayStyle["left-pointer"]}>◀</span>
          <span className={inspectionOverlayStyle["left-pointer"]}>◀</span>
          <span className={inspectionOverlayStyle["left-pointer"]}>◀</span>
        </div>
      </div>
    </>
  );
};

export default InspectionOverlay;