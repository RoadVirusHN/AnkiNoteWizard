import commonStyles from "@/front/common.module.css";
import useCustomCard from "@/front/utils/useCustomCard";
import { Form, useParams } from "react-router";
import { useEffect, useRef } from "react";
import CardFieldInput, { CardFieldInputRef } from "./CardFieldInput/CardFieldInput";
import styles from "./modifyCustomCard.module.css";
import type { CardField } from "@/front/utils/useCustomCard";
import Editor, { OnMount, loader } from "@monaco-editor/react";
import {editor} from 'monaco-editor';

const ModifyCustomCard = () => {
  const { index } = useParams();
  const isEditMode = index !== undefined;
  const idx = isEditMode ? parseInt(index) : undefined;
  const { customCards, addCustomCard, modifyCustomCard } = useCustomCard();

  const form = useRef<HTMLFormElement>(null);
  const frontRef = useRef<CardFieldInputRef>(null);
  const backRef = useRef<CardFieldInputRef>(null);
  const frontEditorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const backEditorRef = useRef<editor.IStandaloneCodeEditor>(null);

  const handleBackEditorMount: OnMount = (editor, monaco)=>{
    backEditorRef.current = editor;
  }
  const handleFrontEditorMount : OnMount = (editor, monaco)=>{
    frontEditorRef.current = editor;
  }
  // Add 모드일 때 기본 필드 자동 세팅 (삭제 불가)
  useEffect(() => {
    if (!isEditMode) {
      frontRef.current?.setDefaultFields(
        [
          {
            name: "front",
            content: "h1",
            selectorType: "cssSelector",
            dataType: "text",
            locked: true,
          } as CardField & { locked?: boolean },
        ],
        true
      );
      backRef.current?.setDefaultFields(
        [
          {
            name: "back",
            content: "h2",
            selectorType: "cssSelector",
            dataType: "text",
            locked: true,
          } as CardField & { locked?: boolean },
        ],
        true
      );
    } else {
      // Edit 모드일 때는 기존 카드 필드로 채움
      if (isEditMode && idx !== undefined && customCards[idx]) {
        frontRef.current?.setDefaultFields(
          customCards[idx].Front.fields as (CardField & { locked?: boolean })[],
          false
        );
        backRef.current?.setDefaultFields(
          customCards[idx].Back.fields as (CardField & { locked?: boolean })[],
          false
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, idx]);

  const submitHandler = () => {
    const formData = new FormData(form.current!);
    const cardName = (formData.get("cardName") as string) || "";
    const description = (formData.get("description") as string) || "";
    const frontHtml = (formData.get("FrontHtml") as string) || "";
    const backHtml = (formData.get("BackHtml") as string) || "";
    const urlPatternsRaw = (formData.get("urlPatterns") as string) || "";
    const tagsRaw = (formData.get("tags") as string) || "";
    const rootTag = (formData.get("rootTag") as string) || "";

    const frontFields = frontRef.current?.getFields() ?? [];
    const backFields = backRef.current?.getFields() ?? [];

    const urlPatterns = urlPatternsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = tagsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    // TODO : rootTag 기본값 Body 
    const newCard = {
      cardName,
      description,
      modelName: "Basic",
      rootTag,
      urlPatterns,
      Front: { html: frontHtml, fields: frontFields },
      Back: { html: backHtml, fields: backFields },
      tags,
    };

    if (isEditMode && idx !== undefined) modifyCustomCard(idx, newCard);
    else addCustomCard(newCard);

    frontRef.current?.clearFields();
    backRef.current?.clearFields();
    form.current?.reset();
  };
  // TODO : BUG :  CardField가 Modify 할때마다 늘어남.
  return (
    <div className={`${commonStyles.container} ${styles.wrapper}`}>
      <div className={styles.header}>
        {isEditMode ? `Modify Card #${idx}` : "Add Custom Card"}
      </div>

      <Form ref={form} method="post" onSubmit={(e) => e.preventDefault()} className={styles.form}>
        <div className={styles.basicRow}>
          <input
            name="cardName"
            placeholder="Card Name"
            defaultValue={isEditMode && idx !== undefined ? customCards[idx]?.cardName : ""}
            required
            className={styles.inputMain}
          />
          <textarea
            name="description"
            placeholder="Description"
            defaultValue={isEditMode && idx !== undefined ? customCards[idx]?.description : ""}
            className={styles.textarea}
          />
        </div>

        <div className={styles.metaRow}>
          <input
            name="urlPatterns"
            placeholder="URL patterns (comma separated)"
            defaultValue={isEditMode && idx !== undefined ? (customCards[idx]?.urlPatterns || []).join(", ") : ""}
            className={styles.inputSmall}
          />
          <input
            name="tags"
            placeholder="tags (comma separated)"
            defaultValue={isEditMode && idx !== undefined ? (customCards[idx]?.tags || []).join(", ") : ""}
            className={styles.inputSmall}
          />
          <input
            name="rootTag"
            placeholder="root Css Selector (comma separated)"
            defaultValue={isEditMode && idx !== undefined ? (customCards[idx]?.rootTag || "body") : "body"}
            className={styles.inputSmall}
          />
        </div>

        <div className={styles.cardArea}>
          <div className={styles.cardSide}>
            <h3 className={styles.sideTitle}>Front</h3>
            <Editor
              defaultLanguage="html"
              defaultValue={isEditMode && idx !== undefined ? customCards[idx]?.Front.html : "<p>{{front}}</p>"}
              height={80}
              width={'100%'}
              theme="light"
              onMount={handleFrontEditorMount}
            />
            <div className={styles.scrollArea}>
              <CardFieldInput ref={frontRef} />
            </div>
          </div>

          <div className={styles.cardSide}>
            <h3 className={styles.sideTitle}>Back</h3>
            <Editor
              defaultLanguage="html"
              defaultValue={isEditMode && idx !== undefined ? customCards[idx]?.Back.html : "<p>{{back}}</p>"}
              height={80}
              width={'100%'}
              theme="light"
              onMount={handleBackEditorMount}
            />
            <div className={styles.scrollArea}>
              <CardFieldInput ref={backRef} />
            </div>
          </div>
        </div>

        <div className={styles.submitRow}>
          <button type="button" onClick={submitHandler} className={styles.submitBtn}>
            {isEditMode ? "Modify Card" : "Add Card"}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default ModifyCustomCard;
