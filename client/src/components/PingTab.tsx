import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const PingTab = ({ onPingClick }: { onPingClick: () => void }) => {
  const { t } = useTranslation();
  return (
    <TabsContent value="ping">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 flex justify-center items-center">
          <Button
            onClick={onPingClick}
            className="font-bold py-6 px-12 rounded-full"
          >
            {t('ping.pingServer')}
          </Button>
        </div>
      </div>
    </TabsContent>
  );
};

export default PingTab;

