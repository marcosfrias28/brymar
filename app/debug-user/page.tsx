"use client";

import { useUser } from "@/hooks/use-user";
import { useAdmin } from "@/hooks/use-admin";
import { useEffect, useState } from "react";
import { getUserDebugInfo, getAllUsersDebugInfo } from "@/lib/actions/debug-actions";
import { Button } from "@/components/ui/button";

export default function DebugUserPage() {
  const { user, loading } = useUser();
  const { 
    canAccessDashboard, 
    canManageUsers, 
    isAdmin, 
    isAgent, 
    isUser,
    permissions 
  } = useAdmin();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [allUsersInfo, setAllUsersInfo] = useState<any>(null);
  const [isLoadingDebug, setIsLoadingDebug] = useState(false);

  const loadDebugInfo = async () => {
    setIsLoadingDebug(true);
    try {
      const result = await getUserDebugInfo();
      setDebugInfo(result);
    } catch (error) {
      console.error('Error loading debug info:', error);
    } finally {
      setIsLoadingDebug(false);
    }
  };

  const loadAllUsersInfo = async () => {
    try {
      const result = await getAllUsersDebugInfo();
      setAllUsersInfo(result);
    } catch (error) {
      console.error('Error loading all users info:', error);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      loadDebugInfo();
    }
  }, [loading, user]);

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
          <h2 className="text-lg font-semibold mb-4">🔐 Permisos y Rol (Better Auth Admin)</h2>
          <div className="space-y-2">
            <p><strong>Rol detectado:</strong> {user?.role || 'No detectado'}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="font-medium mb-2">Roles</h3>
                <div className="space-y-1 text-sm">
                  <p>Es Admin: {isAdmin ? '✅' : '❌'}</p>
                  <p>Es Agent: {isAgent ? '✅' : '❌'}</p>
                  <p>Es User: {isUser ? '✅' : '❌'}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Permisos Principales</h3>
                <div className="space-y-1 text-sm">
                  <p>Dashboard: {canAccessDashboard ? '✅' : '❌'}</p>
                  <p>Gestionar Usuarios: {canManageUsers ? '✅' : '❌'}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-medium mb-2">Todos los Permisos</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(permissions, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Información de Debug del Servidor */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">🌐 Datos del Servidor vs Cliente</h2>
            <Button onClick={loadDebugInfo} disabled={isLoadingDebug} size="sm">
              {isLoadingDebug ? 'Cargando...' : 'Actualizar'}
            </Button>
          </div>
          
          {debugInfo ? (
            <div className="space-y-4">
              {debugInfo.success ? (
                <>
                  <div>
                    <h3 className="font-medium mb-2">📊 Datos de Sesión (Servidor)</h3>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(debugInfo.sessionData, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">🗄️ Datos de Base de Datos</h3>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(debugInfo.dbData, null, 2)}
                    </pre>
                  </div>
                  
                  <div className={`p-3 rounded ${debugInfo.comparison.issues.length === 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <h3 className="font-medium mb-2">🔍 Comparación</h3>
                    <div className="text-sm space-y-1">
                      <p>Rol coincide: {debugInfo.comparison.roleMatch ? '✅' : '❌'}</p>
                      <p>Email coincide: {debugInfo.comparison.emailMatch ? '✅' : '❌'}</p>
                      {debugInfo.comparison.issues.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium text-red-800">Problemas encontrados:</p>
                          <ul className="list-disc list-inside text-red-700">
                            {debugInfo.comparison.issues.map((issue: string, index: number) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-red-600">
                  Error: {debugInfo.error}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Haz clic en &quot;Actualizar&quot; para cargar los datos del servidor</div>
          )}
        </div>

        {/* Información de Todos los Usuarios (Solo Admin) */}
        {isAdmin && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">👥 Todos los Usuarios (Solo Admin)</h2>
              <Button onClick={loadAllUsersInfo} size="sm">
                Cargar Usuarios
              </Button>
            </div>
            
            {allUsersInfo && (
              <div className="space-y-4">
                {allUsersInfo.success ? (
                  <>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="font-medium">Total</div>
                        <div className="text-2xl font-bold">{allUsersInfo.totalUsers}</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded">
                        <div className="font-medium">Admins</div>
                        <div className="text-2xl font-bold">{allUsersInfo.roleDistribution.admin}</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded">
                        <div className="font-medium">Agentes</div>
                        <div className="text-2xl font-bold">{allUsersInfo.roleDistribution.agent}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="font-medium">Usuarios</div>
                        <div className="text-2xl font-bold">{allUsersInfo.roleDistribution.user}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Lista de Usuarios</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 py-1 text-left">Nombre</th>
                              <th className="px-2 py-1 text-left">Email</th>
                              <th className="px-2 py-1 text-left">Rol</th>
                              <th className="px-2 py-1 text-left">Verificado</th>
                              <th className="px-2 py-1 text-left">Creado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allUsersInfo.users.map((user: any) => (
                              <tr key={user.id} className="border-t">
                                <td className="px-2 py-1">{user.name || 'Sin nombre'}</td>
                                <td className="px-2 py-1">{user.email}</td>
                                <td className="px-2 py-1">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                    user.role === 'agent' ? 'bg-yellow-100 text-yellow-800' :
                                    user.role === 'user' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {user.role}
                                  </span>
                                </td>
                                <td className="px-2 py-1">{user.emailVerified ? '✅' : '❌'}</td>
                                <td className="px-2 py-1">{new Date(user.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-red-600">
                    Error: {allUsersInfo.error}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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
              <span>Rol detectado (Better Auth):</span>
              <span className="font-mono">{user?.role || 'undefined'}</span>
            </div>
            <div className="flex justify-between">
              <span>Puede acceder al dashboard:</span>
              <span className={canAccessDashboard ? 'text-green-600' : 'text-red-600'}>
                {canAccessDashboard ? '✅ Sí' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Puede gestionar usuarios:</span>
              <span className={canManageUsers ? 'text-green-600' : 'text-red-600'}>
                {canManageUsers ? '✅ Sí' : '❌ No'}
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