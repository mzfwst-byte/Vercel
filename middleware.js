export const config = {
  matcher: ['/map']
}

export function middleware(request) {
  const auth = request.headers.get('authorization')

  const USER = process.env.BASIC_USER
  const PASS = process.env.BASIC_PASS

  if (auth) {
    const encoded = auth.split(' ')[1]
    const decoded = atob(encoded)
    const [user, pass] = decoded.split(':')

    if (user === USER && pass === PASS) {
      return
    }
  }

  return new Response('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Protected"'
    }
  })
}
