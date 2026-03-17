import { useState, useCallback } from "react";
import {
  Play,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Bug,
  Github,
  Eye,
  EyeOff,
  RotateCcw,
  Settings,
  HelpCircle,
  RefreshCwOff,
  Copy,
  CheckCheck,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LoggingLevel,
  LoggingLevelSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { InspectorConfig } from "@/lib/configurationTypes";
import { ConnectionStatus } from "@/lib/constants";
import useTheme from "../lib/hooks/useTheme";
import { version } from "../../../package.json";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import CustomHeaders from "./CustomHeaders";
import { CustomHeaders as CustomHeadersType } from "@/lib/types/customHeaders";
import { useToast } from "../lib/hooks/useToast";
import IconDisplay, { WithIcons } from "./IconDisplay";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

interface SidebarProps {
  connectionStatus: ConnectionStatus;
  transportType: "stdio" | "sse" | "streamable-http";
  setTransportType: (type: "stdio" | "sse" | "streamable-http") => void;
  command: string;
  setCommand: (command: string) => void;
  args: string;
  setArgs: (args: string) => void;
  sseUrl: string;
  setSseUrl: (url: string) => void;
  env: Record<string, string>;
  setEnv: (env: Record<string, string>) => void;
  // Custom headers support
  customHeaders: CustomHeadersType;
  setCustomHeaders: (headers: CustomHeadersType) => void;
  oauthClientId: string;
  setOauthClientId: (id: string) => void;
  oauthClientSecret: string;
  setOauthClientSecret: (secret: string) => void;
  oauthScope: string;
  setOauthScope: (scope: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  logLevel: LoggingLevel;
  sendLogLevelRequest: (level: LoggingLevel) => void;
  loggingSupported: boolean;
  config: InspectorConfig;
  setConfig: (config: InspectorConfig) => void;
  connectionType: "direct" | "proxy";
  setConnectionType: (type: "direct" | "proxy") => void;
  serverImplementation?:
    | (WithIcons & { name?: string; version?: string; websiteUrl?: string })
    | null;
}

const Sidebar = ({
  connectionStatus,
  transportType,
  setTransportType,
  command,
  setCommand,
  args,
  setArgs,
  sseUrl,
  setSseUrl,
  env,
  setEnv,
  customHeaders,
  setCustomHeaders,
  oauthClientId,
  setOauthClientId,
  oauthClientSecret,
  setOauthClientSecret,
  oauthScope,
  setOauthScope,
  onConnect,
  onDisconnect,
  logLevel,
  sendLogLevelRequest,
  loggingSupported,
  config,
  setConfig,
  connectionType,
  setConnectionType,
  serverImplementation,
}: SidebarProps) => {
  const { t } = useTranslation();
  const [theme, setTheme] = useTheme();
  const [showEnvVars, setShowEnvVars] = useState(false);
  const [showAuthConfig, setShowAuthConfig] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [shownEnvVars, setShownEnvVars] = useState<Set<string>>(new Set());
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [copiedServerEntry, setCopiedServerEntry] = useState(false);
  const [copiedServerFile, setCopiedServerFile] = useState(false);
  const { toast } = useToast();

  const connectionTypeTip = t('sidebar.connectionTypeTip');
  // Reusable error reporter for copy actions
  const reportError = useCallback(
    (error: unknown) => {
      toast({
        title: t('sidebar.copyError'),
        description: t('sidebar.copyErrorDesc', { error: error instanceof Error ? error.message : String(error) }),
        variant: "destructive",
      });
    },
    [toast, t],
  );

  // Shared utility function to generate server config
  const generateServerConfig = useCallback(() => {
    if (transportType === "stdio") {
      return {
        command,
        args: args.trim() ? args.split(/\s+/) : [],
        env: { ...env },
      };
    }
    if (transportType === "sse") {
      return {
        type: "sse",
        url: sseUrl,
        note: "For SSE connections, add this URL directly in your MCP Client",
      };
    }
    if (transportType === "streamable-http") {
      return {
        type: "streamable-http",
        url: sseUrl,
        note: "For Streamable HTTP connections, add this URL directly in your MCP Client",
      };
    }
    return {};
  }, [transportType, command, args, env, sseUrl]);

  // Memoized config entry generator
  const generateMCPServerEntry = useCallback(() => {
    return JSON.stringify(generateServerConfig(), null, 4);
  }, [generateServerConfig]);

  // Memoized config file generator
  const generateMCPServerFile = useCallback(() => {
    return JSON.stringify(
      {
        mcpServers: {
          "default-server": generateServerConfig(),
        },
      },
      null,
      4,
    );
  }, [generateServerConfig]);

  // Memoized copy handlers
  const handleCopyServerEntry = useCallback(() => {
    try {
      const configJson = generateMCPServerEntry();
      navigator.clipboard
        .writeText(configJson)
        .then(() => {
          setCopiedServerEntry(true);

          toast({
            title: t('sidebar.configEntryCopied'),
            description:
              transportType === "stdio"
                ? t('sidebar.configEntryCopiedStdio')
                : transportType === "streamable-http"
                  ? t('sidebar.configEntryCopiedStreamableHttp')
                  : t('sidebar.configEntryCopiedSse'),
          });

          setTimeout(() => {
            setCopiedServerEntry(false);
          }, 2000);
        })
        .catch((error) => {
          reportError(error);
        });
    } catch (error) {
      reportError(error);
    }
  }, [generateMCPServerEntry, transportType, toast, reportError]);

  const handleCopyServerFile = useCallback(() => {
    try {
      const configJson = generateMCPServerFile();
      navigator.clipboard
        .writeText(configJson)
        .then(() => {
          setCopiedServerFile(true);

          toast({
            title: t('sidebar.serversFileCopied'),
            description: t('sidebar.serversFileCopiedDesc'),
          });

          setTimeout(() => {
            setCopiedServerFile(false);
          }, 2000);
        })
        .catch((error) => {
          reportError(error);
        });
    } catch (error) {
      reportError(error);
    }
  }, [generateMCPServerFile, toast, reportError]);

  return (
    <div className="bg-card border-r border-border flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-border">
        <div className="flex items-center">
          <h1 className="ml-2 text-lg font-semibold">
            MCP Inspector v{version}
          </h1>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="transport-type-select"
            >
              {t('sidebar.transportType')}
            </label>
            <Select
              value={transportType}
              onValueChange={(value: "stdio" | "sse" | "streamable-http") =>
                setTransportType(value)
              }
            >
              <SelectTrigger id="transport-type-select">
                <SelectValue placeholder={t('sidebar.selectTransportType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stdio">STDIO</SelectItem>
                <SelectItem value="sse">SSE</SelectItem>
                <SelectItem value="streamable-http">Streamable HTTP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {transportType === "stdio" ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="command-input">
                  {t('sidebar.command')}
                </label>
                <Input
                  id="command-input"
                  placeholder={t('sidebar.commandPlaceholder')}
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onBlur={(e) => setCommand(e.target.value.trim())}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="arguments-input"
                >
                  {t('sidebar.arguments')}
                </label>
                <Input
                  id="arguments-input"
                  placeholder={t('sidebar.argumentsPlaceholder')}
                  value={args}
                  onChange={(e) => setArgs(e.target.value)}
                  className="font-mono"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="sse-url-input">
                  {t('sidebar.url')}
                </label>
                {sseUrl ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="sse-url-input"
                        placeholder={t('sidebar.url')}
                        value={sseUrl}
                        onChange={(e) => setSseUrl(e.target.value)}
                        className="font-mono"
                      />
                    </TooltipTrigger>
                    <TooltipContent>{sseUrl}</TooltipContent>
                  </Tooltip>
                ) : (
                  <Input
                    id="sse-url-input"
                    placeholder={t('sidebar.url')}
                    value={sseUrl}
                    onChange={(e) => setSseUrl(e.target.value)}
                    className="font-mono"
                  />
                )}
              </div>

              {/* Connection Type switch - only visible for non-STDIO transport types */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="connection-type-select"
                    >
                      {t('sidebar.connectionType')}
                    </label>
                    <Select
                      value={connectionType}
                      onValueChange={(value: "direct" | "proxy") =>
                        setConnectionType(value)
                      }
                    >
                      <SelectTrigger id="connection-type-select">
                        <SelectValue placeholder={t('sidebar.selectConnectionType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="proxy">{t('sidebar.viaProxy')}</SelectItem>
                        <SelectItem value="direct">{t('sidebar.direct')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{connectionTypeTip}</TooltipContent>
              </Tooltip>
            </>
          )}

          {transportType === "stdio" && (
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setShowEnvVars(!showEnvVars)}
                className="flex items-center w-full"
                data-testid="env-vars-button"
                aria-expanded={showEnvVars}
              >
                {showEnvVars ? (
                  <ChevronDown className="w-4 h-4 mr-2" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-2" />
                )}
                {t('sidebar.environmentVariables')}
              </Button>
              {showEnvVars && (
                <div className="space-y-2">
                  {Object.entries(env).map(([key, value], idx) => (
                    <div key={idx} className="space-y-2 pb-4">
                      <div className="flex gap-2">
                        <Input
                          aria-label={t('sidebar.envVarKey', { index: idx + 1 })}
                          placeholder={t('sidebar.keyPlaceholder')}
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            const newEnv = Object.entries(env).reduce(
                              (acc, [k, v]) => {
                                if (k === key) {
                                  acc[newKey] = value;
                                } else {
                                  acc[k] = v;
                                }
                                return acc;
                              },
                              {} as Record<string, string>,
                            );
                            setEnv(newEnv);
                            setShownEnvVars((prev) => {
                              const next = new Set(prev);
                              if (next.has(key)) {
                                next.delete(key);
                                next.add(newKey);
                              }
                              return next;
                            });
                          }}
                          className="font-mono"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-9 w-9 p-0 shrink-0"
                          onClick={() => {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { [key]: _removed, ...rest } = env;
                            setEnv(rest);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          aria-label={t('sidebar.envVarValue', { index: idx + 1 })}
                          type={shownEnvVars.has(key) ? "text" : "password"}
                          placeholder={t('sidebar.valuePlaceholder')}
                          value={value}
                          onChange={(e) => {
                            const newEnv = { ...env };
                            newEnv[key] = e.target.value;
                            setEnv(newEnv);
                          }}
                          className="font-mono"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 p-0 shrink-0"
                          onClick={() => {
                            setShownEnvVars((prev) => {
                              const next = new Set(prev);
                              if (next.has(key)) {
                                next.delete(key);
                              } else {
                                next.add(key);
                              }
                              return next;
                            });
                          }}
                          aria-label={
                            shownEnvVars.has(key) ? t('sidebar.hideValue') : t('sidebar.showValue')
                          }
                          aria-pressed={shownEnvVars.has(key)}
                          title={
                            shownEnvVars.has(key) ? t('sidebar.hideValue') : t('sidebar.showValue')
                          }
                        >
                          {shownEnvVars.has(key) ? (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => {
                      const key = "";
                      const newEnv = { ...env };
                      newEnv[key] = "";
                      setEnv(newEnv);
                    }}
                  >
                    {t('sidebar.addEnvironmentVariable')}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Always show both copy buttons for all transport types */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyServerEntry}
                  className="w-full"
                >
                  {copiedServerEntry ? (
                    <CheckCheck className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {t('sidebar.serverEntry')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('sidebar.copyServerEntry')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyServerFile}
                  className="w-full"
                >
                  {copiedServerFile ? (
                    <CheckCheck className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {t('sidebar.serversFile')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('sidebar.copyServersFile')}</TooltipContent>
            </Tooltip>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => setShowAuthConfig(!showAuthConfig)}
              className="flex items-center w-full"
              data-testid="auth-button"
              aria-expanded={showAuthConfig}
            >
              {showAuthConfig ? (
                <ChevronDown className="w-4 h-4 mr-2" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-2" />
              )}
              {t('sidebar.authentication')}
            </Button>
            {showAuthConfig && (
              <>
                {/* Custom Headers Section */}
                <div className="p-3 rounded border overflow-hidden">
                  <CustomHeaders
                    headers={customHeaders}
                    onChange={setCustomHeaders}
                  />
                </div>
                {transportType !== "stdio" && (
                  // OAuth Configuration
                  <div className="space-y-2 p-3  rounded border">
                    <h4 className="text-sm font-semibold flex items-center">
                      {t('sidebar.oauthFlow')}
                    </h4>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('sidebar.clientId')}</label>
                      <Input
                        placeholder={t('sidebar.clientIdPlaceholder')}
                        onChange={(e) => setOauthClientId(e.target.value)}
                        value={oauthClientId}
                        data-testid="oauth-client-id-input"
                        className="font-mono"
                      />
                      <label className="text-sm font-medium">
                        {t('sidebar.clientSecret')}
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type={showClientSecret ? "text" : "password"}
                          placeholder={t('sidebar.clientSecretPlaceholder')}
                          onChange={(e) => setOauthClientSecret(e.target.value)}
                          value={oauthClientSecret}
                          data-testid="oauth-client-secret-input"
                          className="font-mono"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 p-0 shrink-0"
                          onClick={() => setShowClientSecret(!showClientSecret)}
                          aria-label={
                            showClientSecret ? t('sidebar.hideSecret') : t('sidebar.showSecret')
                          }
                          aria-pressed={showClientSecret}
                          title={
                            showClientSecret ? t('sidebar.hideSecret') : t('sidebar.showSecret')
                          }
                        >
                          {showClientSecret ? (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          )}
                        </Button>
                      </div>
                      <label className="text-sm font-medium">
                        {t('sidebar.redirectUrl')}
                      </label>
                      <Input
                        readOnly
                        placeholder={t('sidebar.redirectUrlPlaceholder')}
                        value={window.location.origin + "/oauth/callback"}
                        className="font-mono"
                      />
                      <label className="text-sm font-medium">{t('sidebar.scope')}</label>
                      <Input
                        placeholder={t('sidebar.scopePlaceholder')}
                        onChange={(e) => setOauthScope(e.target.value)}
                        value={oauthScope}
                        data-testid="oauth-scope-input"
                        className="font-mono"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Configuration */}
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center w-full"
              data-testid="config-button"
              aria-expanded={showConfig}
            >
              {showConfig ? (
                <ChevronDown className="w-4 h-4 mr-2" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-2" />
              )}
              <Settings className="w-4 h-4 mr-2" />
              {t('sidebar.configuration')}
            </Button>
            {showConfig && (
              <div className="space-y-2">
                {Object.entries(config).map(([key, configItem]) => {
                  const configKey = key as keyof InspectorConfig;
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center gap-1">
                        <label
                          className="text-sm font-medium text-green-600 break-all"
                          htmlFor={`${configKey}-input`}
                        >
                          {configItem.label}
                        </label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            {configItem.description}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      {typeof configItem.value === "number" ? (
                        <Input
                          id={`${configKey}-input`}
                          type="number"
                          data-testid={`${configKey}-input`}
                          value={configItem.value}
                          onChange={(e) => {
                            const newConfig = { ...config };
                            newConfig[configKey] = {
                              ...configItem,
                              value: Number(e.target.value),
                            };
                            setConfig(newConfig);
                          }}
                          className="font-mono"
                        />
                      ) : typeof configItem.value === "boolean" ? (
                        <Select
                          data-testid={`${configKey}-select`}
                          value={configItem.value.toString()}
                          onValueChange={(val) => {
                            const newConfig = { ...config };
                            newConfig[configKey] = {
                              ...configItem,
                              value: val === "true",
                            };
                            setConfig(newConfig);
                          }}
                        >
                          <SelectTrigger id={`${configKey}-input`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">{t('sidebar.trueFalse.true')}</SelectItem>
                            <SelectItem value="false">{t('sidebar.trueFalse.false')}</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={`${configKey}-input`}
                          data-testid={`${configKey}-input`}
                          value={configItem.value}
                          onChange={(e) => {
                            const newConfig = { ...config };
                            newConfig[configKey] = {
                              ...configItem,
                              value: e.target.value,
                            };
                            setConfig(newConfig);
                          }}
                          className="font-mono"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {connectionStatus === "connected" && (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  data-testid="connect-button"
                  onClick={() => {
                    onDisconnect();
                    onConnect();
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {transportType === "stdio" ? t('sidebar.restart') : t('sidebar.reconnect')}
                </Button>
                <Button onClick={onDisconnect}>
                  <RefreshCwOff className="w-4 h-4 mr-2" />
                  {t('sidebar.disconnect')}
                </Button>
              </div>
            )}
            {connectionStatus !== "connected" && (
              <Button className="w-full" onClick={onConnect}>
                <Play className="w-4 h-4 mr-2" />
                {t('sidebar.connect')}
              </Button>
            )}

            <div className="flex items-center justify-center space-x-2 mb-4">
              <div
                className={`w-2 h-2 rounded-full ${(() => {
                  switch (connectionStatus) {
                    case "connected":
                      return "bg-green-500";
                    case "error":
                      return "bg-red-500";
                    case "error-connecting-to-proxy":
                      return "bg-red-500";
                    default:
                      return "bg-gray-500";
                  }
                })()}`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {(() => {
                  switch (connectionStatus) {
                    case "connected":
                      return t('sidebar.connected');
                    case "error": {
                      const hasProxyToken = config.MCP_PROXY_AUTH_TOKEN?.value;
                      if (!hasProxyToken) {
                        return t('sidebar.connectionErrorNoToken');
                      }
                      return t('sidebar.connectionError');
                    }
                    case "error-connecting-to-proxy":
                      return t('sidebar.errorConnectingToProxy');
                    default:
                      return t('sidebar.disconnected');
                  }
                })()}
              </span>
            </div>

            {connectionStatus === "connected" && serverImplementation && (
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-1">
                  {(serverImplementation as WithIcons).icons &&
                  (serverImplementation as WithIcons).icons!.length > 0 ? (
                    <IconDisplay
                      icons={(serverImplementation as WithIcons).icons}
                      size="sm"
                    />
                  ) : (
                    <Server className="w-4 h-4 text-gray-500" />
                  )}
                  {(serverImplementation as { websiteUrl?: string })
                    .websiteUrl ? (
                    <a
                      href={
                        (serverImplementation as { websiteUrl?: string })
                          .websiteUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                    >
                      {serverImplementation.name || "MCP Server"}
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {serverImplementation.name || "MCP Server"}
                    </span>
                  )}
                </div>
                {serverImplementation.version && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('sidebar.version')}: {serverImplementation.version}
                  </div>
                )}
              </div>
            )}

            {loggingSupported && connectionStatus === "connected" && (
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="logging-level-select"
                >
                  {t('sidebar.loggingLevel')}
                </label>
                <Select
                  value={logLevel}
                  onValueChange={(value: LoggingLevel) =>
                    sendLogLevelRequest(value)
                  }
                >
                  <SelectTrigger id="logging-level-select">
                    <SelectValue placeholder={t('sidebar.selectLoggingLevel')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(LoggingLevelSchema.enum).map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <Select
            value={theme}
            onValueChange={(value: string) =>
              setTheme(value as "system" | "light" | "dark")
            }
          >
            <SelectTrigger className="w-[100px]" id="theme-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">{t('sidebar.theme.system')}</SelectItem>
              <SelectItem value="light">{t('sidebar.theme.light')}</SelectItem>
              <SelectItem value="dark">{t('sidebar.theme.dark')}</SelectItem>
            </SelectContent>
          </Select>

          <LanguageSelector />

          <div className="flex items-center space-x-2">
            <Button variant="ghost" title={t('sidebar.inspectorDocumentation')} asChild>
              <a
                href="https://modelcontextprotocol.io/docs/tools/inspector"
                target="_blank"
                rel="noopener noreferrer"
              >
                <CircleHelp className="w-4 h-4 text-foreground" />
              </a>
            </Button>
            <Button variant="ghost" title={t('sidebar.debuggingGuide')} asChild>
              <a
                href="https://modelcontextprotocol.io/docs/tools/debugging"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Bug className="w-4 h-4 text-foreground" />
              </a>
            </Button>
            <Button
              variant="ghost"
              title={t('sidebar.reportBugs')}
              asChild
            >
              <a
                href="https://github.com/modelcontextprotocol/inspector"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4 text-foreground" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
