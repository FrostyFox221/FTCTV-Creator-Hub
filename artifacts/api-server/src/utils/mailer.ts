import nodemailer from "nodemailer";

const transporter = (process.env.SMTP_HOST && process.env.SMTP_PASS)
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== "false",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : nodemailer.createTransport({
      sendmail: true,
      newline: "unix",
      path: "/usr/sbin/sendmail",
    });

const ADMIN_EMAIL = "ftcmedia@mail.ru";

export async function sendRegistrationNotification(user: {
  username: string;
  displayName: string;
  email?: string;
}) {
  const now = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
      <div style="background: #111; color: #fff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 18px; letter-spacing: 2px;">FTCTV — Новая регистрация</h2>
      </div>
      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px; width: 140px;">Логин:</td>
            <td style="padding: 8px 0; font-weight: bold;">${user.username}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px;">Отображаемое имя:</td>
            <td style="padding: 8px 0; font-weight: bold;">${user.displayName}</td>
          </tr>
          ${user.email ? `<tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px;">Email:</td>
            <td style="padding: 8px 0; font-weight: bold;">${user.email}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px;">Дата регистрации:</td>
            <td style="padding: 8px 0;">${now}</td>
          </tr>
        </table>
      </div>
      <div style="background: #f5f5f5; padding: 12px; text-align: center; font-size: 11px; color: #999;">
        Это автоматическое уведомление от FTCTV
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"FTCTV" <${process.env.SMTP_USER || "ftcmedia@mail.ru"}>`,
      to: ADMIN_EMAIL,
      subject: `Новая регистрация: ${user.username}`,
      html,
    });
    console.log(`[mailer] Registration notification sent for ${user.username}`);
  } catch (err) {
    console.error("[mailer] Failed to send registration notification:", err);
    // Non-blocking — registration should not fail if email fails
  }
}
