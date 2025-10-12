#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Lista de variables comúnmente no utilizadas que podemos eliminar de forma segura
const safeToRemovePatterns = [
    // Variables de parámetros no utilizados en funciones
    /,\s*_\w*\s*:/g,
    /\(\s*_\w*\s*:/g,
    // Imports específicos que sabemos que no se usan
    /import\s*{\s*ReactNode\s*}\s*from\s*['"]react['"];\s*\n/g,
    /import\s*{\s*ClassValue\s*}\s*from\s*['"][^'"]*['"];\s*\n/g,
    // Console statements
    /\s*console\.(log|warn|error|info|debug)\([^)]*\);\s*\n/g,
    // Líneas vacías múltiples
    /\n\s*\n\s*\n/g,
];

// Variables específicas que podemos comentar en lugar de eliminar
const commentOutPatterns = [
    // Constantes que podrían usarse en el futuro
    {
        pattern: /^(\s*)(export\s+)?const\s+(DEBUG|INFO|WARNING|ERROR|CRITICAL)\s*=/gm,
        replacement: '$1// $2const $3='
    },
    {
        pattern: /^(\s*)(export\s+)?const\s+(HOUSE|APARTMENT|LAND|COMMERCIAL|VILLA)\s*=/gm,
        replacement: '$1// $2const $3='
    }
];

function cleanFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Aplicar patrones de eliminación segura
        for (const pattern of safeToRemovePatterns) {
            const newContent = content.replace(pattern, pattern === /\n\s*\n\s*\n/g ? '\n\n' : '');
            if (newContent !== content) {
                content = newContent;
                modified = true;
            }
        }

        // Aplicar patrones de comentario
        for (const { pattern, replacement } of commentOutPatterns) {
            const newContent = content.replace(pattern, replacement);
            if (newContent !== content) {
                content = newContent;
                modified = true;
            }
        }

        // Eliminar imports no utilizados específicos
        const unusedImports = [
            'ReactNode',
            'ClassValue',
            'UseQueryOptions',
            'UseMutationOptions',
            'WizardConfig',
            'ErrorFactory',
            'NetworkError',
            'PropertyCharacteristic'
        ];

        for (const importName of unusedImports) {
            const importPattern = new RegExp(`import\\s*{[^}]*\\b${importName}\\b[^}]*}\\s*from\\s*['"][^'"]*['"];?\\s*\\n`, 'g');
            const newContent = content.replace(importPattern, '');
            if (newContent !== content) {
                content = newContent;
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content);
            return true;
        }

        return false;
    } catch (error) {
        console.log(`❌ Error procesando ${filePath}: ${error.message}`);
        return false;
    }
}

function processDirectory(dirPath) {
    let filesModified = 0;

    try {
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // Saltar directorios que no queremos procesar
                if (!['node_modules', '.next', 'dist', 'build', '.git', '__tests__', 'test'].includes(item)) {
                    filesModified += processDirectory(fullPath);
                }
            } else if (stat.isFile()) {
                // Procesar solo archivos de código fuente
                if (fullPath.match(/\.(ts|tsx)$/) &&
                    !fullPath.includes('.test.') &&
                    !fullPath.includes('.spec.') &&
                    !fullPath.includes('__tests__')) {
                    if (cleanFile(fullPath)) {
                        filesModified++;
                    }
                }
            }
        }
    } catch (error) {
        console.log(`❌ Error procesando directorio ${dirPath}: ${error.message}`);
    }

    return filesModified;
}

console.log('🧹 Iniciando limpieza específica de variables no utilizadas...');

const dirsToProcess = ['app', 'components', 'hooks', 'lib', 'types', 'utils'];
let totalModified = 0;

for (const dir of dirsToProcess) {
    if (fs.existsSync(dir)) {
        console.log(`📁 Procesando: ${dir}`);
        const modified = processDirectory(dir);
        totalModified += modified;
        console.log(`   ✅ ${modified} archivos modificados`);
    }
}

console.log(`\n🎉 Limpieza completada! ${totalModified} archivos modificados en total.`);