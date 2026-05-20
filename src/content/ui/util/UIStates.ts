export const UIStates ={
  offTagHighlight: () => ({
    isShowing: false,
    onClick: () => {},
    borderColor: 'var(--color-hyperlink)',
    backgroundColor: 'rgba(173, 216, 230, 0.5)',
  }),
  initTagHighlight: (onClick:(e:MouseEvent)=>void)=>({
    isShowing: true,
    onClick,
    borderColor: 'var(--color-hyperlink)',
    backgroundColor: 'rgba(173, 216, 230, 0.5)',
  }),
  setMultiHighlight: (targets:HTMLElement[])=>({
    targets,
    borderColor: 'var(--color-on)',
    backgroundColor: 'rgba(0,0,0,0)',
  }),
  offMenu: () => ({
    isShowing: false,
    items: [],
    x: 0,
    y: 0,
    header: '',
    deClick: () => {},
  }),
  offTooltip: () => ({
    isShowing: false,
    text: '',
    x: 0,
    y: 0,
  }),
  offMyConfirm: () => ({
    isShowing: false,
    text: '',
    onConfirm: () => {},
    onCancel: () => {},
  }),
};