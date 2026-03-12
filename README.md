# CampusConnect Pro

### AI-Assisted Internship Management Platform

**CampusConnect Pro** is a full-stack web application designed to simplify the internship recruitment process by connecting **students and companies on a single platform**.

Students can upload resumes and apply for internships, while companies can post internship opportunities and review applications. The system also includes **AI-assisted resume parsing and skill-based candidate matching** to help identify relevant candidates.

This project was developed as a **college software engineering project** to demonstrate full-stack development, backend API design, and basic AI/NLP integration.

---

# Project Overview

The goal of this project is to create a platform where:

• Students can search and apply for internships
• Companies can post and manage internship opportunities
• Resumes can be uploaded and analyzed
• Candidates can be matched to internships based on skills

The project demonstrates concepts such as **authentication systems, REST API development, database modeling, and basic AI-based matching techniques.**

---

# Tech Stack

### Frontend

• React / Next.js
• Tailwind CSS
• Axios

### Backend

• Node.js
• Express.js

### Database

• MongoDB
• Mongoose

### AI / NLP Components

• Resume parsing
• Skill extraction
• TF-IDF based similarity matching
• Basic semantic similarity techniques

### Dev Tools

• Docker
• GitHub
• Nginx (for deployment configuration)

---

# Key Features

### Student Features

• Student registration and login
• Resume upload
• Browse available internships
• Apply for internships
• View application status

### Company Features

• Company account creation
• Post internship opportunities
• View candidate applications
• Review uploaded resumes

### AI-Assisted Features

• Resume parsing for extracting skills
• Skill-based candidate matching
• Candidate ranking based on internship requirements

---

# System Architecture

The application follows a simple **three-layer architecture**:

Frontend → React / Next.js
Backend → Node.js + Express
Database → MongoDB

```
Student / Company
        ↓
      Frontend
   (React / Next.js)
        ↓
      REST API
  (Node.js + Express)
        ↓
      MongoDB
```

---

# Project Structure

```
CampusConnect-Pro
│
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── services
│   │   ├── nlp
│   │   └── ai
│   ├── config
│   └── server.js
│
├── frontend
│   ├── public
│   └── src
│       ├── components
│       ├── pages
│       ├── hooks
│       ├── context
│       └── styles
│
├── nginx
├── scripts
├── docs
├── docker-compose.yml
└── README.md
```

---

# Installation

Clone the repository:

```
git clone https://github.com/YOUR_USERNAME/CampusConnect-Pro.git
cd CampusConnect-Pro
```

---

# Running the Backend

```
cd backend
npm install
node server.js
```

---

# Running the Frontend

```
cd frontend
npm install
npm run dev
```

---

# Database Setup

Install **MongoDB locally** or use **MongoDB Atlas**.

Update the connection string in:

```
backend/config/db.js
```

---

# Learning Outcomes

Through this project I learned:
• Building full-stack applications using React and Node.js
• Designing REST APIs and backend architecture
• Database modeling with MongoDB
• Implementing authentication with JWT
• Integrating basic AI/NLP techniques for resume analysis

---

Thank You
