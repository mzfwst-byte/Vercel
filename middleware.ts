import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const auth = req.headers.get('authorization')

  const USER = process.env.BASIC_USER
  const PASS = process.env.BASIC_PASS

  if (auth) {
    const encoded = auth.split(' ')[1]
    const decoded = Buffer.from(encoded, 'base64').toString()
    const [user, pass] = decoded.split(':')

    if (user === USER && pass === PASS) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Protected"',
    },
  })
}