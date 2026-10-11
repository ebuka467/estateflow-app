# EstateFlow - GitHub Setup Guide

Complete step-by-step guide to push your EstateFlow app to GitHub.

---

## Part 1: Create GitHub Account (If You Don't Have One)

### Step 1: Go to GitHub
1. Open your browser
2. Go to: https://github.com
3. Click **"Sign up"** (top right corner)

### Step 2: Create Account
1. Enter your email address
2. Create a password (make it strong!)
3. Choose a username (e.g., `yourname-estates` or `estateflow-ng`)
4. Verify your email (GitHub will send a confirmation link)
5. Complete the captcha/puzzle

### Step 3: Verify Email
1. Check your email inbox
2. Click the verification link from GitHub
3. You're now logged in!

---

## Part 2: Install Git on Your Computer

### For Windows:

**Option A: Download Installer**
1. Go to: https://git-scm.com/download/win
2. Download the installer (64-bit Git for Windows Setup)
3. Run the installer
4. Keep all default settings, click "Next" through everything
5. Click "Install"
6. Click "Finish"

**Option B: Using Chocolatey (if you have it)**
```bash
choco install git
```

### For Mac:

**Option A: Download Installer**
1. Go to: https://git-scm.com/download/mac
2. Download and run the installer
3. Follow the prompts

**Option B: Using Homebrew**
```bash
brew install git
```

### For Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install git
```

### Verify Git Installation:
Open your terminal/command prompt and run:
```bash
git --version
```
You should see something like: `git version 2.43.0`

---

## Part 3: Configure Git

Before using Git, you need to tell it who you are.

### Step 1: Open Terminal/Command Prompt

**Windows:**
- Press `Windows + R`
- Type `cmd` and press Enter
- OR search for "Command Prompt" in Start menu

**Mac:**
- Press `Cmd + Space`
- Type "Terminal" and press Enter

**Linux:**
- Press `Ctrl + Alt + T`

### Step 2: Set Your Name
```bash
git config --global user.name "Your Name"
```
Example:
```bash
git config --global user.name "Ebuka Okafor"
```

### Step 3: Set Your Email
```bash
git config --global user.email "your-email@example.com"
```
Example:
```bash
git config --global user.email "ebuka.estateflow@gmail.com"
```

**Important:** Use the same email you used for your GitHub account!

### Step 4: Verify Configuration
```bash
git config --list
```
You should see your name and email in the output.

---

## Part 4: Navigate to Your Project

### Step 1: Open Terminal in Your Project Folder

**Method A: Using File Explorer**
1. Open File Explorer
2. Navigate to your `estateflow-app` folder
3. Click in the address bar at the top
4. Type `cmd` and press Enter
5. A command prompt opens in that folder

**Method B: Using Terminal**
```bash
# Navigate to the folder
cd path/to/estateflow-app

# Example:
cd C:\Users\Ebuka\Desktop\estateflow-app
# OR
cd ~/Desktop/estateflow-app
```

### Step 2: Verify You're in the Right Place
```bash
dir    # Windows
# OR
ls     # Mac/Linux
```
You should see files like:
- `package.json`
- `src/`
- `public/`
- `vite.config.ts`

---

## Part 5: Initialize Git Repository

### Step 1: Initialize Git
```bash
git init
```
You'll see: `Initialized empty Git repository in /path/to/estateflow-app/.git/`

### Step 2: Check Git Status
```bash
git status
```
You'll see a list of untracked files (everything in red).

---

## Part 6: Create .gitignore File

This file tells Git which files/folders to ignore (not track).

### Step 1: Create the File

**Using Terminal:**
```bash
# Windows
echo node_modules > .gitignore
echo dist >> .gitignore
echo .env >> .gitignore
echo .env.local >> .gitignore

