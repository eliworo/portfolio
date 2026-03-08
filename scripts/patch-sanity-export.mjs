import fs from 'node:fs'
import path from 'node:path'

const target = path.resolve(process.cwd(), 'node_modules/@sanity/export/src/tryParseJson.js')

const patchedSource = `/**
 * Patched for Node 20.19 require(esm) cycle behavior.
 * Mirrors @sanity/util/createSafeJsonParser without requiring ESM from CJS.
 */
function createSafeJsonParser({errorLabel}) {
  return function parseLine(line) {
    try {
      return JSON.parse(line)
    } catch (err) {
      const errorPosition = line.lastIndexOf('{"error":')
      if (errorPosition === -1) {
        err.message = \`\${err.message} (\${line})\`
        throw err
      }

      const errorJson = line.slice(errorPosition)
      const errorLine = JSON.parse(errorJson)
      const error = errorLine && errorLine.error

      if (error && error.description) {
        throw new Error(\`\${errorLabel}: \${error.description}\\n\\n\${errorJson}\\n\`, {cause: err})
      }

      throw err
    }
  }
}

module.exports = createSafeJsonParser({
  errorLabel: 'Error streaming dataset',
})
`

if (!fs.existsSync(target)) {
  process.exit(0)
}

const current = fs.readFileSync(target, 'utf8')
if (current.includes("module.exports = createSafeJsonParser({") && current.includes("function createSafeJsonParser(")) {
  process.exit(0)
}

if (!current.includes("require('@sanity/util/createSafeJsonParser')")) {
  process.exit(0)
}

fs.writeFileSync(target, patchedSource)
