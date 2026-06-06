import { getPath, setPath, deepExtend, isString } from './utils.js';

class ResourceManager {
  constructor(data, options) {
    this.data = data;
    this.options = options;
  }

  _parsePath(lng, ns) {
    let path;
    let namespace = ns;

    if (lng.includes('.')) {
      path = lng.split('.');
      namespace = path[1];
    } else {
      path = [lng, ns];
    }

    return { path, namespace };
  }

  addBundle(lng, ns, resources, deep, overwrite, options = { silent: false, skipCopy: false }) {
    const { path, namespace } = this._parsePath(lng, ns);

    if (lng.includes('.')) {
      deep = resources;
      resources = ns;
    }

    if (this.options.addNamespaces) {
      this.options.addNamespaces(namespace);
    }

    let pack = getPath(this.data, path) || {};

    if (!options.skipCopy) {
      resources = JSON.parse(JSON.stringify(resources));
    }

    if (deep) {
      deepExtend(pack, resources, overwrite);
    } else {
      pack = { ...pack, ...resources };
    }

    setPath(this.data, path, pack);

    if (!options.silent && this.options.emit) {
      this.options.emit('added', lng, namespace, resources);
    }
  }

  removeBundle(lng, ns) {
    const { namespace } = this._parsePath(lng, ns);

    if (this.options.hasResourceBundle && this.options.hasResourceBundle(lng, namespace)) {
      delete this.data[lng][namespace];
    }

    if (this.options.removeNamespaces) {
      this.options.removeNamespaces(namespace);
    }

    if (this.options.emit) {
      this.options.emit('removed', lng, namespace);
    }
  }
}

export default ResourceManager;
