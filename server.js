const express = require('express')
const path = require('path')
//const cors = require('cors')

const app = express()
const port = 3000

//app.use(cors)
//app.use(express.join())
app.use(express.static(path.resolve(__dirname,'public')))
//app.use('/h5',express.static('h5'))

//app.use('/',(req,res)=>{
//    res.send('test express')
//})

app.listen(port,()=>{
    console.log('express 本地服务启动了')
})