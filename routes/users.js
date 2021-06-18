
//const request = require('request')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const keys = require('../keys')
const User = require('../models/user')
const {Router} = require('express')
const router = Router()

const getNewToken = (id, email,id_partner) => {

    //формируем jwt-токен длительностью год
    const main_token = jwt.sign({
        id,
        email,
        id_partner
    }, keys.JWT, {expiresIn: '1y'})

    //расчитываем дату окончания токена
    let oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
    const main_token_exp_time = oneYearFromNow.toISOString().slice(0, -1)
    
    return {main_token,main_token_exp_time}
}

//получить пользователей всех или с фильтрацией
router.get('/', passport.authenticate('auth_1C',{session: false}), async (req,res) => {
        
    try {
           
        //формируем блок WHERE условий запрос по данным, переданным через тело запроса
        let pWhere ={}        
        const pPossible = ['id','email','id_partner']
        pPossible.forEach(el=>{
            if(req.query[el]){
                pWhere[el] = req.query[el]               
            }
        })

        let option = {}
        if(Object.keys(pWhere).length != 0){
            option['where'] = pWhere
        }
        option['raw'] = true    //добавляем признак, чтобы возвращался объект
        //выборка из БД
        const users = await User.findAll(option)        

        if(users.length == 0) {
            //не найдено пользователей
            res.status(204).json()
        } else {
            res.status(200).json({
                users 
            })
        }        

    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Server error'
        })
    }            
})

//добавление пользователя
router.post('/', passport.authenticate('auth_1C',{session: false}), async (req,res) => {    
    try {

        const email = req.body.email;
        const id_partner = req.body.id_partner;  
        //проверяем были ли переданы данные. необходимые для добавления пользователя
        if(email && id_partner) {
            
            //проверить, может пользователь с таким email уже есть
            const candidate = await User.findOne({where: {email}})
            if(!candidate){
                                
                //добавление пользователя в БД
                const newUser = await User.create({
                    email,id_partner, done: false})                

                //получим новый токен                
                const id = newUser.dataValues.id;
                const {main_token,main_token_exp_time} = getNewToken(newUser.dataValues.id,email,id_partner)                

                const result = await User.update({main_token,main_token_exp_time}, {where: {id}})                                       
                if(result.length > 0 && result[0] > 0) {
                    user = await User.findByPk(id)
                    res.status(201).json({...user.dataValues})
                } else {
                    res.status(204).json({
                        message: 'failed to install the token'
                    })
                }              
                

            } else {
                res.status(400).json({
                    message: 'user with this email already exists'
                })                
            }

        } else {
            //в теле не передан email или id_partner
            res.status(400).json({
                message: 'email or id not found in the request body'
            })
        }
      
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Server error'
        })
    }
})


//изменение пользователя
router.put('/', passport.authenticate('auth_1C',{session: false}), async (req,res) => {    
    try {

        const id = req.body.id;        
        //проверяем передали ли id пользователя
        if(id){
            
            //ищем пользователя в БД с переданным id
            let user = await User.findByPk(id)
            if(user) {
                //формируем данные для изменения
                let option ={}        
                const pPossible = ['email','id_partner']
                pPossible.forEach(el=>{
                    if(req.body[el]){
                        option[el] = req.body[el]               
                    }
                })            
                
                //если в теле передан ключ updateToken, значит нужно обновить токен
                if(req.body.updateToken){
                    //получим новый токен
                    email = option.email ? option.email : user.email
                    id_partner = option.id_partner ? option.id_partner : user.id_partner
                    const {main_token,main_token_exp_time} = getNewToken(id,email, id_partner)
                    option = {...option, main_token, main_token_exp_time}
                }
                
                //если в теле передается email, то делаем проверку на существование 
                //пользователя с email, на который хотят поменять
                isEmailExist = false
                if(option.email){                    
                    const findusers = await User.findAll({where: {'email':option.email}})
                    findusers.forEach(e=>{
                        if(e.id !== id){
                            isEmailExist = true
                        }
                    })                                        
                }
                
                if(!isEmailExist){
                    if(Object.keys(option).length != 0){
                        const result = await User.update(option, {where: {id}})                                       
                        if(result.length > 0 && result[0] > 0) {
                            user = await User.findByPk(id)
                            res.status(200).json({
                                ...user.dataValues
                            })
                        } else {
                            res.status(204).json({
                                message: 'couldn\'t change user data'
                            })
                        }                        
                    } else {
                        res.status(400).json({
                            message: 'no fields for updating were passed in the request body'
                        })
                    }   
                } else {
                    //ругаемся, если пользователь с email, на который хотят поменять, уже есть
                    res.status(400).json({
                        message: 'user with this email already exists'
                    })                
                }                           

            } else {
                //нет пользователя с переданным id
                res.status(400).json({
                    message: 'no user with this id was found'
                })
            }            

        } else {
            //в теле не передан id пользователя
            res.status(400).json({
                message: 'user id was not found in the request body'
            })
        }       
      
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Server error'
        })
    }
})

//удаление пользователя
router.delete('/', passport.authenticate('auth_1C',{session: false}), async (req,res) => {    
    try {

        const id = req.body.id;        
        //проверяем передали ли id пользователя
        if(id){
            
            const count = await User.destroy({where: {id}})                         
            if(count) {
                res.status(200).json()
            } else {
                //нет пользователя с переданным id
                res.status(400).json({
                    message: 'no user with this id was found'
                })
            }            

        } else {
            //в теле не передан id пользователя
            res.status(400).json({
                message: 'user id was not found in the request body'
            })
        }       
      
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Server error'
        })
    }
})

module.exports = router