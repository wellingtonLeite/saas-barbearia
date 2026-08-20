const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');
const search = '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">';
const replace = '<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">';
code = code.replace(search, replace);

// Now remove the Plano Gratuito block
const freePlanRegex = /\{\/\* PLANO GRATUITO \*\/\}[\s\S]*?(?=\{\/\* PLANO INICIAL \*\/\} )/;
// wait, the literal string has {/ * PLANO INICIAL * /} 
const splitIndex = code.indexOf('{/* PLANO INICIAL */}');
const freePlanStart = code.indexOf('{/* PLANO GRATUITO */}');
if(freePlanStart !== -1 && splitIndex !== -1) {
    code = code.substring(0, freePlanStart) + code.substring(splitIndex);
}

fs.writeFileSync('src/app/page.tsx', code);
