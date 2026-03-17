import { Alert, AlertDescription } from "@/components/ui/alert";
import { TabsContent } from "@/components/ui/tabs";
import {
  CreateMessageRequest,
  CreateMessageResult,
} from "@modelcontextprotocol/sdk/types.js";
import SamplingRequest from "./SamplingRequest";
import { useTranslation } from "react-i18next";

export type PendingRequest = {
  id: number;
  request: CreateMessageRequest;
  originatingTab?: string;
};

export type Props = {
  pendingRequests: PendingRequest[];
  onApprove: (id: number, result: CreateMessageResult) => void;
  onReject: (id: number) => void;
};

const SamplingTab = ({ pendingRequests, onApprove, onReject }: Props) => {
  const { t } = useTranslation();
  return (
    <TabsContent value="sampling">
      <div className="h-96">
        <Alert>
          <AlertDescription>
            {t('sampling.description')}
          </AlertDescription>
        </Alert>
        <div className="mt-4 space-y-4">
          <h3 className="text-lg font-semibold">{t('sampling.recentRequests')}</h3>
          {pendingRequests.map((request) => (
            <SamplingRequest
              key={request.id}
              request={request}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
          {pendingRequests.length === 0 && (
            <p className="text-gray-500">{t('sampling.noPendingRequests')}</p>
          )}
        </div>
      </div>
    </TabsContent>
  );
};

export default SamplingTab;

