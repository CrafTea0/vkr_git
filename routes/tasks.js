const passport = require('passport')
const keys = require('../keys')
const request = require('request')
const {Router} = require('express')
const router = Router()


router.get('/test/:id', passport.authenticate('auth_JWT',{session: false}),(req,res) => {
    
    try {                                      

        processResponse = (error, response, body) => {
            // body is the decompressed response body
            //console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'))
            //console.log('the decoded data is: ' + body)                    
            res.send(body)
        }

        request.get('http://localhost/UT/hs/PartnerAPI/v1/test/'+req.params.id, processResponse)
            .auth(keys.LOGIN_1C, keys.PASSWORD_1C, false)                              

    } catch (error) {
        res.status(500)
        console.log(error)
    }    
    
})

router.get('/testfile', (req,res) => {
    
    try {
        request.get('http://localhost/UT/hs/PartnerAPI/v1/testfile')
            .auth(keys.LOGIN_1C, keys.PASSWORD_1C, false).pipe(res)             
    } catch (error) {
        res.status(500)
        console.log(error)
    }    
    
})


router.get('/:task', passport.authenticate('auth_JWT',{session: false}),(req,res) => {
    
    try {                                      

        processResponse = (error, response, body) => {            
            res.send(body)
        }
        
        task = req.params.task.toLowerCase()
        if(task === 'price' || task === 'rests'){
            let url = `http://localhost/UT/hs/PartnerAPI/v1/${req.user.id_partner}/tasks/${task}`
            request.get(url, processResponse).auth(keys.LOGIN_1C, keys.PASSWORD_1C, false)                              
        } else {
            res.status(400).json(`message: not found method ${task}`)
        }          

    } catch (error) {
        res.status(500)
        console.log(error)
    }    
    
})

router.get('/:task/:id_task/check', passport.authenticate('auth_JWT',{session: false}),(req,res) => {
    
    try {                                      

        processResponse = (error, response, body) => {            
            res.send(body)
        }

        task = req.params.task.toLowerCase()
        if(task === 'price' || task === 'rests'){
            let url = `http://localhost/UT/hs/PartnerAPI/v1/${req.user.id_partner}/tasks/${task}/${req.params.id_task}/check`
            request.get(url, processResponse).auth(keys.LOGIN_1C, keys.PASSWORD_1C, false)                              
        } else {
            res.status(400).json(`message: not found method ${task}`)
        }                  

    } catch (error) {
        res.status(500)
        console.log(error)
    }    
    
})

router.get('/:task/:id_task/download', passport.authenticate('auth_JWT',{session: false}),(req,res) => {
    
    try {                                             
        
        task = req.params.task.toLowerCase()
        if(task === 'price' || task === 'rests'){
            let url = `http://localhost/UT/hs/PartnerAPI/v1/${req.user.id_partner}/tasks/${task}/${req.params.id_task}/download`
            request.get(url).auth(keys.LOGIN_1C, keys.PASSWORD_1C, false).pipe(res)             
        } else {
            res.status(400).json(`message: not found method ${task}`)
        }                  

    } catch (error) {
        res.status(500)
        console.log(error)
    }    
    
})

module.exports = router