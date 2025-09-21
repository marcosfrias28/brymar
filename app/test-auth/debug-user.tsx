"use client";

import { useUser } from "@/hooks/use-user";
import { useAdmin } from "@/hooks/use-admin";
import { useEffect, useState } from "react";

export default function DebugUserPage() {
  const { user, loading } = useUser();
  const { permissions, role, user: adminUser, loading: adminLoading } = useAdmin();
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    // Obtener datos de sesión directamente
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSessionData(data))
      .catch(err => console.error('Error fetching session:', err));
  }, []);

  if (loading) {
    return <div className="p-8">Cargando información del usuario...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Debug de Usuario y Permisos</h1>
      
      <div className="grid gap-6">
        {/* Información del Usuario desde useUser */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">👤 Datos del Usuario (useUser)</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Información de Permisos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">🔐 Permisos y Rol (useAdmin)</h2>
          <div className="space-y-2">
            <p><strong>Rol detectado:</strong> {role || 'No detectado'}</p>
            <p><strong>Loading:</strong> {adminLoading ? 'Sí' : 'No'}</p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(permissions, null, 2)}
            </pre>
          </div>
        </div>

        {/* Datos del Usuario desde useAdmin */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">👤 Datos del Usuario (useAdmin)</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(adminUser, null, 2)}
          </pre>
        </div>

        {/* Datos de Sesión de la API */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">🌐 Datos de Sesión (API)</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>

        {/* Análisis de Seguridad */}
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-red-800">⚠️ Análisis de Seguridad</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Usuario autenticado:</span>
              <span className={user ? 'text-green-600' : 'text-red-600'}>
                {user ? '✅ Sí' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Rol en datos de usuario:</span>
              <span className="font-mono">{user?.role || 'undefined'}</span>
            </div>
            <div className="flex justify-between">
              <span>Rol detectado por permisos:</span>
              <span className="font-mono">{role || 'undefined'}</span>
            </div>
            <div className="flex justify-between">
              <span>Puede acceder al dashboard:</span>
              <span className={Array.isArray(permissions) && (permissions as string[]).includes('dashboard.access') ? 'text-green-600' : 'text-red-600'}>
                {Array.isArray(permissions) && (permissions as string[]).includes('dashboard.access') ? '✅ Sí' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Puede gestionar usuarios:</span>
              <span className={Array.isArray(permissions) && (permissions as string[]).includes('users.manage') ? 'text-green-600' : 'text-red-600'}>
                {Array.isArray(permissions) && (permissions as string[]).includes('users.manage') ? '✅ Sí' : '❌ No'}
              </span>
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-blue-800">💡 Recomendaciones de Seguridad</h2>
          <ul className="space-y-2 text-sm">
            <li>• Verificar que el rol en la base de datos coincida con los permisos mostrados</li>
            <li>• Implementar validación del rol en el servidor antes de mostrar la interfaz</li>
            <li>• Agregar logs de auditoría para cambios de roles</li>
            <li>• Verificar que las rutas protegidas validen permisos en el servidor</li>
          </ul>
        </div>
      </div>
    </div>
  );
}