# 040 — Life area emojis

Status: done
Date: 2026-11-24

## Goal

Give each area of life an emoji from a curated list instead of one of 20 lucide icons. This replaces the icon decisions
in `039-life-areas.md`; the area's name, colour and default sound stay as they are.

## Decisions

| Area | Choice |
| --- | --- |
| Emojis | 225 emojis in 25 categories (below), each listed once, up to Emoji 14. Labels and search tags come from `emojibase-data@18.0.0` (MIT) |
| One list | `app/frontend/components/commons/LifeArea/emojis.json` is read by both the picker and `LifeArea::EMOJIS`, so they can't drift. The production image includes `app/frontend` |
| Column | `life_areas.icon` became `life_areas.emoji`, in the API too. `CreateLifeAreas` was edited in place, as `life_areas` isn't on `main` |
| Validation | `emoji` must be in `LifeArea::EMOJIS`. The client only requires one, as it comes from the picker |
| Picker | Frimousse `0.4.0`, pinned exactly (pre-1.0), in `commons/EmojiField` (shared with routines). `resolveEmojiData` hands it the list, so nothing is downloaded from a CDN. Search matches labels, tags and category names |
| Popover in the dialog | `<Popover modal>`, so the list scrolls inside the dialog. Escape closes only the popover |
| Rendering | Native emojis, so they look different per platform, on the area's colour tint. New areas start with ✨ |
| Suggestions | Work 💼, Health 🩺, Relationships ❤️, Household 🏠, Leisure 🎮, Learning 📚, Finances 💰 |
| Out of scope | Skin tones, recently used emojis, emojis for tasks |

## Emojis

| Category | Emojis |
| --- | --- |
| Work and career | 💼 💻 🏢 🚀 📊 🎯 🏆 🤝 🪪 🏭 👷 🏪 |
| Tech and side projects | 🧑‍💻 ⌨️ 💡 🖥️ 🤖 🧩 🔌 💾 |
| Family and parenting | 👶 🏡 🧸 🎒 👪 🧱 🍼 |
| Relationships and love | ❤️ 💞 💌 💍 🌹 🎁 💑 💖 |
| Friends and social | 👥 🎉 💬 📞 🍸 🍻 🎈 🎂 |
| Home | 🏠 🛋️ 🛏️ 🕯️ 🔑 🪑 🚪 |
| Chores and repairs | 🧺 🧹 🔨 🔧 🪣 🧰 🛒 🧽 ♻️ 🗑️ |
| Cooking and food | 🍽️ 🧑‍🍳 🍳 ☕ 🥗 🍎 🥕 🍲 🍕 🍰 🥦 |
| Health and medical | 💓 🩺 💊 🌡️ 💉 🏥 🪥 👓 🦷 🩹 |
| Fitness and sport | 🏋️ 🚴 💪 👟 🏐 🏃 🏊 🏅 🏉 🏒 ⚽ 🎾 🏏 |
| Mind and self-care | 🧠 😊 ✨ 🧘 🛁 🌸 🍃 ☀️ 🧴 💆 |
| Sleep and routine | 🛌 ⏰ 🌙 🌅 🔁 😴 |
| Spirituality and faith | 🔥 ♾️ 🌇 ⛪ 🕌 🛕 🙏 📿 🪔 |
| Learning and study | 📖 🎓 🗣️ 🏫 📚 🔬 ⚛️ 🔭 🧮 📝 |
| Creative hobbies | 🎨 🎵 ✒️ 🖌️ 📷 🪶 🎸 🎹 🎤 🎭 ✂️ 🧵 📐 |
| Leisure and entertainment | 🎮 🎬 📺 🎧 🍿 🎲 🎟️ 🕹️ 🎙️ ♟️ 🎡 |
| Finances | 👛 💰 🪙 💵 🏦 🧾 💳 💹 📈 💸 |
| Travel and adventure | ✈️ 🗺️ 🧭 🧳 🏕️ ⛰️ 🌍 🏝️ 🚙 ⛵ 🚐 🛶 |
| Nature and garden | 🌱 🪴 🌳 🌻 🐦 🌞 🌲 🌿 |
| Pets | 🐾 🐶 🐱 🐟 🦴 🐰 🐢 🦜 |
| Community and giving | 🫶 📣 🌏 🗳️ 🤲 🎗️ |
| Personal growth and goals | 🥅 🏔️ 🛣️ 🪧 👑 ⭐ 👣 🚩 |
| Admin and legal | 📋 ⚖️ 📄 🛡️ 📧 🧑‍⚖️ 📁 ✍️ |
| Style and shopping | 👕 🛍️ 👜 ⌚ 💇 👗 💄 |
| Car and transport | 🚗 🏍️ ⛽ 🚌 🚆 |
