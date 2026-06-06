class AutoLoadBackend {
  constructor(services, backendOptions = {}, i18nextOptions = {}) {
    this.init(services, backendOptions, i18nextOptions);
  }

  init(services, backendOptions = {}, i18nextOptions = {}) {
    this.services = services;
    this.options = {
      loadPath: 'locales/{{lng}}/{{ns}}.json',
      ...backendOptions
    };
  }

  read(language, namespace, callback) {
    const url = this.options.loadPath
      .replace('{{lng}}', language)
      .replace('{{ns}}', namespace);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          return callback(new Error(`Failed to load ${url}: ${response.statusText}`), false);
        }
        return response.json();
      })
      .then((data) => {
        callback(null, data);
      })
      .catch((error) => {
        callback(error, false);
      });
  }

  // 实现 readMulti 支持批量加载资源
  readMulti(languages, namespaces, callback) {
    const promises = [];
    
    languages.forEach((lng) => {
      namespaces.forEach((ns) => {
        const url = this.options.loadPath
          .replace('{{lng}}', lng)
          .replace('{{ns}}', ns);
        
        promises.push(
          fetch(url)
            .then((res) => (res.ok ? res.json() : {}))
            .then((data) => ({ lng, ns, data }))
            .catch(() => ({ lng, ns, data: {} }))
        );
      });
    });

    Promise.all(promises).then((results) => {
      const res = {};
      results.forEach(({ lng, ns, data }) => {
        if (!res[lng]) res[lng] = {};
        res[lng][ns] = data;
      });
      callback(null, res);
    });
  }
}

AutoLoadBackend.type = 'backend';

export default AutoLoadBackend;
