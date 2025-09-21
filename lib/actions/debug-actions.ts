"use server";

import { auth } from "@/lib/auth/auth";
import db from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

/**
 * Acción del servidor para obtener información detallada del usuario
 * Incluye datos de la sesión y de la base de datos para comparar
 */
export async function getUserDebugInfo() {
  try {
    // Obtener sesión actual
    const headersList = await headers();
    const sessionData = await auth.api.getSession({
      headers: headersList,
    });

    if (!sessionData?.user) {
      return {
        success: false,
        error: "No hay sesión activa",
        sessionData: null,
        dbData: null,
      };
    }

    const sessionUser = sessionData.user;

    // Obtener datos del usuario desde la base de datos
    const dbUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, sessionUser.id))
      .limit(1);

    const dbUserData = dbUser[0] || null;

    // Comparar datos
    const roleMatch = sessionUser.role === dbUserData?.role;
    const emailMatch = sessionUser.email === dbUserData?.email;

    return {
      success: true,
      sessionData: {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        role: sessionUser.role,
        emailVerified: sessionUser.emailVerified,
      },
      dbData: dbUserData,
      comparison: {
        roleMatch,
        emailMatch,
        issues: [
          ...(roleMatch ? [] : [`Rol no coincide: sesión="${sessionUser.role}" vs BD="${dbUserData?.role}"`]),
          ...(emailMatch ? [] : [`Email no coincide: sesión="${sessionUser.email}" vs BD="${dbUserData?.email}"`]),
        ],
      },
    };
  } catch (error) {
    console.error("Error en getUserDebugInfo:", error);
    return {
      success: false,
      error: "Error al obtener información del usuario",
      sessionData: null,
      dbData: null,
    };
  }
}

/**
 * Acción para obtener todos los usuarios (solo para admin)
 */
export async function getAllUsersDebugInfo() {
  try {
    // Verificar que el usuario actual es admin
    const headersList = await headers();
    const sessionData = await auth.api.getSession({
      headers: headersList,
    });

    // Verificar que el usuario actual es admin usando el nuevo sistema
    if (!sessionData?.user) {
      return {
        success: false,
        error: "Usuario no autenticado",
        users: [],
      };
    }

    // Verificar permisos usando la configuración del admin plugin
    const userRole = sessionData.user.role;
    if (userRole !== 'admin') {
      return {
        success: false,
        error: "Solo los administradores pueden ver esta información",
        users: [],
      };
    }

    // Obtener todos los usuarios
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    return {
      success: true,
      users: allUsers,
      totalUsers: allUsers.length,
      roleDistribution: {
        admin: allUsers.filter(u => u.role === 'admin').length,
        agent: allUsers.filter(u => u.role === 'agent').length,
        user: allUsers.filter(u => u.role === 'user').length,
        other: allUsers.filter(u => !['admin', 'agent', 'user'].includes(u.role)).length,
      },
    };
  } catch (error) {
    console.error("Error en getAllUsersDebugInfo:", error);
    return {
      success: false,
      error: "Error al obtener información de usuarios",
      users: [],
    };
  }
}