const DEFAULT_LOAD_PATH = 'locales/{{lng}}/{{ns}}.json';

const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === '') return [];
  return [value];
};

const unique = (items) => [...new Set(items)];

const interpolate = (template, language, namespace) => {
  return template
    .replace(/\{\{\s*lng\s*\}\}/g, encodeURIComponent(language))
    .replace(/\{\{\s*ns\s*\}\}/g, encodeURIComponent(namespace));
};

const normalizeError = (error) => {
  if (error instanceof Error) return error;
  return new Error(typeof error === 'string' ? error : 'failed loading translations');
};

const defaultRequest = async (url) => {
  if (typeof fetch !== 'function') {
    throw new Error('AutoLoadBackend requires a request option when fetch is unavailable');
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`failed loading ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

const defaultParse = (data) => {
  if (typeof data === 'string') return JSON.parse(data);
  return data;
};

const normalizeLoadPayload = (payload, i18next) => {
  const currentLanguage = i18next.resolvedLanguage || i18next.language;

  if (typeof payload === 'string' || Array.isArray(payload)) {
    return {
      languages: toArray(currentLanguage),
      namespaces: unique(toArray(payload)),
      reload: false,
      callback: undefined,
    };
  }

  if (!payload || typeof payload !== 'object') {
    return {
      languages: toArray(currentLanguage),
      namespaces: [],
      reload: false,
      callback: undefined,
    };
  }

  const languages = unique([
    ...toArray(payload.lng),
    ...toArray(payload.language),
    ...toArray(payload.lngs),
    ...toArray(payload.languages),
  ]);
  const namespaces = unique([
    ...toArray(payload.ns),
    ...toArray(payload.namespace),
    ...toArray(payload.namespaces),
  ]);

  return {
    languages: languages.length ? languages : toArray(currentLanguage),
    namespaces,
    reload: Boolean(payload.reload),
    callback: typeof payload.callback === 'function' ? payload.callback : undefined,
  };
};

class AutoLoadBackend {
  static type = 'backend';

  constructor(services, options = {}, i18nextOptions = {}) {
    this.init(services, options, i18nextOptions);
  }

  init(services, options = {}, i18nextOptions = {}) {
    this.services = services;
    this.i18nextOptions = i18nextOptions;
    this.options = {
      loadPath: DEFAULT_LOAD_PATH,
      request: defaultRequest,
      parse: defaultParse,
      ...options,
    };
  }

  read(language, namespace, callback) {
    const url = interpolate(this.options.loadPath, language, namespace);

    Promise.resolve(this.options.request(url, { language, namespace, url }))
      .then((data) => this.options.parse(data, { language, namespace, url }))
      .then((resource) => {
        if (resource && typeof resource === 'object' && !Array.isArray(resource)) {
          callback(null, resource);
          return;
        }

        callback(new Error(`AutoLoadBackend expected ${url} to resolve to a JSON object`), false);
      })
      .catch((error) => {
        callback(normalizeError(error), false);
      });
  }
}

export const createAutoLoadEventsPlugin = (options = {}) => {
  return {
    type: '3rdParty',
    init(i18next) {
      const eventName = options.eventName || 'load';

      i18next.on(eventName, (payload) => {
        const connector = i18next.services && i18next.services.backendConnector;
        const request = normalizeLoadPayload(payload, i18next);

        if (!connector || !request.languages.length || !request.namespaces.length) {
          if (request.callback) request.callback();
          return;
        }

        const done = (error) => {
          if (request.callback) request.callback(error || undefined);
        };

        if (request.reload) {
          connector.reload(request.languages, request.namespaces, done);
          return;
        }

        connector.load(request.languages, request.namespaces, done);
      });
    },
  };
};

export const AutoLoadEventsPlugin = createAutoLoadEventsPlugin();

export default AutoLoadBackend;
