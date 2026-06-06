import type { BackendModule, CallbackError, i18n, ResourceKey } from 'i18next';

export interface AutoLoadRequestContext {
  language: string;
  namespace: string;
  url: string;
}

export interface AutoLoadBackendOptions {
  loadPath?: string;
  request?: (url: string, context: AutoLoadRequestContext) => Promise<unknown> | unknown;
  parse?: (data: unknown, context: AutoLoadRequestContext) => ResourceKey;
}

export interface AutoLoadEventPayloadObject {
  lng?: string;
  language?: string;
  lngs?: readonly string[];
  languages?: readonly string[];
  ns?: string | readonly string[];
  namespace?: string;
  namespaces?: readonly string[];
  reload?: boolean;
  callback?: (error?: CallbackError) => void;
}

export type AutoLoadEventPayload =
  | string
  | readonly string[]
  | AutoLoadEventPayloadObject;

export interface AutoLoadEventsPluginOptions {
  eventName?: string;
}

export interface AutoLoadEventsPlugin {
  type: '3rdParty';
  init(i18next: i18n): void;
}

export default class AutoLoadBackend implements BackendModule<AutoLoadBackendOptions> {
  static type: 'backend';
  type: 'backend';
  constructor(services?: unknown, options?: AutoLoadBackendOptions, i18nextOptions?: unknown);
  init(services?: unknown, options?: AutoLoadBackendOptions, i18nextOptions?: unknown): void;
  read(language: string, namespace: string, callback: (error: CallbackError, data: ResourceKey | false) => void): void;
}

export declare function createAutoLoadEventsPlugin(
  options?: AutoLoadEventsPluginOptions,
): AutoLoadEventsPlugin;

export declare const AutoLoadEventsPlugin: AutoLoadEventsPlugin;
