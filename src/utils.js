export const isString = obj => typeof obj === 'string'

export const defer = () => {
  let res
  let rej
  const promise = new Promise((resolve, reject) => {
    res = resolve
    rej = reject
  })
  promise.resolve = res
  promise.reject = rej
  return promise
}

export const makeString = object => {
  if (object == null) return ''
  return String(object)
}

export const copy = (a, s, t) => {
  a.forEach(m => {
    if (s[m]) t[m] = s[m]
  })
}

const lastOfPathSeparatorRegExp = /###/g
const cleanKey = key => key && key.includes('###') ? key.replace(lastOfPathSeparatorRegExp, '.') : key
const canNotTraverseDeeper = object => !object || isString(object)

const getLastOfPath = (object, path, Empty) => {
  const stack = !isString(path) ? path : path.split('.')
  let stackIndex = 0
  while (stackIndex < stack.length - 1) {
    if (canNotTraverseDeeper(object)) return {}
    const key = cleanKey(stack[stackIndex])
    if (!object[key] && Empty) object[key] = new Empty()
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      object = object[key]
    } else {
      object = {}
    }
    ++stackIndex
  }
  if (canNotTraverseDeeper(object)) return {}
  return {
    obj: object,
    k: cleanKey(stack[stackIndex])
  }
}

export const setPath = (object, path, newValue) => {
  const {
    obj,
    k
  } = getLastOfPath(object, path, Object)
  if (obj !== undefined || path.length === 1) {
    obj[k] = newValue
    return
  }
  let e = path[path.length - 1]
  let p = path.slice(0, path.length - 1)
  let last = getLastOfPath(object, p, Object)
  while (last.obj === undefined && p.length) {
    e = `${p[p.length - 1]}.${e}`
    p = p.slice(0, path.length - 1)
    last = getLastOfPath(object, p, Object)
    if (last?.obj && typeof last.obj[`${last.k}.${e}`] !== 'undefined') {
      last.obj = undefined
    }
  }
  last.obj[`${last.k}.${e}`] = newValue
}

export const pushPath = (object, path, newValue, concat) => {
  const {
    obj,
    k
  } = getLastOfPath(object, path, Object)
  obj[k] = obj[k] || []
  obj[k].push(newValue)
}

export const getPath = (object, path) => {
  const {
    obj,
    k
  } = getLastOfPath(object, path)
  if (!obj) return undefined
  if (!Object.prototype.hasOwnProperty.call(obj, k)) return undefined
  return obj[k]
}

export const getPathWithDefaults = (data, defaultData, key) => {
  const value = getPath(data, key)
  if (value !== undefined) {
    return value
  }
  return getPath(defaultData, key)
}

export const deepExtend = (target, source, overwrite) => {
  for (const prop in source) {
    if (prop !== '__proto__' && prop !== 'constructor') {
      if (prop in target) {
        if (isString(target[prop]) || target[prop] instanceof String || isString(source[prop]) || source[prop] instanceof String) {
          if (overwrite) target[prop] = source[prop]
        } else {
          deepExtend(target[prop], source[prop], overwrite)
        }
      } else {
        target[prop] = source[prop]
      }
    }
  }
  return target
}

export const deepFind = (obj, path, keySeparator = '.') => {
  if (!obj) return undefined
  if (obj[path]) {
    if (!Object.prototype.hasOwnProperty.call(obj, path)) return undefined
    return obj[path]
  }
  const tokens = path.split(keySeparator)
  let current = obj
  for (let i = 0; i < tokens.length;) {
    if (!current || typeof current !== 'object') {
      return undefined
    }
    let next
    let nextPath = ''
    for (let j = i; j < tokens.length; ++j) {
      if (j !== i) {
        nextPath += keySeparator
      }
      nextPath += tokens[j]
      next = current[nextPath]
      if (next !== undefined) {
        if (['string', 'number', 'boolean'].includes(typeof next) && j < tokens.length - 1) {
          continue
        }
        i += j - i + 1
        break
      }
    }
    current = next
  }
  return current
}

export const getCleanedCode = code => code?.replace(/_/g, '-')
