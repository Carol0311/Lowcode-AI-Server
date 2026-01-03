/**
 * AI 路由
*/
const express = require('express')
const router = express.Router()
const aiService = require('../services/aiService')

//根据自然语言描述生成schema
router.post('/general-schema',async (req,res)=>{
    console.log(`自然语言生成schema开始......`)
    try{
        const {desc} = req.body
        if(!desc){
            res.status(400).json({success:false,message:'请输入描述'})
        }
        const schema = await aiService.getSchemaFromDesc(desc)
        res.status(200).json({success:true,data:schema})
    }catch(e){
        res.status(500).json({success:false,message:e.message})
    }
    console.log(`自然语言生成schema结束......`)
})

module.exports = router