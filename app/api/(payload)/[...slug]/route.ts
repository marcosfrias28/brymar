import { NextRequest } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '../../../../payload.config'

const handler = async (req: NextRequest): Promise<Response> => {
  const payload = await getPayloadHMR({ config: configPromise })
  return payload.handler(req)
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler