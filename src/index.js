const express = require('express')
const cors = require('cors')
require('dotenv').config()

const pageRoutes = require('./routes/page')
const aiRoutes = require('./routes/ai')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api',pageRoutes)
app.use('/api/ai',aiRoutes)

app.get('/health',(req,res)=>{
    console.log('health check')
    try{
        res.status(200).json({success:true,timestamp:new Date().toISOString()})
    }catch(e){
        console.log('测试失败',e)
        res.status(500).json({success:false,message:'出错了'})
    }
})

//错误处理中间件
app.use((err,req,res,next)=>{
    console.error(err.stack)
    res.status(500).json({success:false,message:'服务器内部错误'})
})
//捕获未处理的promise拒绝
process.on('unhandledRejection',(reason,promise)=>{
    console.error('未处理的Promise拒绝',reason)
})
//捕获未捕获的异常
process.on('uncaughtException',(error)=>{
    console.error('未捕获的异常',error)
})

app.listen(PORT,()=>{
    console.log(`服务器运行在 http://localhost:${PORT}`)
    console.log(`健康检查在 http://localhost:${PORT}/health`)
})