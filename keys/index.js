let keys = {}
if(process.env.NODE_ENV === 'production') {
    keys = require('./keys.prod')
} else {
    keys = require('./keys.dev')
}

module.exports =  {...keys}