import * as openapiFormat from 'openapi-format';

const document = {
  openapi: '3.0.3',
  info: {title: 'API', version: '1.0.0'},
  paths: {}
};

async function verifyTypes() {
  await openapiFormat.openapiSort(document, {});
  await openapiFormat.openapiFilter(document, {});
  await openapiFormat.openapiGenerate(document, {});
  await openapiFormat.openapiChangeCase(document, {});
  await openapiFormat.openapiOverlay(document, {overlaySet: {actions: []}});
  await openapiFormat.openapiSplit(document, {output: 'test/_split/snap.yaml'});
  await openapiFormat.openapiConvertVersion(document, {convertTo: '3.1'});
  await openapiFormat.openapiRename(document, {rename: 'renamed'});

  await openapiFormat.readFile('readme.md', {});
  await openapiFormat.parseFile('test/yaml-default/input.yaml', {});
  await openapiFormat.parseString('openapi: 3.0.3', {});
  await openapiFormat.stringify(document, {});
  await openapiFormat.writeFile('test/_split/_types-output.yaml', document, {});

  await openapiFormat.detectFormat('openapi: 3.0.3');
  openapiFormat.analyzeOpenApi(document);

  openapiFormat.changeCase('hello_world', 'camelCase');
  openapiFormat.resolveJsonPath(document, '$.paths');
  openapiFormat.resolveJsonPathValue(document, '$.paths');
}

void verifyTypes();
