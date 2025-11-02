import { useState, forwardRef, useImperativeHandle } from "react";
import { CardFieldDataType, CardFieldSelectorType, type CardField } from "@/front/utils/useCustomCard";
import styles from "./cardFieldInput.module.css";

/**
 * 외부에 노출되는 ref 메서드들
 */
export interface CardFieldInputRef {
  getFields: () => CardField[]; // locked 속성 제거된 배열 반환
  clearFields: () => void;
  setDefaultFields: (fields: (CardField & { locked?: boolean })[], lock?: boolean) => void;
}

interface CardFieldInputProps {
  defaultValue?: (CardField & { locked?: boolean })[];
}

type InternalField = CardField & { locked?: boolean };

const CardFieldInput = forwardRef<CardFieldInputRef, CardFieldInputProps>(
  ({ defaultValue = [] }, ref) => {
    const [fields, setFields] = useState<InternalField[]>(() =>
      (defaultValue || []).map((f) => ({ ...f }))
    );

    useImperativeHandle(ref, () => ({
      getFields: () => fields.map(({ locked, ...rest }) => rest),
      clearFields: () => setFields([]),
      setDefaultFields: (flds, lock = false) => {
        setFields((prev) => [
          ...flds.map((f) => ({ ...f, locked: lock || f.locked })),
          ...prev.filter((p) => !p.locked), // 기존 잠긴 것들은 유지, 비잠긴것은 뒤에 붙음
        ]);
      },
    }));

    const addField = () => {
      setFields((prev) => [
        ...prev,
        { name: "", content: "", selectorType: CardFieldSelectorType.CSSSelector, dataType: CardFieldDataType.TEXT, locked: false },
      ]);
    };

    const updateField = (index: number, key: keyof CardField, value: string) => {
      setFields((prev) =>
        prev.map((f, i) => (i === index ? { ...f, [key]: value } : f))
      );
    };

    const removeField = (index: number) => {
      setFields((prev) => prev.filter((_, i) => i !== index));
    };

    return (
      <div className={styles.container}>
        {fields.map((field, i) => (
          <div key={i} className={styles.fieldRow}>
            <input
              type="text"
              className={`${styles.input} ${styles.name}`}
              placeholder="name"
              value={field.name}
              onChange={(e) => updateField(i, "name", e.target.value)}
            />
            <input
              type="text"
              className={`${styles.input} ${styles.content}`}
              placeholder="content"
              value={field.content}
              onChange={(e) => updateField(i, "content", e.target.value)}
            />
            <select
              className={`${styles.select} ${styles.selector}`}
              value={field.selectorType}
              onChange={(e) => updateField(i, "selectorType", e.target.value)}
            >
              <option value="literal">Literal</option>
              <option value="cssSelector">CSS</option>
              <option value="url">URL</option>
            </select>
            <select
              className={`${styles.select} ${styles.datatype}`}
              value={field.dataType}
              onChange={(e) => updateField(i, "dataType", e.target.value)}
            >
              <option value="text">Text</option>
              <option value="audio">Audio</option>
              <option value="image">Image</option>
            </select>

            {/* 삭제 버튼은 locked일 때 숨김 */}
            {!field.locked && (
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeField(i)}
                title="Remove field"
              >
                ×
              </button>
            )}

            {field.locked && (
              <div className={styles.lockBadge} title="Required">
                🔒
              </div>
            )}
          </div>
        ))}

        <div className={styles.controls}>
          <button type="button" onClick={addField} className={styles.addBtn}>
            + Add Field
          </button>
        </div>
      </div>
    );
  }
);

export default CardFieldInput;
