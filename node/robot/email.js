const nodemailer = require('nodemailer')
import config from './config'

const transporter = nodemailer.createTransport(config.email.sender)

// setup e-mail data with unicode symbols
const mailOptions = {
  from: config.email.sender.auth.user,
  to: config.email.receivers, // list of receivers
  subject: '[杜大江的邮件提醒]: 请关注gitlab工作质量!', // Subject line
  text: '请关注gitlab上的工作质量', // plaintext body
  html: ''// html body
}

const sendMail = async (subject, text) => {
  const newData = Object.assign({}, mailOptions, {subject, text})
  console.log(newData.subject)
  return await new Promise((resolve, reject) => {
    transporter.sendMail(
      newData,
      (error, info) => {
        if (error) {
          reject(error)
        }
        resolve(info)
      }
    )
  })
}

export default {
  sendMail
}