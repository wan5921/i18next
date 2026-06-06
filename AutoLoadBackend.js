import EventEmitter from './EventEmitter.js';

const defaults = {
  basePath: 'locales',
  loadPath: '{{lng}}/{{ns}}.json',
  queryStringParams: {},
  request: undefined,
  parse: JSON.parse,
  crossDomain: false,
  withCredentials: false,
};

class AutoLoadBackend extends EventEmitter {
  constructor(services, options = {}) {
    super();
    this.init(services, options);
  }

  init(services, options = {}, i18nextOptions = {}) {
    this.services = services;
    this.options = { ...defaults, ...options };
    this.i18nextOptions = i18nextOptions;
    this.pendingLoads = new Map();
  }

  _buildUrl(lng, ns) {
    const { basePath, loadPath } = this.options;
    let path = typeof loadPath === 'function' ? loadPath(lng, ns) : loadPath;
    path = path.replace('{{lng}}', lng).replace('{{ns}}', ns);
    return `${basePath}/${path}`;
  }

  _request(url, callback) {
    const { request: customRequest, queryStringParams, crossDomain, withCredentials } =
      this.options;

    if (customRequest) {
      return customRequest(url, callback);
    }

    let fetchUrl = url;
    const params = new URLSearchParams(queryStringParams);
    if (params.toString()) {
      fetchUrl += `?${params.toString()}`;
    }

    const fetchOptions = {};
    if (crossDomain) {
      fetchOptions.mode = 'cors';
    }
    if (withCredentials) {
      fetchOptions.credentials = 'include';
    }

    fetch(fetchUrl, fetchOptions)
      .then((response) => {
        if (!response.ok) {
          return callback(`failed loading ${url}`, false);
        }
        return response.text();
      })
      .then((data) => {
        if (data === undefined) return;
        try {
          const parsed = this.options.parse(data, url);
          callback(null, parsed);
        } catch (e) {
          callback(`failed parsing ${url}`, false);
        }
      })
      .catch(() => {
        callback(`failed loading ${url}`, false);
      });
  }

  read(language, namespace, callback) {
    const url = this._buildUrl(language, namespace);
    this._request(url, callback);
  }

  readMulti(languages, namespaces, callback) {
    const results = {};
    let remaining = languages.length * namespaces.length;
    let hasError = false;

    if (remaining === 0) {
      return callback(null, results);
    }

    languages.forEach((lng) => {
      results[lng] = {};
      namespaces.forEach((ns) => {
        const url = this._buildUrl(lng, ns);
        this._request(url, (err, data) => {
          if (err) {
            hasError = true;
          } else {
            results[lng][ns] = data;
          }
          remaining--;
          if (remaining === 0) {
            if (hasError) {
              callback('failed loading one or more resources', false);
            } else {
              callback(null, results);
            }
          }
        });
      });
    });
  }

  load(languages, namespaces, callback) {
    this.readMulti(languages, namespaces, (err, data) => {
      if (!err && data) {
        this.emit('loaded', data);
      }
      if (err) {
        this.emit('failedLoading', languages.join(','), namespaces.join(','), err);
      }
      if (callback) callback(err, data);
    });
  }

  create(languages, namespace, key, fallbackValue) {
    if (this.options.request === undefined) return;

    const url = this._buildUrl(languages[0], namespace);
    const payload = { [key]: fallbackValue };

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
}

AutoLoadBackend.type = 'backend';

export default AutoLoadBackend;
