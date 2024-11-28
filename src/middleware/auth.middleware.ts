import type { NextFunction, Response, Request } from 'express'

// In Express, a middleware is a function that sits between a request and the response.
// It checks or modifies the request as it moves along.
// Think of it as a 'checkpoint' where the request stops briefly, get processed,
//   and then moves on to the next step or to the final response.

// define a type for the token's structure, which contains the issuedAt date
type Token = {
  issuedAt: Date
}

const isValidAuthTimeStamp = (token: Token): boolean => {
  const tokenTime = token.issuedAt.getTime() // get time in milliseconds
  const currentTime = new Date().getTime() // current time in milliseconds
  const diff = (currentTime - tokenTime) / 1000 // difference in seconds

  return diff >= 0 && diff <= 3600 // token valid for 1 hour
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization']
  // const authHeader = req.header('authorization')
  if (!authHeader) {
    return res
      .status(401)
      .json({ error: 'Unauthorized; no Authorization header.', status: 401 })
  }

  const tokenStr = authHeader.replace('Bearer ', '')
  const token: Token = { issuedAt: new Date(tokenStr) }

  if (!isValidAuthTimeStamp(token)) {
    return res
      .status(401)
      .json({ error: 'Unauthorized; not valid timestamp.', status: 401 })
  }
  next() // proceed if valid
}
