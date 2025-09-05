import { User } from 'payload/'
import { auth } from '@/lib/auth/auth'
import { PayloadRequest } from 'payload'

/**
 * Adapter per integrare Better Auth con Payload CMS
 * Questo permette di utilizzare gli utenti Better Auth in Payload
 */
export class PayloadAuthAdapter {
  /**
   * Ottiene l'utente corrente da Better Auth e lo converte per Payload
   */
  static async getCurrentUser(req: PayloadRequest): Promise<User | null> {
    try {
      // Ottieni la sessione da Better Auth
      const session = await auth.api.getSession({
        headers: req.headers as any,
      })

      if (!session?.user) {
        return null
      }

      // Converti l'utente Better Auth nel formato Payload
      const payloadUser: User = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || session.user.email,
        role: session.user.role || 'user',
        image: session.user.image,
        createdAt: session.user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return payloadUser
    } catch (error) {
      console.error('Errore nel recupero utente:', error)
      return null
    }
  }

  /**
   * Verifica se l'utente ha i permessi per accedere a Payload Admin
   */
  static async canAccessAdmin(req: PayloadRequest): Promise<boolean> {
    const user = await this.getCurrentUser(req)
    return user?.role === 'admin' || user?.role === 'agent'
  }

  /**
   * Middleware per autenticazione Payload
   */
  static authMiddleware = async (req: PayloadRequest, res: any, next: any) => {
    try {
      const user = await PayloadAuthAdapter.getCurrentUser(req)
      
      if (user) {
        req.user = user
      }
      
      next()
    } catch (error) {
      console.error('Errore middleware auth:', error)
      next()
    }
  }
}

/**
 * Hook per sincronizzare gli utenti tra Better Auth e Payload
 */
export const syncUserHook = {
  beforeChange: [
    async ({ data, req, operation }: any) => {
      // Se è una creazione e non c'è un utente Payload corrispondente,
      // sincronizza con Better Auth
      if (operation === 'create' && req.user) {
        data.betterAuthId = req.user.id
        data.syncedAt = new Date().toISOString()
      }
      
      return data
    },
  ],
}

/**
 * Utilità per creare un utente Payload da Better Auth
 */
export async function createPayloadUserFromBetterAuth(
  betterAuthUser: any,
  payload: any
): Promise<User | null> {
  try {
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: betterAuthUser.email,
        },
      },
    })

    if (existingUser.docs.length > 0) {
      return existingUser.docs[0]
    }

    // Crea nuovo utente Payload
    const newUser = await payload.create({
      collection: 'users',
      data: {
        email: betterAuthUser.email,
        name: betterAuthUser.name || betterAuthUser.email,
        role: betterAuthUser.role || 'user',
        image: betterAuthUser.image,
        betterAuthId: betterAuthUser.id,
        syncedAt: new Date().toISOString(),
      },
    })

    return newUser
  } catch (error) {
    console.error('Errore nella creazione utente Payload:', error)
    return null
  }
}