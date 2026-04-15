const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.log(`[Email Skipped] No mail config. Would send to: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || 'HabitQuest <noreply@habitquest.app>',
      to,
      subject,
      html,
    });
    console.log(`✉️  Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email send error:', error.message);
    return { error: error.message };
  }
};

const sendDeadlineReminder = async (user, habit) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">⏰ Habit Deadline Approaching!</h1>
      <p>Hi <strong>${user.username}</strong>,</p>
      <p>Your habit <strong>"${habit.name}"</strong> has a deadline coming up on <strong>${habit.deadline}</strong>.</p>
      <p>Keep up the momentum — you've got this! 💪</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" 
         style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">
        Open HabitQuest
      </a>
    </div>
  `;
  return sendEmail({ to: user.email, subject: `⏰ Deadline reminder: ${habit.name}`, html });
};

const sendMissedHabitAlert = async (user, habits) => {
  const habitList = habits.map(h => `<li>${h.icon || '⭐'} ${h.name}</li>`).join('');
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ef4444;">😔 You missed some habits today</h1>
      <p>Hi <strong>${user.username}</strong>,</p>
      <p>Don't break your streak! You haven't completed these habits today:</p>
      <ul>${habitList}</ul>
      <p>There's still time to log them before midnight!</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" 
         style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">
        Complete Habits Now
      </a>
    </div>
  `;
  return sendEmail({ to: user.email, subject: `Don't break your streak! Complete your habits`, html });
};

module.exports = { sendEmail, sendDeadlineReminder, sendMissedHabitAlert };