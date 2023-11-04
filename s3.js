const aws = require('aws-sdk')
require('dotenv').config()

const region ='us-east-1'
const bucketName='corneredu'
const accessKeyId=process.env.ACCESS_KEY_ID
const secretAccessKey=process.env.SECRET_ACCESS_KEY


const s3 = new aws.S3({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion:"4"

})

const  generateUploadURL= async () =>{
    const imageName='random image name'

    const params=({
        Bucket:bucketName,
        key: imageName,
        Expires:80
    })

    const uploadURL = await s3.getSignedUrlPromise('putObject', params)
    return uploadURL
}
module.exports=generateUploadURL