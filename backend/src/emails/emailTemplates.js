export const createWelcomeEmailTemplate = (user, clientURL) => {
  return `
  <html>
  <body style="
      margin:0;
      padding:0;
      background: linear-gradient(135deg,#667eea,#764ba2);
      font-family: Arial, sans-serif;
  ">

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        
        <table width="500" cellpadding="0" cellspacing="0" border="0"
          style="
            background:#ffffff;
            border-radius:12px;
            padding:40px;
            text-align:center;
            box-shadow:0 10px 25px rgba(0,0,0,0.15);
          ">

          <tr>
            <td>
              <h1 style="
                  color:#4A90E2;
                  margin-bottom:10px;
                  font-size:28px;
              ">
                Welcome to ChatSphere 🎉
              </h1>

              <p style="
                font-size:18px;
                color:#333;
                margin-bottom:10px;
              ">
                Hello <strong>${user.fullName}</strong>,
              </p>

              <p style="
                font-size:15px;
                color:#666;
                line-height:1.6;
                margin-bottom:25px;
              ">
                Thank you for joining <strong>ChatSphere</strong>.  
                Start chatting with your friends and experience real-time messaging.
              </p>

              <a href="${clientURL}" 
                style="
                  display:inline-block;
                  padding:14px 28px;
                  font-size:16px;
                  font-weight:bold;
                  color:#ffffff;
                  background:#4A90E2;
                  text-decoration:none;
                  border-radius:8px;
                  box-shadow:0 5px 15px rgba(74,144,226,0.4);
                ">
                Open Messenger 🚀
              </a>
              
              <p style="font-size:13px;color:#aaa;">
                © ${new Date().getFullYear()} ChatSphere. All rights reserved.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

  </body>
  </html>
  `;
};