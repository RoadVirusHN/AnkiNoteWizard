import { MenuItem } from '@/content/ui/Menu';
import { create } from 'zustand';

interface ContentUIState {
  tagHighlight: {
    isShowing: boolean;
    onClick: ((e:MouseEvent) => void);
    borderColor: string;
    backgroundColor: string;
  },
  setTagHighlight: (highlight: ContentUIState['tagHighlight']) => void;
  multiHighlight: {
    targets: HTMLElement[];
    borderColor: string;
    backgroundColor: string;
  };
  setMultiHighlight: (highlight: ContentUIState['multiHighlight']) => void;
  menu: {
    isShowing: boolean;
    items: MenuItem[];
    x: number;
    y: number;
    header: string;
    deClick: (e:MouseEvent) => void;
  };
  setMenu: (menu: ContentUIState['menu']) => void;
  tooltip: {
    isShowing: boolean;
    text: string;
    x: number;
    y: number;
  };
  setTooltip: (tooltip: ContentUIState['tooltip']) => void;
  myConfirm: {
    isShowing: boolean;
    text: string;
    onConfirm: () => void;
    onCancel: () => void;
  };
  setMyConfirm: (confirm: ContentUIState['myConfirm']) => void;
}

const useGlobalVarStore = create<ContentUIState>()((set) => ({
  tagHighlight: {
    isShowing: false,
    onClick: () => {},
    borderColor: 'var(--color-hyperlink)',
    backgroundColor: 'rgba(173, 216, 230, 0.5)',
  },
  setTagHighlight: (highlight) => set({ tagHighlight: highlight }),
  multiHighlight: {
    targets: [],
    borderColor: 'var(--color-on)',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  setMultiHighlight: (highlight) => set({ multiHighlight: highlight }),
  menu: {
    isShowing: false,
    items: [],
    x: 0,
    y: 0,
    header: '',
    deClick: () => {},
  },
  setMenu: (menu) => set({ menu }),
  tooltip: {
    isShowing: false,
    text: '',
    x: 0,
    y: 0,
  },
  setTooltip: (tooltip) => set({ tooltip }),
  myConfirm: {
    isShowing: false,
    text: '',
    onConfirm: () => {},
    onCancel: () => {},
  },
  setMyConfirm: (confirm) => set({ myConfirm: confirm }),
}));

export default useGlobalVarStore;
