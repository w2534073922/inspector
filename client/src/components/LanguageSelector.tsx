import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  return (
    <Select
      value={i18n.language.startsWith('zh') ? 'zh' : 'en'}
      onValueChange={(value) => i18n.changeLanguage(value)}
    >
      <SelectTrigger className="w-[90px]" id="language-select">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t('language.en')}</SelectItem>
        <SelectItem value="zh">{t('language.zh')}</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