# Mac/Linux
cat > .gitignore << 'EOF'
node_modules
dist
.env
.env.local
EOF
```

**OR Manually:**
1. Create a new file named `.gitignore` (with the dot!)
2. Add these lines:
```
node_modules
dist
.env
.env.local
.DS_Store
*.log
```

### Step 2: Verify .gitignore
```bash
type .gitignore    # Windows
# OR
cat .gitignore     # Mac/Linux
```

---

## Part 7: Create README.md

### Step 1: Create README
```bash
# Windows
echo # EstateFlow > README.md
echo Smart Estate Management App for Nigeria >> README.md

# Mac/Linux
cat > README.md << 'EOF'
# EstateFlow

Smart Estate Management App for Nigeria

## Features
- Manager dashboard with analytics
- Tenant portal for bills and maintenance
- Service staff access
- QR code guest management
- Emergency alerts
- Paystack payment integration

## Tech Stack
- React 19
- TypeScript
- Vite
- Tailwind CSS
- PWA (Progressive Web App)

## Getting Started

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

## Deployment
Deploy to Vercel, Netlify, or any static hosting service.

## License
MIT
EOF
```

---

## Part 8: Stage and Commit Your Code

### Step 1: Add All Files to Staging
```bash
git add .
```
The dot (.) means "add everything".

### Step 2: Check What's Being Added
```bash
git status
```
Files should now be green (staged).

### Step 3: Create Your First Commit
```bash
git commit -m "Initial commit: EstateFlow app with all features"
```

The message in quotes describes what this commit contains.

---

## Part 9: Create GitHub Repository

### Step 1: Go to GitHub
1. Open browser
2. Go to: https://github.com
3. Make sure you're logged in

### Step 2: Create New Repository
1. Click the **"+"** icon (top right)
2. Select **"New repository"**
3. OR go directly to: https://github.com/new

### Step 3: Fill in Repository Details

**Repository name:**
```
estateflow-app
```

**Description (optional):**
```
Smart estate management app for Nigeria - Manager, Tenant, and Service Staff portals
```

**Visibility:**
- Select **"Public"** (free, anyone can see)
- OR **"Private"** (only you can see, but still free for personal use)

**Initialize this repository with:**
- ❌ **UNCHECK** "Add a README file" (you already have one)
- ❌ **UNCHECK** "Add .gitignore" (you already have one)
- ❌ **UNCHECK** "Choose a license" (you can add later)

### Step 4: Create Repository
Click the green **"Create repository"** button.

### Step 5: Copy the Repository URL
GitHub will show you a page with setup instructions. Look for:
```
…or push an existing repository from the command line
```

Copy the URL that looks like:
```
https://github.com/your-username/estateflow-app.git
```

**Example:**
```
https://github.com/ebuka-ok/estateflow-app.git
```

---

## Part 10: Connect Local Repository to GitHub

### Step 1: Add GitHub as Remote
```bash
git remote add origin https://github.com/YOUR-USERNAME/estateflow-app.git
```

Replace `YOUR-USERNAME` with your actual GitHub username.

**Example:**
```bash
git remote add origin https://github.com/ebuka-ok/estateflow-app.git
```

### Step 2: Verify Remote
```bash
git remote -v
```
You should see:
```
origin  https://github.com/your-username/estateflow-app.git (fetch)
origin  https://github.com/your-username/estateflow-app.git (push)
```

---

## Part 11: Push Code to GitHub

### Step 1: Push to GitHub
```bash
git push -u origin main
```

**What this does:**
- `git push` - uploads your code
- `-u` - sets up tracking (so future pushes are easier)
- `origin` - your GitHub repository
- `main` - the main branch

### Step 2: Authenticate with GitHub

**If you have GitHub Desktop installed:**
- A popup will appear asking you to sign in
- Click "Sign in with browser"
- Authorize in your browser

**If you don't have GitHub Desktop:**
- GitHub will ask for credentials
- Username: your GitHub username
- Password: **NOT your GitHub password!**
  - You need a **Personal Access Token (PAT)**
  - See Part 12 below to create one

---

## Part 12: Create Personal Access Token (If Needed)

If GitHub asks for a password, you need a token instead.

### Step 1: Go to Token Settings
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"**
3. Select **"Generate new token (classic)"**

### Step 2: Configure Token
- **Note:** `EstateFlow App`
- **Expiration:** `90 days` (or `No expiration` for personal use)
- **Select scopes:**
  - ✅ `repo` (full control of private repositories)
  - ✅ `workflow` (if you want GitHub Actions later)

### Step 3: Generate Token
1. Scroll to bottom
2. Click **"Generate token"**
3. **COPY THE TOKEN IMMEDIATELY!** You won't see it again.

The token looks like: `ghp_1234567890abcdefghijklmnopqrstuv`

### Step 4: Use Token as Password
When Git asks for your password:
- Username: your GitHub username
- Password: paste the token (not your GitHub password!)

---

## Part 13: Verify Upload

### Step 1: Check GitHub
1. Go to your repository: `https://github.com/YOUR-USERNAME/estateflow-app`
2. You should see all your files!

