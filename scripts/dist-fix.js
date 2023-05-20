const {mkdir, readdir, rename, rm, writeFile, copyFile, readFile, unlink, move} = require('fs-extra')
const path = require('node:path')
const packageJson = require('../package.json')

;(async () => {
  const distPath = path.join(__dirname, '../dist')
  const distCjsPath = path.join(distPath, 'cjs')
  const distEsmPath = path.join(distPath, 'esm')
  const distEsmHelpersPath = path.join(distEsmPath, 'helpers')
  const distHelpersPath = path.join(distPath, 'helpers')

  const [distSubpaths, distEsmSubpaths, distEsmHelpersSubpaths, distHelpersSubpaths] = await Promise.all([
    readdir(distPath),
    readdir(distEsmPath),
    readdir(distEsmHelpersPath),
    readdir(distHelpersPath),
    rm(distCjsPath, {force: true, recursive: true}),
    writeDummyExportsFiles(),
  ])

  await Promise.all([
    mkdir(distCjsPath),
    writePackageJsonFile(distEsmPath, 'module'),
    ...copyDtsFiles(distPath, distSubpaths, distEsmPath),
    ...copyDtsFiles(distHelpersPath, distHelpersSubpaths, distEsmHelpersPath),
    ...addReferenceTypesTripleDash(distEsmPath, distEsmSubpaths),
    ...addReferenceTypesTripleDash(distEsmHelpersPath, distEsmHelpersSubpaths),
  ])

  await Promise.all([
    writePackageJsonFile(distCjsPath, 'commonjs'),
    ...distSubpaths
      .filter((filePath) => filePath.match(/\.[t|j]s(\.map)?$/))
      .map((filePath) => rename(path.join(distPath, filePath), path.join(distCjsPath, filePath))),
    move(distHelpersPath, path.join(distCjsPath, 'helpers')),
  ])
})()

function writePackageJsonFile(destinationPath, type) {
  return writeFile(path.join(destinationPath, 'package.json'), JSON.stringify({type, sideEffects: false}))
}

function copyDtsFiles(sourcePath, sourceSubpaths, destinationPath) {
  return sourceSubpaths
    .filter((sourceSubpath) => sourceSubpath.match(/\.d\.ts$/))
    .map((dtsFilename) => copyFile(path.join(sourcePath, dtsFilename), path.join(destinationPath, dtsFilename)))
}

function addReferenceTypesTripleDash(folderPath, folderContentPaths) {
  return folderContentPaths
    .filter((contentPath) => contentPath.match(/\.js$/))
    .map(async (filename) => {
      const filePath = path.join(folderPath, filename)

      const file = await readFile(filePath)
      const fileContents = file.toString()

      const dtsFilePath = `./${filename.replace('.js', '.d.ts')}`

      const denoFriendlyFileContents = [`/// <reference types="${dtsFilePath}" />`, fileContents].join('\n')

      await writeFile(filePath, denoFriendlyFileContents)
    })
}

async function writeDummyExportsFiles() {
  const rootPath = path.join(__dirname, '..')

  await Promise.all(
    Object.entries(packageJson.exports)
      .filter(([exportPath]) => exportPath !== '.')
      .flatMap(async ([exportPath, exportConfig]) => {
        const [, ...dummyPathParts] = exportPath.split('/')
        const dummyFilename = dummyPathParts.length > 1 ? dummyPathParts.pop() : 'index'

        const [, ...destinationFolders] = exportConfig.require.split('/').slice(0, -1)

        const dummyFolderPathFromRoot = path.join(rootPath, ...dummyPathParts)

        await mkdir(dummyFolderPathFromRoot, {recursive: true})

        const dummyFilePathFromRoot = path.join(dummyFolderPathFromRoot, dummyFilename)
        const actualPath = path.relative(dummyFolderPathFromRoot, path.join(rootPath, ...destinationFolders))

        return [
          writeFile(dummyFilePathFromRoot + '.js', `module.exports = require('${actualPath}')`),
          writeFile(dummyFilePathFromRoot + '.d.ts', `export * from '${actualPath}'`),
        ]
      }),
  )
}
