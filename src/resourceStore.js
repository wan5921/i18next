import EventEmitter from './EventEmitter.js'
import {
  isString,
  getPath,
  setPath,
  deepExtend,
  deepFind,
} from './utils.js'

class ResourceManager {
  constructor(resourceStore) {
    this.store = resourceStore
  }

  parseLngNs(lng, ns, resources, deep) {
    let path = [lng, ns]
    let actualNs = ns
    let actualResources = resources
    let actualDeep = deep

    if (lng.includes('.')) {
      path = lng.split('.')
      actualDeep = resources
      actualResources = ns
      actualNs = path[1]
    }

    return { path, ns: actualNs, resources: actualResources, deep: actualDeep }
  }

  addResourceBundle(lng, ns, resources, deep, overwrite, options = {}) {
    const { path, ns: actualNs, resources: actualResources, deep: actualDeep } = 
      this.parseLngNs(lng, ns, resources, deep)

    this.store.addNamespaces(actualNs)
    let pack = getPath(this.store.data, path) || {}
    
    if (!options.skipCopy) {
      actualResources = JSON.parse(JSON.stringify(actualResources))
    }

    if (actualDeep) {
      deepExtend(pack, actualResources, overwrite)
    } else {
      pack = {
        ...pack,
        ...actualResources,
      }
    }

    setPath(this.store.data, path, pack)

    if (!options.silent) {
      this.store.emit('added', lng, actualNs, actualResources)
    }

    return this.store
  }

  removeResourceBundle(lng, ns) {
    let actualLng = lng
    let actualNs = ns

    if (lng.includes('.')) {
      const path = lng.split('.')
      actualLng = path[0]
      actualNs = path[1]
    }

    if (this.store.hasResourceBundle(actualLng, actualNs)) {
      delete this.store.data[actualLng][actualNs]
    }
    this.store.removeNamespaces(actualNs)
    this.store.emit('removed', actualLng, actualNs)

    return this.store
  }
}

class ResourceStore extends EventEmitter {
  constructor(data, options = { ns: ['translation'], defaultNS: 'translation' }) {
    super()
    this.data = data || {}
    this.options = options
    if (this.options.keySeparator === undefined) {
      this.options.keySeparator = '.'
    }
    if (this.options.ignoreJSONStructure === undefined) {
      this.options.ignoreJSONStructure = true
    }

    this.resourceManager = new ResourceManager(this)
  }

  addNamespaces(ns) {
    if (!this.options.ns.includes(ns)) {
      this.options.ns.push(ns)
    }
  }

  removeNamespaces(ns) {
    const index = this.options.ns.indexOf(ns)
    if (index > -1) {
      this.options.ns.splice(index, 1)
    }
  }

  getResource(lng, ns, key, options = {}) {
    const keySeparator = options.keySeparator !== undefined ? options.keySeparator : this.options.keySeparator
    const ignoreJSONStructure = options.ignoreJSONStructure !== undefined ? options.ignoreJSONStructure : this.options.ignoreJSONStructure
    let path

    if (lng.includes('.')) {
      path = lng.split('.')
    } else {
      path = [lng, ns]
      if (key) {
        if (Array.isArray(key)) {
          path.push(...key)
        } else if (isString(key) && keySeparator) {
          path.push(...key.split(keySeparator))
        } else {
          path.push(key)
        }
      }
    }

    const result = getPath(this.data, path)

    if (!result && !ns && !key && lng.includes('.')) {
      lng = path[0]
      ns = path[1]
      key = path.slice(2).join('.')
    }

    if (result || !ignoreJSONStructure || !isString(key)) return result
    return deepFind(this.data?.[lng]?.[ns], key, keySeparator)
  }

  addResource(lng, ns, key, value, options = { silent: false }) {
    const keySeparator = options.keySeparator !== undefined ? options.keySeparator : this.options.keySeparator
    let path = [lng, ns]
    if (key) path = path.concat(keySeparator ? key.split(keySeparator) : key)
    let actualNs = ns
    let actualValue = value

    if (lng.includes('.')) {
      path = lng.split('.')
      actualValue = ns
      actualNs = path[1]
    }

    this.addNamespaces(actualNs)
    setPath(this.data, path, actualValue)
    if (!options.silent) this.emit('added', lng, actualNs, key, actualValue)

    return this
  }

  addResources(lng, ns, resources, options = { silent: false }) {
    for (const m in resources) {
      if (isString(resources[m]) || Array.isArray(resources[m])) {
        this.addResource(lng, ns, m, resources[m], { silent: true })
      }
    }
    if (!options.silent) this.emit('added', lng, ns, resources)

    return this
  }

  addResourceBundle(lng, ns, resources, deep, overwrite, options = { silent: false, skipCopy: false }) {
    return this.resourceManager.addResourceBundle(lng, ns, resources, deep, overwrite, options)
  }

  removeResourceBundle(lng, ns) {
    return this.resourceManager.removeResourceBundle(lng, ns)
  }

  hasResourceBundle(lng, ns) {
    return this.getResource(lng, ns) !== undefined
  }

  getResourceBundle(lng, ns) {
    if (!ns) ns = this.options.defaultNS
    return this.getResource(lng, ns)
  }

  getDataByLanguage(lng) {
    return this.data[lng]
  }

  hasLanguageSomeTranslations(lng) {
    const data = this.getDataByLanguage(lng)
    const n = data && Object.keys(data) || []
    return !!n.find(v => data[v] && Object.keys(data[v]).length > 0)
  }

  toJSON() {
    return this.data
  }
}

export default ResourceStore
