import { MenuItem } from '@/content/ui/Menu';
import { create } from 'zustand';
import { UIStates } from './Scenearios';

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
  tagHighlight: UIStates.offTagHighlight(),
  setTagHighlight: (highlight) => set({ tagHighlight: highlight }),
  multiHighlight: UIStates.setMultiHighlight([]),
  setMultiHighlight: (highlight) => set({ multiHighlight: highlight }),
  menu: UIStates.offMenu(),
  setMenu: (menu) => set({ menu }),
  tooltip: UIStates.offTooltip(),
  setTooltip: (tooltip) => set({ tooltip }),
  myConfirm: UIStates.offMyConfirm(),
  setMyConfirm: (confirm) => set({ myConfirm: confirm }),
}));

export default useGlobalVarStore;
