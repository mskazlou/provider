import fs from 'node:fs'
import path from 'node:path'
import { stringify } from 'yaml'
import { openApiDoc } from './openapi-generator'
// Generate OpenAPI docs with Zod

// convert OpenAPI document to YML
const ymlDoc = stringify(openApiDoc)
const scriptDir = path.resolve(__dirname)

// write YML file
fs.writeFileSync(`${scriptDir}/openapi.yml`, ymlDoc)
console.log('OpenAPI document generated in YML format.')

// JSON version
const jsonDoc = JSON.stringify(openApiDoc, null, 2)

fs.writeFileSync(`${scriptDir}/openapi.json`, jsonDoc)
console.log('OpenAPI document generated in JSON format.')
