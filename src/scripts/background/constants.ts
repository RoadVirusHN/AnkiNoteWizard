import { Template, TemplateFieldDataType } from '@/front/utils/useTemplates';

export const STORAGE_KEY = 'anki-card-wizard-global-var-store';
export const defaultTemplates: Template[] = [
  {
    meta: {},
    templateName: 'Default Template',
    modelName: 'Basic',
    urlPatterns: [],
    rootTag: 'body',
    Front: {
      html: '{{Front}}',
      fields: [
        { name: 'Front', content: '', dataType: TemplateFieldDataType.TEXT, isOptional: false },
      ],
    },
    Back: {
      html: '{{Back}}',
      fields: [
        { name: 'Back', content: '', dataType: TemplateFieldDataType.TEXT, isOptional: false },
      ],
    },
    tags: [],
  },
];
