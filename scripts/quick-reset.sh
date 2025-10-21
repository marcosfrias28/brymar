#!/bin/bash

# Script rápido para reset completo de base de datos
# Uso: ./scripts/quick-reset.sh

echo "🚀 RESET RÁPIDO DE BASE DE DATOS - BRYMAR"
echo "========================================"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Verificar configuración
echo "📋 Verificando configuración..."
npm run db:check
if [ $? -ne 0 ]; then
    echo "❌ Error en la configuración. Revisa las variables de entorno."
    exit 1
fi

echo ""
echo "⚠️  ADVERTENCIA: Esto eliminará TODOS los datos de la base de datos"
echo "¿Estás seguro? (y/N)"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "❌ Operación cancelada"
    exit 0
fi

echo ""
echo "🗑️  Limpiando base de datos..."
node scripts/reset-database.js --force
if [ $? -ne 0 ]; then
    echo "❌ Error limpiando la base de datos"
    exit 1
fi

echo ""
echo "📊 Aplicando nuevo schema..."
npm run db:push
if [ $? -ne 0 ]; then
    echo "❌ Error aplicando schema"
    exit 1
fi

echo ""
echo "🌱 Cargando datos iniciales..."
npm run db:seed
if [ $? -ne 0 ]; then
    echo "⚠️  Advertencia: Error cargando datos iniciales (esto es opcional)"
fi

echo ""
echo "🎉 ¡RESET COMPLETADO EXITOSAMENTE!"
echo "================================="
echo ""
echo "📋 Próximos pasos:"
echo "   1. Ejecutar: npm run dev"
echo "   2. Probar autenticación (sign up/sign in)"
echo "   3. Verificar que todo funcione correctamente"
echo ""