import { useTranslation } from 'react-i18next';

const useLocale = (prefix: string) => {
  const { t } = useTranslation();
  return (key: string) => {
    return t(`${prefix}.${key}`);
  };
};

export default useLocale;
