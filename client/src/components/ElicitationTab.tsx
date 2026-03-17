import { Alert, AlertDescription } from "@/components/ui/alert";
import { TabsContent } from "@/components/ui/tabs";
import { JsonSchemaType } from "@/utils/jsonUtils";
import ElicitationRequest from "./ElicitationRequest";
import { useTranslation } from "react-i18next";

export interface ElicitationRequestData {
  id: number;
  message: string;
  requestedSchema: JsonSchemaType;
}

export interface ElicitationResponse {
  action: "accept" | "decline" | "cancel";
  content?: Record<string, unknown>;
}

export type PendingElicitationRequest = {
  id: number;
  request: ElicitationRequestData;
  originatingTab?: string;
};

export type Props = {
  pendingRequests: PendingElicitationRequest[];
  onResolve: (id: number, response: ElicitationResponse) => void;
};

const ElicitationTab = ({ pendingRequests, onResolve }: Props) => {
  const { t } = useTranslation();
  return (
    <TabsContent value="elicitations">
      <div className="h-96">
        <Alert>
          <AlertDescription>
            {t('elicitations.description')}
          </AlertDescription>
        </Alert>
        <div className="mt-4 space-y-4">
          <h3 className="text-lg font-semibold">{t('elicitations.recentRequests')}</h3>
          {pendingRequests.map((request) => (
            <ElicitationRequest
              key={request.id}
              request={request}
              onResolve={onResolve}
            />
          ))}
          {pendingRequests.length === 0 && (
            <p className="text-gray-500">{t('elicitations.noPendingRequests')}</p>
          )}
        </div>
      </div>
    </TabsContent>
  );
};

export default ElicitationTab;

