function template(
  { template },
  opts,
  { imports, componentName, props, jsx, exports }
) {
  const typeScriptTpl = template.smart({ plugins: ["typescript"] });
  return typeScriptTpl.ast`
    /** @jsx jsx */
    import { jsx } from "theme-ui";
    import * as React from 'react';
    const ${componentName} = (props: React.SVGProps<SVGSVGElement>) => ${jsx};
    export default ${componentName};
  `;
}
module.exports = template;
