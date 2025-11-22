import { useState, forwardRef, useImperativeHandle } from "react";
import { TemplateFieldDataType, type TemplateField } from "@/front/utils/useTemplates";
import templateFieldStyle from "./templateFieldInput.module.css";

/**
 * 외부에 노출되는 ref 메서드들
 */
export interface TemplateFieldInputRef {
  getFields: () => TemplateField[]; // locked 속성 제거된 배열 반환
  clearFields: () => void;
  setDefaultFields: (fields: (TemplateField & { locked?: boolean })[], lock?: boolean) => void;
}

interface TemplateFieldInputProps {
  defaultValue?: (TemplateField & { locked?: boolean })[];
}

type InternalField = TemplateField & { locked?: boolean };

const TemplateFieldInput = forwardRef<TemplateFieldInputRef, TemplateFieldInputProps>(
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
        { name: "", content: "", dataType: TemplateFieldDataType.TEXT, locked: false, isOptional: true},
      ]);
    };

    const updateField = (index: number, key: keyof TemplateField, value: string|boolean) => {
      setFields((prev) =>
        prev.map((f, i) => (i === index ? { ...f, [key]: value } : f))
      );
    };

    const removeField = (index: number) => {
      setFields((prev) => prev.filter((_, i) => i !== index));
    };

    return (
      <div className={templateFieldStyle.container}>
        {fields.map((field, i) => (
          <div key={i} className={templateFieldStyle.fieldRow}>
            <input
              type="text"
              className={`${templateFieldStyle.input} ${templateFieldStyle.name}`}
              placeholder="name"
              value={field.name}
              onChange={(e) => updateField(i, "name", e.target.value)}
            />
            <input
              type="text"
              className={`${templateFieldStyle.input} ${templateFieldStyle.content}`}
              placeholder="content"
              value={field.content}
              onChange={(e) => updateField(i, "content", e.target.value)}
            />
            <select
              className={`${templateFieldStyle.select} ${templateFieldStyle.datatype}`}
              value={field.dataType}
              onChange={(e) => updateField(i, "dataType", e.target.value)}
            >
              <option value="text">Text</option>
              <option value="audio">Audio</option>
              <option value="image">Image</option>
            </select>

            <input 
            type="checkbox" 
            checked={field.isOptional} 
            onChange={(e)=>updateField(i,"isOptional", e.target.checked)}
            />

            {/* 삭제 버튼은 locked일 때 숨김 */}
            {!field.locked && (
              <button
                type="button"
                className={templateFieldStyle.removeBtn}
                onClick={() => removeField(i)}
                title="Remove field"
              >
                ×
              </button>
            )}

            {field.locked && (
              <div className={templateFieldStyle.lockBadge} title="Required">
                🔒
              </div>
            )}
          </div>
        ))}

        <div className={templateFieldStyle.controls}>
          <button type="button" onClick={addField} className={templateFieldStyle.addBtn}>
            + Add Field
          </button>
        </div>
      </div>
    );
  }
);

export default TemplateFieldInput;
