import { useTranslation } from "react-i18next";
import { TabsContent } from "@/components/ui/tabs";

const ConsoleTab = () => {
  const { t } = useTranslation();
  return (
    <TabsContent value="console" className="h-96">
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-full font-mono text-sm overflow-auto">
        <div className="opacity-50">{t('console.welcome')}</div>
        {/* Console output would go here */}
      </div>
    </TabsContent>
  );
};

export default ConsoleTab;

