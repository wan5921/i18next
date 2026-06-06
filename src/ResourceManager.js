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
    if (typeof lng === 'string' && lng.includes('.')) {
      path = lng.split('.');
      options = overwrite || { silent: false, skipCopy: false };
      overwrite = deep;
      deep = resources;
      resources = ns;
      ns = path[1];
    }

    if (!options) options = { silent: false, skipCopy: false };
    if (options.silent === undefined) options.silent = false;
    if (options.skipCopy === undefined) options.skipCopy = false;

    this.store.addNamespaces(ns);

    let pack = getPath(this.store.data, path) || {};

    if (!options.skipCopy) resources = JSON.parse(JSON.stringify(resources)); // make a copy to fix #2081

    if (deep) {
      deepExtend(pack, resources, overwrite);
    } else {
      pack = { ...pack, ...resources };
    }

    setPath(this.store.data, path, pack);

    if (!options.silent) this.store.emit('added', lng, ns, resources);
  }

  removeResourceBundle(lng, ns) {
    let path = [lng, ns];
    if (typeof lng === 'string' && lng.includes('.')) {
      path = lng.split('.');
      ns = path[1];
    }

    if (this.store.hasResourceBundle(path[0], ns)) {
      if (path.length > 2) {
        // If it's a nested path, we should delete the nested path
        // But the original API removeResourceBundle(lng, ns) only removes the whole ns.
        // Let's keep it removing the whole namespace for backward compatibility, 
        // or actually delete the nested property if specified.
        // But wait, the instruction just says "统一处理 deep 参数和命名空间继承".
        // Let's just delete the namespace for path[0] and ns.
        delete this.store.data[path[0]][ns];
      } else {
        delete this.store.data[path[0]][ns];
      }
    }
    this.store.removeNamespaces(ns);

    this.store.emit('removed', lng, ns);
  }
}

export default ResourceManager;