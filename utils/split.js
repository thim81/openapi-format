const path = require('path');
const traverse = require('neotraverse/legacy');
const {writeFile} = require('./../utils/file');

async function writeSplitOpenAPISpec(oaObj, options) {
  const {outputDir, format} = options;
  const openapiDoc = {...oaObj};
  const ext = `${options.extension}`;

  // Replace paths with $ref links
  if (openapiDoc?.paths) {
    Object.keys(openapiDoc.paths).forEach(pathKey => {
      const sanitizedPath = sanitizeFileName(pathKey);
      openapiDoc.paths[pathKey] = {$ref: `paths/${sanitizedPath}.${ext}`};
    });
  }

  // Replace components with $ref links
  if (openapiDoc?.components) {
    Object.keys(openapiDoc.components).forEach(componentType => {
      Object.keys(openapiDoc.components[componentType]).forEach(componentName => {
        openapiDoc.components[componentType][componentName] = {
          $ref: `components/${componentType}/${componentName}.${ext}`
        };
      });
    });
  }

  // Write the openapi.yaml file
  const outputFile = options.output;
  await writeFile(outputFile, openapiDoc, options);
}

async function writePaths(paths, options) {
  const {outputDir, format} = options;
  const ext = `${options.extension}`;
  const pathsDir = path.join(outputDir || './', 'paths');

  for (const pathKey of Object.keys(paths)) {
    const sanitizedPath = sanitizeFileName(pathKey);
    const filePath = path.join(pathsDir, `${sanitizedPath}.${ext}`);

    // Update any component references to the proper file location in paths
    const updatedPath = convertComponentsToRef(paths[pathKey], ext, 'paths');

    // Write each path to its own file
    await writeFile(filePath, updatedPath, options);
  }
}

async function writeComponents(components, options) {
  const {outputDir} = options;
  const ext = `${options.extension}`;

  const componentsDir = path.join(outputDir || './', 'components');

  for (const componentType of Object.keys(components)) {
    for (const componentName of Object.keys(components[componentType])) {
      const fileDir = path.join(componentsDir, componentType);
      const filePath = path.join(fileDir, `${componentName}.${ext}`);

      // Update any component references within components
      const updatedComponent = convertComponentsToRef(components[componentType][componentName], ext, 'components');

      // Write each component (schema, parameter, etc.) to its own YAML file
      await writeFile(filePath, updatedComponent, options);
    }
  }
}

function convertComponentsToRef(obj, ext, currentFileDir) {
  // Traverse the object to find and update $ref
  traverse(obj).forEach(function (node) {
    if (this.key === '$ref') {
      const refValue = node;
      const match = refValue.match(/^#\/components\/([^\/]+)\/([^\/]+)$/);

      if (match) {
        const componentType = match[1];
        const componentName = match[2];

        // Determine the correct relative path
        const refFilePath = path.join('components', componentType, `${componentName}.${ext}`);
        const relativePath = path.relative(currentFileDir, refFilePath).replace(/\\/g, '/');

        // Update the reference to point to the correct relative path
        this.update(relativePath);
      }
    }
  });

  return obj;
}

function sanitizeFileName(fileName) {
  // Replace slashes and any other problematic characters with underscores
  return fileName
    .replace(/^\//, '')
    .replace(/\//g, '_')
    .replace(/[^a-zA-Z0-9_{}]/g, '');
}

module.exports = {
  writeSplitOpenAPISpec,
  writePaths,
  writeComponents,
  convertComponentsToRef,
  sanitizeFileName
};
