# Vercel Deployment Guide — Step by Step

## Prerequisites (you already did these)
- [x] Gmail App Password created
- [x] Locally running with `.\mvnw spring-boot:run`

---

## Step 1: Push Your Code to GitHub

If your project is not on GitHub yet:

```bash
git init
git add .
git commit -m "Spring Boot portfolio with contact form"
git remote add origin https://github.com/Celestial-Pramit/meet_pramit_springboot.git
git push -u origin main
```

If it's already on GitHub, just push the latest changes:

```bash
git add .
git commit -m "Spring Boot conversion: email contact form"
git push
```

---

## Step 2: Go to Vercel

1. Open **https://vercel.com** in your browser
2. Click **"Sign Up"** (or "Log In" if you have an account)
3. Sign up with your **GitHub account** (click "Continue with GitHub")
4. Authorize Vercel to access your GitHub repos

---

## Step 3: Import Your Project

1. On the Vercel dashboard, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repos
3. Find **`meet_pramit_springboot`** and click **"Import"**

---

## Step 4: Configure Build Settings

Vercel may auto-detect some settings. Verify/update these:

| Field | Value |
|-------|-------|
| **Framework Preset** | `Other` |
| **Build Command** | `./mvnw clean package -DskipTests` |
| **Output Directory** | `target` |
| **Install Command** | (leave blank or `mvn dependency:resolve`) |

> If Vercel shows a "Root Directory" field, leave it as `./` (current directory).

---

## Step 5: Add Environment Variables (IMPORTANT)

Before clicking Deploy, click **"Environment Variables"** (or scroll down to find it).

Add these two variables:

### Variable 1:
| Field | Value |
|-------|-------|
| **Key** | `MAIL_USERNAME` |
| **Value** | `pramitdutta04@gmail.com` |
| **Environments** | Check only **Production** (uncheck Preview and Development) |

Click **"Add"**

### Variable 2:
| Field | Value |
|-------|-------|
| **Key** | `MAIL_PASSWORD` |
| **Value** | `xxxx-xxxx-xxxx-xxxx` (your 16-character Gmail App Password) |
| **Environments** | Check only **Production** (uncheck Preview and Development) |

Click **"Add"**

> **Security note**: By scoping to Production only, preview deployments won't have access to your email credentials.

---

## Step 6: Deploy

1. Click **"Deploy"** button
2. Wait 2-3 minutes for the build to finish
3. You'll see a green "Congratulations!" screen
4. Click the preview image or the **"Visit"** button to see your live site

---

## Step 7: Test Your Contact Form

1. Open your deployed site URL (looks like `https://your-project.vercel.app`)
2. Scroll down to the **Contact** section
3. Fill in name, email, message
4. Click **"Send Message"**
5. The page will reload and scroll to the contact section
6. Check your Gmail inbox — you should see the message!

---

## After Deploy: Adding a Custom Domain (Optional)

If you want a custom domain like `pramitdutta.com`:

1. In Vercel dashboard → your project → **"Settings"** → **"Domains"**
2. Type your domain name and click **"Add"**
3. Vercel will give you DNS records to add at your domain registrar
4. Go to your domain registrar (Namecheap, GoDaddy, etc.)
5. Add the DNS records Vercel provided
6. Wait 5-30 minutes for DNS propagation
7. Your site will be live at your custom domain with HTTPS automatically

---

## Updating After Deployment

Every time you push to GitHub:

```bash
git add .
git commit -m "your message"
git push
```

Vercel **auto-deploys** on every push. No manual action needed.

---

## Troubleshooting

### Build fails on Vercel
- Check if Java 21 is available (Vercel supports it)
- Check build logs for errors
- Make sure `vercel.json` is in the project root

### Contact form doesn't send email
- Verify `MAIL_USERNAME` and `MAIL_PASSWORD` are set in Vercel environment variables
- Verify they're scoped to **Production** environment
- Check Vercel function logs: your project → "Logs" tab

### Page loads but no CSS/images
- Check browser console for 404 errors
- Make sure all files are in `static/css/`, `static/js/`, `static/images/`
