# Quick Start Guide

## 🚀 Get Running in 2 Minutes

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Start the Server
```bash
npm start
```
✅ Server running at http://localhost:3000

### 3️⃣ Run Tests (in new terminal)
```bash
npm test
```
✅ 28/28 tests passing

### 4️⃣ Try the Demo
```bash
node demo.js
```

---

## 📋 All NPM Commands

```bash
npm start              # Start Express server
npm run dev           # Start with nodemon (auto-reload)
npm test              # Run all tests
npm run test:watch   # Tests in watch mode
npm run test:coverage # Coverage report
npm run lint          # Check code style
npm run lint:fix      # Auto-fix style issues
npm run demo          # Interactive demo
npm run docker:build  # Build Docker image
npm run compose:up    # Run with Docker Compose
```

---

## 🔌 API Endpoints

### Parse Resume
```bash
curl -X POST http://localhost:3000/api/parse-resume \
  -H "Content-Type: application/json" \
  -d '{"resume": "John Doe, 5 years Java experience..."}'
```

### Parse Job Description
```bash
curl -X POST http://localhost:3000/api/parse-job-description \
  -H "Content-Type: application/json" \
  -d '{"jd": "Senior Java Developer, 5+ years...", "jobId": "J001"}'
```

### Match Resume to Jobs
```bash
curl -X POST http://localhost:3000/api/match-resume-to-jobs \
  -H "Content-Type: application/json" \
  -d '{"resume": {...}, "jobs": [...]}'
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Project overview |
| QUICK_REFERENCE.md | API documentation |
| GITHUB_SETUP.md | Git & submission |
| SUBMISSION_GUIDE.md | Requirements checklist |
| REQUIREMENTS_VALIDATION.md | Complete compliance |
| QUICK_START.md | This file |

---

## ✅ System Check

Run this to verify everything:
```bash
npm test && echo "✅ All systems operational!"
```

---

**Need help? Check the documentation files above!**