### Step 2: Check Files
Click on folders to verify:
- ✅ `src/` folder with App.tsx
- ✅ `public/` folder
- ✅ `package.json`
- ✅ `README.md`
- ✅ `.gitignore`

---

## Part 14: Future Updates

When you make changes to your code:

### Step 1: Check What Changed
```bash
git status
```

### Step 2: Stage Changes
```bash
git add .
```

### Step 3: Commit Changes
```bash
git commit -m "Describe what you changed"
```

Examples:
```bash
git commit -m "Fix payment button color"
git commit -m "Add new feature: AI chatbot"
git commit -m "Update README with deployment instructions"
```

### Step 4: Push to GitHub
```bash
git push
```
(No need for `-u origin main` anymore, it's already set up!)

---

## Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/estateflow-app.git
```

### Error: "failed to push some refs"
```bash
git pull origin main --rebase
git push
```

### Error: "Permission denied (publickey)"
You're using SSH but haven't set up SSH keys. Use HTTPS instead:
```bash
git remote set-url origin https://github.com/YOUR-USERNAME/estateflow-app.git
```

### Error: "branch main not found"
Your default branch might be called `master`:
```bash
git branch -M main
git push -u origin main
```

### Forgot to add .gitignore and node_modules got pushed?
```bash
# Remove node_modules from Git tracking
git rm -r --cached node_modules
git commit -m "Remove node_modules from tracking"
git push
```

---

## Next Steps After GitHub Setup

Once your code is on GitHub, you can:

### 1. Deploy to Vercel (Easiest)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 2. Deploy to Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

### 3. Deploy to GitHub Pages
1. Go to repository Settings
2. Click "Pages" in left sidebar
3. Select "main" branch
4. Click "Save"
5. Your site will be at: `https://your-username.github.io/estateflow-app`

### 4. Collaborate with Others
- Share the repository URL
- Others can clone it: `git clone https://github.com/YOUR-USERNAME/estateflow-app.git`
- They can make changes and submit "Pull Requests"

---

## Quick Reference Commands

```bash
# Initialize repository
git init

# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log

# Connect to GitHub
git remote add origin https://github.com/USERNAME/REPO.git

# Change remote URL
git remote set-url origin https://github.com/USERNAME/REPO.git

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Merge branch
git merge feature-name
```

---

## Summary Checklist

- [ ] Created GitHub account
- [ ] Installed Git
- [ ] Configured Git (name + email)
- [ ] Navigated to project folder
- [ ] Initialized Git repository (`git init`)
- [ ] Created .gitignore file
- [ ] Created README.md
- [ ] Staged files (`git add .`)
- [ ] Committed files (`git commit -m "..."`)
- [ ] Created GitHub repository
- [ ] Connected to GitHub (`git remote add origin ...`)
- [ ] Pushed code (`git push -u origin main`)
- [ ] Verified files on GitHub

---

## Need Help?

- GitHub Docs: https://docs.github.com
- Git Docs: https://git-scm.com/doc
- Stack Overflow: https://stackoverflow.com/questions/tagged/git

---

**You're now ready to share your EstateFlow app with the world!** 🚀
