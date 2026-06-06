import type { InitOptions, ReadCallback, MultiReadCallback, Services, Resource, ResourceKey } from 'i18next';

export interface AutoLoadBackendOptions {
  basePath?: string;
  loadPath?: string | ((lng: string, ns: string) => string);
  queryStringParams?: Record<string, string>;
  request?: (url: string, callback: ReadCallback) => void;
  parse?: (data: string, url: string) => ResourceKey;
  crossDomain?: boolean;
  withCredentials?: boolean;
}

declare class AutoLoadBackend {
  static type: 'backend';

  constructor(services: Services, options?: AutoLoadBackendOptions);

  init(services: Services, options: AutoLoadBackendOptions, i18nextOptions: InitOptions): void;

  read(language: string, namespace: string, callback: ReadCallback): void;

  readMulti(
    languages: readonly string[],
    namespaces: readonly string[],
    callback: MultiReadCallback,
  ): void;

  load(
    languages: readonly string[],
    namespaces: readonly string[],
    callback?: (err: any, data: Resource | null) => void,
  ): void;

  create(
    languages: readonly string[],
    namespace: string,
    key: string,
    fallbackValue: string,
  ): void;
}

export default AutoLoadBackend;
