#!/usr/bin/env node
/**
 * Configuration Setup Script
 * 
 * Copies example configuration files to the customisation directory
 * if they don't already exist.
 */

const fs = require('fs')
const path = require('path')

const CONFIG_DIR = path.join(__dirname, '../config')
const CUSTOM_DIR = path.join(__dirname, '../customisation')

const configFiles = [
  'authentication.config.js',
  'jobs.config.js',
  'resend-users.config.js',
  'authenticationImplementation.js'
]

console.log('SOA Dashboard - Configuration Setup')
console.log('====================================\n')

// Ensure customisation directory exists
if (!fs.existsSync(CUSTOM_DIR)) {
  fs.mkdirSync(CUSTOM_DIR, { recursive: true })
  console.log('✓ Created customisation directory')
}

let copied = 0
let skipped = 0

configFiles.forEach(filename => {
  const exampleFile = path.join(CONFIG_DIR, `${filename.replace('.js', '')}.example.js`)
  const targetFile = path.join(CUSTOM_DIR, filename)
  
  if (fs.existsSync(targetFile)) {
    console.log(`⊘ Skipped ${filename} (already exists)`)
    skipped++
  } else if (fs.existsSync(exampleFile)) {
    fs.copyFileSync(exampleFile, targetFile)
    console.log(`✓ Copied ${filename}`)
    copied++
  } else {
    console.log(`✗ Warning: Example file not found for ${filename}`)
  }
})

console.log('\n' + '='.repeat(40))
console.log(`Setup complete: ${copied} files copied, ${skipped} skipped`)

if (copied > 0) {
  console.log('\n⚠ IMPORTANT: Edit the files in ./customisation/ with your actual configuration values!')
}

console.log('\nNext steps:')
console.log('1. Edit configuration files in ./customisation/')
console.log('2. Set up frontend configuration: cp frontend/.env.example frontend/.env')
console.log('3. Install dependencies: npm install && cd frontend && npm install')
console.log('4. Start development: npm start')
