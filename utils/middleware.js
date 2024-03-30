const logger = require('./logger')
const jwt = require('jsonwebtoken')

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: "unknown endpoint"})
}

const errorHandler = (err, req, res, next) => {
    logger.error(`[${err.name}] `, err.message)

    if(err.name === 'CastError')
    {
        return res.status(400).send({error: 'malformatted id'})
    }
    if(err.name === 'ValidationError')
    {
        return res.status(400).json({error: err.message})
    }
    else if (err.name === 'MongoServerError' && err.message.includes('E11000 duplicate key error collection'))
    {
        return res.status(400).json({error: 'username must be unique'})
    }
    else if (err.name === 'JsonWebTokenError')
    {
        return res.status(400).json({error: 'token missing or invalid'})
    }
    else if (err.name === 'TokenExpiredError')
    {
        return res.status(401).json({error: 'token expired'})
    }

    next(err)
}

const tokenExtractor = (req, res, next) => {
    const auth = req.get('authorization')
    req.token = (auth && auth.startsWith('Bearer ')) ? auth.replace('Bearer ', '') : null
  
    next()
}

const userExtractor = (req, res, next) => {
    if(req.token)
    {
        const user = jwt.verify(req.token, process.env.SECRET)
        req.user = user.id
    }
    else 
    {
        req.user = null
    }
    next()
}

module.exports = {
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
}