import { useState, forwardRef, useImperativeHandle } from "react";
import templateFieldStyle from "./templateFieldInput.module.css";
import useLocale from "@/front/utils/useLocale";
import { TemplateItem, TemplateItemDataType } from "@/types/scanRule.types";

/**
 * 외부에 노출되는 ref 메서드들
 */
export interface TemplateItemInputRef {
  getItems: () => TemplateItem[]; // locked 속성 제거된 배열 반환
  clearItems: () => void;
  setDefaultItems: (fields: (TemplateItem & { locked?: boolean })[], lock?: boolean) => void;
}

interface TemplateItemInputProps {
  defaultValue?: (TemplateItem & { locked?: boolean })[];
}

type InternalItem = TemplateItem & { locked?: boolean };

const TemplateItemInput = forwardRef<TemplateItemInputRef, TemplateItemInputProps>(
  ({ defaultValue = [] }, ref) => {
    const [items, setItems] = useState<InternalItem[]>(() =>
      (defaultValue || []).map((f) => ({ ...f }))
    );

    useImperativeHandle(ref, () => ({
      getItems: () => items.map(({ locked, ...rest }) => rest),
      clearItems: () => setItems([]),
      setDefaultItems: (flds, lock = false) => {
        setItems((prev) => [
          ...flds.map((f) => ({ ...f, locked: lock || f.locked })),
          ...prev.filter((p) => !p.locked), // 기존 잠긴 것들은 유지, 비잠긴것은 뒤에 붙음
        ]);
      },
    }));

    const addField = () => {
      setItems((prev) => [
        ...prev,
        { name: "", content: "", dataType: TemplateItemDataType.TEXT, locked: false, isOptional: true},
      ]);
    };

    const updateField = (index: number, key: keyof TemplateItem, value: string|boolean) => {
      setItems((prev) =>
        prev.map((f, i) => (i === index ? { ...f, [key]: value } : f))
      );
    };

    const removeField = (index: number) => {
      setItems((prev) => prev.filter((_, i) => i !== index));
    };
    const tl = useLocale('pages.ModifyTemplate.TemplateSideEditor.TemplateFieldInput');
    return (
      <div className={templateFieldStyle.container}>
        {items.map((field, i) => (
          <div key={i} className={templateFieldStyle.fieldRow}>
            <input
              type="text"
              className={`${templateFieldStyle.input} ${templateFieldStyle.name}`}
              placeholder={tl("Name",'pages.ModifyTemplate.TemplateSideEditor.')}
              value={field.name}
              onChange={(e) => updateField(i, "name", e.target.value)}
            />
            <input
              type="text"
              className={`${templateFieldStyle.input} ${templateFieldStyle.content}`}
              placeholder={tl("content")}
              value={field.content}
              onChange={(e) => updateField(i, "content", e.target.value)}
            />
            <select
              className={`${templateFieldStyle.select} ${templateFieldStyle.datatype}`}
              value={field.dataType}
              onChange={(e) => updateField(i, "dataType", e.target.value)}
            >
              <option value="text">{tl('Text','pages.ModifyTemplate.TemplateSideEditor.')}</option>
              <option value="audio">{tl('Audio','pages.ModifyTemplate.TemplateSideEditor.')}</option>
              <option value="image">{tl('Image','pages.ModifyTemplate.TemplateSideEditor.')}</option>
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
                title={tl("Remove field")}
              >
                ×
              </button>
            )}

            {field.locked && (
              <div className={templateFieldStyle.lockBadge} title={tl("Required")}>
                🔒
              </div>
            )}
          </div>
        ))}

        <div className={templateFieldStyle.controls}>
          <button type="button" onClick={addField} className={templateFieldStyle.addBtn}>
            {"+ " + tl('Add Field')}
          </button>
        </div>
      </div>
    );
  }
);

export default TemplateItemInput;
