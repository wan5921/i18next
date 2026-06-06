import { BackendModule, ReadCallback, MultiReadCallback, Services, InitOptions } from 'i18next';

export interface AutoLoadBackendOptions {
  /**
   * 动态加载的路径模板，默认为 'locales/{{lng}}/{{ns}}.json'
   */
  loadPath?: string;
}

export default class AutoLoadBackend implements BackendModule<AutoLoadBackendOptions> {
  static type: 'backend';
  type: 'backend';
  services: Services;
  options: AutoLoadBackendOptions;

  constructor(services?: Services, backendOptions?: AutoLoadBackendOptions, i18nextOptions?: InitOptions);

  init(services: Services, backendOptions: AutoLoadBackendOptions, i18nextOptions: InitOptions): void;

  read(language: string, namespace: string, callback: ReadCallback): void;

  readMulti?(languages: readonly string[], namespaces: readonly string[], callback: MultiReadCallback): void;
}
