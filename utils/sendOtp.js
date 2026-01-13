import emailjs from "@emailjs/nodejs";

export const sendOtp = async (email, otp) => {
  try {
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        otp: otp,
        app_name: "PADIPS2",
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );

    console.log("✅ OTP sent to", email);
  } catch (error) {
    console.error("❌ EmailJS sendOtp error:", error);
    throw error;
  }
};
