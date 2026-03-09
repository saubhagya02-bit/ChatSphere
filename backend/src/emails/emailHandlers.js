import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
    const { data, error } = await resendClient.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: email,  
      subject: "Welcome to ChatSphere!",
      html: createWelcomeEmailTemplate({ fullName: name, clientURL }),
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      throw new Error("Failed to send welcome email");
    }

    console.log("Welcome email sent successfully!", data);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
};