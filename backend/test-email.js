const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '20maksudur00@gmail.com',
    pass: 'hjsqhqmrwctbljmo',
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

transporter.sendMail({
  from: '"PeReview" <20maksudur00@gmail.com>',
  to: 'chinasium20@gmail.com',
  subject: 'PeReview Test - Your Code is 123456',
  html: '<div style="text-align:center;padding:20px;"><h1 style="color:#d63384;">PeReview</h1><h2>Test Verification Code</h2><div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:15px 40px;background:linear-gradient(135deg,#d63384,#e91e8c);color:white;display:inline-block;border-radius:10px;">123456</div><p>If you received this, email delivery is working!</p></div>',
}).then(info => {
  console.log('EMAIL SENT SUCCESSFULLY!');
  console.log('Response:', info.response);
  process.exit(0);
}).catch(err => {
  console.log('EMAIL FAILED!');
  console.log('Error:', err.message);
  process.exit(1);
});
