# 🤖 Botty - A DiscordX bot template!

A fully customizable, multilingual Discord verification bot. Perfect for servers looking for secure and controlled onboarding of new members, with admin approval flow and multilingual command support.

---

## ✨ Features

* ✅ **Approval-based verification**: new members can only join after admin approval.
* 🌍 **Multilingual support**: smart localization system (per guild or user).
* 🧠 **MongoDB storage**: easy integration with any project needing persistence.
* 💡 Ready to use out of the box or adapt as a template!

---

## 🚀 How does verification work?

1. When a new member joins, the bot checks if the **anti-bot system** is enabled.
2. If allowed, the bot sends an **embed with two buttons** (✅ Approve / ❌ Reject) to the admin channel.
3. Once an admin approves, the user receives the verified role.
4. All logic is configurable via commands.

---

## 🌐 Main Commands

* `/config` — set admin channel, verified role, and other options.
* `/language` — set user or guild language.
* `/ping` — test latency command.

---

## 🌎 Supported Languages

| Code | Language            |
| ---- | ------------------- |
| `pt` | Portuguese (Brazil) |
| `en` | English             |
| `es` | Spanish             |

You can add new languages in `locales/{lang}.json`.

---

## 🧩 Customization

Want to integrate with a form system, anti-raid protection, webhooks, or a dashboard?
The bot's modular architecture allows easy extensions through:

* Subcommands in `/config`
* Dynamic components (`ActionRowBuilder`, `ButtonBuilder`)
* Hooks per guild and per user

---

## 📦 Project Structure

```
src/
├── commands/           # slash commands
├── db/                 # MongoDB connection
├── events/             # events like GuildMemberAdd
├── locales/            # translation files
├── models/             # MongoDB models
├── util/               # utility functions
├── config.ts           # Helpers (To be removed)
└── index.ts            # main entry point
```

## 🛠️ Requirements

* Node.js 20+
* MongoDB (local or remote)

---

## 📜 License

This project is under the MIT License.
Use it, modify it, clone it — just don’t forget to give credit! 😄
