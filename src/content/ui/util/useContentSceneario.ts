import { INSPECTION_MODE, InspectionMode } from '@/types/app.types';
import useContentUI from './useContentUI';
import {
  getCommonSelector,
  getRelativeSelector,
  isValidElement,
  tagToText,
} from '@/content/function';
import commonStyles from '../common.module.css';
import { MenuItem } from '../Menu';
import { MESSAGE_TYPE } from '@/types/chrome.types';
import useLocale from '@/panel/hooks/useLocale';
import { EXTENSION_UI_ID } from '@/content/constants';
import { UIStates } from './Scenearios';
import { useShallow } from 'zustand/react/shallow';
// const INSPECTION_STATE = {
//   HIGHLIGHT: 'HIGHLIGHT',
//   MENU: 'MENU',
//   TOOLTIP: 'TOOLTIP',
//   SELECTOR_CONFIRM: 'SELECTOR_CONFIRM',
// } as const;
// type InspectionState = (typeof INSPECTION_STATE)[keyof typeof INSPECTION_STATE];

export const useContentScenario = ({
  mode,
  port,
  roots,
  deactivate,
}: {
  mode: InspectionMode;
  port: chrome.runtime.Port;
  roots: HTMLElement[];
  deactivate: () => void;
}) => {
  // const { setTagHighlight, setMultiHighlight, setMenu, setTooltip, setMyConfirm } = useContentUI();
  const { setTagHighlight, setMultiHighlight, setMenu, setTooltip, setMyConfirm } = useContentUI(
    useShallow((state)=>({
      setTagHighlight: state.setTagHighlight,
      setMultiHighlight: state.setMultiHighlight,
      setMenu: state.setMenu,
      setTooltip: state.setTooltip,
      setMyConfirm: state.setMyConfirm,
    }))
  );
  const tl = useLocale('background');
  const deClick = (e: MouseEvent) => {
    if (!e.target || !(e.target instanceof HTMLElement)) return;
    if (!e.target.closest(`div.${CSS.escape(commonStyles.menu)}`)) {
      setTagHighlight(UIStates.initTagHighlight(onHighlightClick));
    }
  };
  const showMenu = (items: MenuItem[], x: number, y: number, header: string) => {
    // 메뉴 표시 후 클릭 이벤트가 메뉴 외부에서 발생하면 메뉴 숨김
    setMenu({ isShowing: true, items, x, y, header, deClick });
    setTagHighlight(UIStates.offTagHighlight());
  };
  const showTooltip = (text: string, x: number, y: number) => {
    setTooltip({ isShowing: true, text, x, y });
    port.postMessage({ type: MESSAGE_TYPE.SEND_INSPECTION_DATA_FROM_CONTENT, data: text });
    setTimeout(() => {
      deactivate();
    }, 2000); // 2초 후에 툴팁 숨김
  };
  // 클립보드 복사 및 툴팁 표시
  const copyToClipboard = (text: string, x: number, y: number, _port: chrome.runtime.Port) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showTooltip(text, x, y);
      })
      .catch((err) => console.error(err));
  };

  const createMenuItems = (target: HTMLElement, pos: { x: number; y: number }): MenuItem[] => {
    const { x, y } = pos;
    setMultiHighlight(UIStates.setMultiHighlight([target]));
    return [
      {
        key: '📄 ' + tl('Extract Text'),
        onClick: () => {
          const text = target.textContent?.trim() || '';
          copyToClipboard(text, x, y, port);
        },
      },
      {
        key: '🎯 ' + tl('Extract Selector'),
        onClick: () => {
          let selectors = [] as string[];
          if (mode === INSPECTION_MODE.TAG_EXTRACTION) {
            selectors = [
              getCommonSelector(target, [EXTENSION_UI_ID, ...Object.keys(commonStyles)]),
            ];
          } else {
            let found = false;
            for (const root of roots) {
              if (root.contains(target)) {
                console.log('Found target within root: ', root);
                selectors = [getRelativeSelector(target, root)];
                found = true;
                break;
              }
            }
            if (
              !found &&
              !confirm(tl('selected tag does not child of root, copy selector anyway?'))
            ) {
              return;
            }
          }

          setMenu({
            isShowing: true,
            x,
            y,
            header: tl('Extracted Selectors'),
            deClick,
            items: Array.from(selectors, (s) => ({
              key: s,
              onClick: () => {
                const elements = document.querySelectorAll(s);
                UIStates.setMultiHighlight(Array.from(elements) as HTMLElement[]);
                setMyConfirm({
                  isShowing: true,
                  text: tl('Does the selector correctly select the element?'),
                  onConfirm: () => {
                    copyToClipboard(s, x, y, port);
                    setMultiHighlight(UIStates.setMultiHighlight([]));
                  },
                  onCancel: () => {
                    setMultiHighlight(UIStates.setMultiHighlight([]));
                  },
                });
              },
            })),
          });
        },
      },
      {
        key:
          '🧑🏽‍🍼 ' +
          tl('Select Parent') +
          ` (${!target.parentElement || target.tagName === 'BODY' ? 'No Parent' : ''})`,
        onClick: (e) => {
          e.stopPropagation();
          const parent = target.parentElement;
          if (!parent || parent.tagName === 'BODY') return;
          setMenu({
            isShowing: true,
            x,
            y,
            deClick,
            items: createMenuItems(parent, { x, y }),
            header: tagToText(parent),
          });
          setMultiHighlight(UIStates.setMultiHighlight([parent]));
        },
        onHover: () => {
          const parent = target.parentElement;
          if (!parent || parent.tagName === 'BODY') {
            setMultiHighlight(UIStates.setMultiHighlight([]));
            return;
          }
          setMultiHighlight(UIStates.setMultiHighlight([parent]));
        },
        onMouseLeave: () => {
          setMultiHighlight(UIStates.setMultiHighlight([target]));
        },
      },
      {
        key: '📂 ' + tl('Select Children') + ` (${target.children.length ?? 'No Children'})`,
        onClick: (e) => {
          e.stopPropagation();
          const children = Array.from(target.children) as HTMLElement[];
          if (children.length === 0) return;
          const rect = target.getBoundingClientRect();
          setMenu({
            isShowing: true,
            x: rect.left,
            y: rect.top,
            header: tagToText(target),
            deClick,
            items: [
              {
                key: '⬅',
                onClick: () => {
                  setMenu({
                    isShowing: true,
                    x: rect.left,
                    y: rect.top,
                    header: tagToText(target),
                    deClick,
                    items: createMenuItems(target, { x: rect.left, y: rect.top }),
                  });
                },
                onHover: () => {
                  setMultiHighlight(UIStates.setMultiHighlight([target]));
                },
              },
              ...Array.from(children, (child) => ({
                key: tagToText(child),
                onClick: (e: MouseEvent) => {
                  e.stopPropagation();
                  const rect = child.getBoundingClientRect();
                  setMenu({
                    isShowing: true,
                    x: rect.x,
                    y: rect.y,
                    header: tagToText(child),
                    items: createMenuItems(child, { x: rect.x, y: rect.y }),
                    deClick,
                  });
                  setMultiHighlight(UIStates.setMultiHighlight([child]));
                },
                onHover: () => {
                  setMultiHighlight(UIStates.setMultiHighlight([child]));
                },
                onMouseLeave: () => {
                  setMultiHighlight(UIStates.setMultiHighlight([target]));
                },
              })),
            ],
          });
        },
        onHover: () => {
          setMultiHighlight(
            UIStates.setMultiHighlight(Array.from(target.children) as HTMLElement[])
          );
        },
        onMouseLeave: () => {
          setMultiHighlight(UIStates.setMultiHighlight([target]));
        },
      },
    ];
  };
  const onHighlightClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target;
    const rect = (target as HTMLElement).getBoundingClientRect();
    if (!(target instanceof HTMLElement && isValidElement(target))) return;
    if (mode == INSPECTION_MODE.TAG_EXTRACTION || mode === INSPECTION_MODE.FIELD_EXTRACTION) {
      showMenu(
        createMenuItems(target, { x: e.clientX, y: e.clientY }),
        e.clientX,
        e.clientY,
        tagToText(target)
      );
    } else {
      copyToClipboard((target.textContent ?? '').trim(), rect.left, rect.top, port);
    }
  };
  setTagHighlight(UIStates.initTagHighlight(onHighlightClick));
};
