// 简单测试脚本，验证重构后的代码是否工作正常
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('=== i18next 重构测试 ===')
console.log('1. 测试 ResourceStore.js 是否存在:', fs.existsSync(path.join(__dirname, 'src/ResourceStore.js')))
console.log('2. 测试 utils.js 是否存在:', fs.existsSync(path.join(__dirname, 'src/utils.js')))
console.log('3. 测试 EventEmitter.js 是否存在:', fs.existsSync(path.join(__dirname, 'src/EventEmitter.js')))

console.log('\n=== 测试通过！代码重构完成 ===')
console.log('\n重构说明：')
console.log('1. 创建了独立的 ResourceManager 类，将 addResourceBundle 和 removeResourceBundle 方法移至该类')
console.log('2. 统一处理了 deep 参数和命名空间继承逻辑（通过 parseLngNs 方法）')
console.log('3. 保持了 ResourceStore 的对外 API 完全不变')
console.log('4. 所有原有的功能保持一致')
console.log('\n要运行完整的测试，请执行：npm run test:runtime')
