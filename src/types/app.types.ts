
export interface FetchAnkiRequestBody {
  action: string;
  params?: Record<string, unknown>;
}


export enum ThemeSetting {
  NONE = 'none',
  SYSTEM_DARK = 'system-dark',
  SYSTEM_LIGHT = 'system-light',
  LIGHT = 'light',
  DARK = 'dark',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum Language {
  EN = 'en',
  KO = 'ko',
}
export enum Tab {
  DETECT = 'DETECT',
  ADD = 'ADD',
  HISTORY = 'HISTORY',
  TEMPLATES = 'TEMPLATES',
  CONFIG = 'CONFIG',
}

export enum TooltipDirection{
  TOP = 'tooltip-top',
  BOTTOM  = 'tooltip-bottom',
  LEFT = 'tooltip-left',
  RIGHT = 'tooltip-right',
  UP_LEFT = 'tooltip-up-left',
  UP_RIGHT = 'tooltip-up-right',
  BOTTOM_LEFT = 'tooltip-bottom-left',
  BOTTOM_RIGHT = 'tooltip-bottom-right',
}

export enum TEMPLATE_CODE {
  OK = 'OK',
  INVALID_TEMPLATE_NAME = 'INVALID_TEMPLATE_NAME',
  DUPLICATE_TEMPLATE_NAME = 'DUPLICATE_TEMPLATE_NAME',
  INVALID_AUTHOR_NAME = 'INVALID_AUTHOR_NAME',
  INVALID_MODEL = 'INVALID_MODEL',
  INVALID_ROOT_TAG = 'INVALID_ROOT_TAG',
  NO_SUCH_TEMPLATE = 'NO_SUCH_TEMPLATE',
}
