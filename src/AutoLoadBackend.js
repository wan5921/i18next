
class AutoLoadBackend {
  constructor(services, options = {}) {
    this.init(services, options);
  }

  init(services, options = {}, i18nextOptions = {}) {
    this.services = services;
    this.options = {
      loadPath: 'locales/{{lng}}/{{ns}}.json',
      ...options
    };
    this.i18nextOptions = i18nextOptions;
  }

  read(language, namespace, callback) {
    const loadPath = this.interpolate(this.options.loadPath, { lng: language, ns: namespace });
    
    this.fetchResource(loadPath, (err, data) =&gt; {
      if (err) return callback(err, false);
      callback(null, data);
    });
  }

  readMulti(languages, namespaces, callback) {
    const promises = [];
    
    languages.forEach(lng =&gt; {
      namespaces.forEach(ns =&gt; {
        promises.push(
          new Promise((resolve, reject) =&gt; {
            const loadPath = this.interpolate(this.options.loadPath, { lng, ns });
            this.fetchResource(loadPath, (err, data) =&gt; {
              if (err) return reject(err);
              resolve({ lng, ns, data });
            });
          })
        );
      });
    });

    Promise.all(promises)
      .then(results =&gt; {
        const data = {};
        results.forEach(result =&gt; {
          if (!data[result.lng]) data[result.lng] = {};
          data[result.lng][result.ns] = result.data;
        });
        callback(null, data);
      })
      .catch(err =&gt; {
        callback(err, null);
      });
  }

  interpolate(str, values) {
    return str.replace(/{{(\w+)}}/g, (_, key) =&gt; values[key] || '');
  }

  fetchResource(path, callback) {
    if (typeof fetch !== 'undefined') {
      fetch(path)
        .then(response =&gt; {
          if (!response.ok) throw new Error(`Failed to load ${path}`);
          return response.json();
        })
        .then(data =&gt; callback(null, data))
        .catch(err =&gt; callback(err, false));
    } else if (typeof require !== 'undefined' &amp;&amp; typeof module !== 'undefined') {
      try {
        const fs = require('fs');
        const pathModule = require('path');
        const content = fs.readFileSync(pathModule.resolve(path), 'utf8');
        callback(null, JSON.parse(content));
      } catch (err) {
        callback(err, false);
      }
    } else {
      callback(new Error('No suitable fetch method available'), false);
    }
  }
}

AutoLoadBackend.type = 'backend';

export default AutoLoadBackend;

