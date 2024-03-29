const logger = require('./logger')

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: "unknown endpoint"})
}

const errorHandler = (err, req, res, next) => {
    logger.error(`[${err.name}] `, err.message)

    if(err.name === 'ValidationError')
    {
        return res.status(400).json({error: err.message})
    }
    else if (err.name === 'MongoServerError' && err.message.includes('E11000 duplicate key error collection'))
    {
        return res.status(400).json({error: 'username must be unique'})
    }

    next(err)
}

module.exports = {
    unknownEndpoint,
    errorHandler
}