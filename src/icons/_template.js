function template(
  { template },
  opts,
  { _imports, componentName, _props, jsx, _exports }
) {
  const typeScriptTpl = template.smart({ plugins: ["typescript"] });
  return typeScriptTpl.ast`
    import * as React from 'react';
    const ${componentName} = (props: React.SVGProps<SVGSVGElement>) => ${jsx};
    export default ${componentName};
  `;
}
module.exports = template;
