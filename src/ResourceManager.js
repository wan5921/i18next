import { getPath, setPath, deepExtend } from './utils.js';

class ResourceManager {
  constructor(store) {
    this.store = store;
  }

  addResourceBundle(
    lng,
    ns,
    resources,
    deep,
    overwrite,
    options = { silent: false, skipCopy: false },
  ) {
    let path = [lng, ns];
    if (lng.includes('.')) {
      path = lng.split('.');
      deep = resources;
      resources = ns;
      ns = path[1];
    }

    this.store.addNamespaces(ns);

    let pack = getPath(this.store.data, path) || {};

    if (!options.skipCopy) resources = JSON.parse(JSON.stringify(resources));

    if (deep) {
      deepExtend(pack, resources, overwrite);
    } else {
      pack = { ...pack, ...resources };
    }

    setPath(this.store.data, path, pack);

    if (!options.silent) this.store.emit('added', lng, ns, resources);
  }

  removeResourceBundle(lng, ns) {
    if (this.store.hasResourceBundle(lng, ns)) {
      delete this.store.data[lng][ns];
    }
    this.store.removeNamespaces(ns);

    this.store.emit('removed', lng, ns);
  }
}

export default ResourceManager;