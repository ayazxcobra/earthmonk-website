# The House of Earthmonk — Website

A multi-page restaurant website with a 3D hero section, a live menu, online
table booking, a contact form, and a password-protected admin dashboard.

- **Frontend:** plain HTML/CSS/JavaScript + Three.js (no build step, so it
  can't "break during a build" — just upload the files and it runs)
- **Backend:** Node.js + Express + SQLite (a single database file, no
  separate database server to install)

---

## 1. Install (one-time)

You need [Node.js](https://nodejs.org) version 18 or newer installed.

```bash
cd earthmonk
npm install
```

## 2. Configure secrets

Copy the example environment file and fill it in — **never** commit or share
the real `.env` file.

```bash
cp .env.example .env
```

Generate a random session secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Paste the output into `.env` as `JWT_SECRET`.

Generate the admin password hash (pick a strong password, at least 8
characters, longer is better):

```bash
node scripts/hash-password.js "YourStrongPassword123!"
```
Paste the printed line into `.env` as `ADMIN_PASSWORD_HASH`. Set
`ADMIN_USERNAME` to whatever login name you want.

**The plain-text password is never stored anywhere** — only the hash is. If
you forget it, just run the hash script again with a new password.

## 3. Load the menu into the database

```bash
npm run seed
```
This creates `db/earthmonk.sqlite` and fills it with the restaurant's menu.
Safe to re-run any time — it only replaces menu data, never bookings or
messages.

## 4. Run it

```bash
npm start
```
Visit **http://localhost:3000**. The admin dashboard is at
**http://localhost:3000/admin.html**.

---

## Editing the menu later

Prices, descriptions and items live in the database, not hardcoded in the
page. Easiest way to change them right now is to edit `db/seed.js` and run
`npm run seed` again, or call the API directly once signed in as admin:

- `GET /api/menu` — public, returns the full menu
- `POST /api/menu/items` — admin only, add an item
- `PUT /api/menu/items/:id` — admin only, edit an item
- `DELETE /api/menu/items/:id` — admin only, remove an item

The admin dashboard has a placeholder for a menu-editing UI — the backend
already supports it fully; wiring up the buttons is a small follow-up if
you want staff to edit the menu without touching code.

## Viewing bookings & messages

Sign in at `/admin.html` to see table booking requests and contact
messages, and to mark bookings as confirmed/cancelled.

---

## Security, plainly explained

- **Admin password:** never stored in plain text — only a `bcrypt` hash is
  kept, and only in your private `.env` file.
- **Login sessions:** use a signed token (JWT) stored in an `httpOnly`
  cookie, so it can't be read or stolen by malicious page scripts (XSS).
  `sameSite: strict` stops the cookie being sent from other websites (CSRF).
- **Brute-force protection:** login and booking endpoints are rate-limited
  (max attempts per IP in a time window).
- **Input validation:** every form field is validated and sanitized on the
  server (not just the browser) before touching the database.
- **SQL injection:** all database queries use parameterized statements —
  user input is never concatenated into SQL.
- **Security headers:** `helmet` sets a Content-Security-Policy and other
  standard protective headers.
- **Error handling:** unexpected errors return a generic message; internal
  details are logged on the server only, never shown to visitors.

### Before going live, also do this
1. Set `NODE_ENV=production` — this makes the login cookie HTTPS-only.
2. Serve the site over **HTTPS** (most hosts, e.g. Render, Railway, a VPS
   with Caddy/Nginx + Let's Encrypt, do this for free).
3. Set `ALLOWED_ORIGIN` in `.env` to your real domain (e.g.
   `https://houseofearthmonk.com`).
4. Keep `.env` and `db/earthmonk.sqlite` out of any public git repository
   (already handled by `.gitignore`).
5. Back up `db/earthmonk.sqlite` periodically — it's the only copy of your
   bookings and messages.

---

## Deploying

Any host that runs Node.js works: Render, Railway, a DigitalOcean/VPS
droplet, etc.

General steps:
1. Push the project (without `.env` or `node_modules`) to your host.
2. Set the environment variables from `.env` in the host's dashboard.
3. Run `npm install && npm run seed && npm start` (most hosts run
   `npm install` and `npm start` automatically; run the seed step once
   manually via the host's console).
4. Point your domain at the host and enable HTTPS.

## Project structure

```
earthmonk/
├── server.js              # app entry point + security middleware
├── routes/                 # booking, contact, menu, admin login APIs
├── middleware/auth.js       # checks admin session on protected routes
├── db/                      # SQLite database, schema, seed data
├── scripts/hash-password.js # generates a safe admin password hash
├── public/                  # the actual website (HTML/CSS/JS)
│   ├── index.html            # home, with the 3D hero
│   ├── menu.html              # live menu (loads from the API)
│   ├── about.html
│   ├── contact.html            # booking form + contact form + map
│   ├── admin.html               # staff login + dashboard
│   └── css/js/                   # styles and scripts
└── .env.example              # copy to .env and fill in real secrets
```
