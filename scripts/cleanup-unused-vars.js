#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Función para eliminar imports no utilizados
function removeUnusedImports(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Patrones comunes de imports no utilizados
        const unusedPatterns = [
            // Variables individuales no utilizadas en imports
            /import\s*{\s*([^}]*)\s*}\s*from\s*['"][^'"]*['"];?\s*\n/g,
            // Imports completos no utilizados
            /import\s+\w+\s+from\s+['"][^'"]*['"];?\s*\n/g,
        ];

        // Solo procesar archivos TypeScript/JavaScript
        if (filePath.match(/\.(ts|tsx|js|jsx)$/)) {
            // Eliminar console.log statements
            content = content.replace(/console\.(log|warn|error|info|debug)\([^)]*\);?\s*\n?/g, '');

            // Eliminar líneas vacías múltiples
            content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

            fs.writeFileSync(filePath, content);
        }
    } catch (error) {
        console.log(`Error processing ${filePath}: ${error.message}`);
    }
}

// Función para procesar directorio recursivamente
function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Saltar directorios que no queremos procesar
            if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(item)) {
                processDirectory(fullPath);
            }
        } else if (stat.isFile()) {
            // Procesar solo archivos de código
            if (fullPath.match(/\.(ts|tsx|js|jsx)$/) && !fullPath.includes('.test.') && !fullPath.includes('__tests__')) {
                removeUnusedImports(fullPath);
            }
        }
    }
}

console.log('🧹 Iniciando limpieza automática de código...');

// Procesar directorios principales
const dirsToProcess = ['app', 'components', 'hooks', 'lib', 'types', 'utils'];

for (const dir of dirsToProcess) {
    if (fs.existsSync(dir)) {
        console.log(`📁 Procesando directorio: ${dir}`);
        processDirectory(dir);
    }
}

console.log('✅ Limpieza completada!');