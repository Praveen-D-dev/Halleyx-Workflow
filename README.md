# 🚀 Halleyx Challenge 1 – Workflow Engine System

## 📌 Overview

This project is a full-stack **Workflow Engine System** built as part of **Halleyx Challenge 1**.

The application allows users to design and execute workflows consisting of multiple steps, conditions, and actions. It simulates real-world business processes such as approvals, task flows, and status tracking.

---

## 🌐 Live Application

* Frontend: https://workflow-virid-eta.vercel.app/
* Backend: https://backend-qyal.onrender.com/

---

## 🎯 Core Features

### 🔄 Workflow Builder

* Create workflows with multiple steps
* Define execution flow dynamically
* Supports conditional logic between steps

### ⚙️ Workflow Execution

* Execute workflows based on defined rules
* Tracks progress across different stages
* Maintains current state of execution

### 📜 Audit & State Tracking

* Logs each step execution
* Tracks transitions between states
* Provides visibility into workflow history

### ✅ Task & Approval Flow

* Simulates approval-based workflows
* Step-by-step progression system
* Supports decision-based branching

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Modern component-based architecture
* Clean and responsive UI

### Backend

* Node.js
* Express.js
* Prisma ORM
* SQLite database

### Deployment

* Vercel (Frontend)
* Render (Backend)

---

## ⚙️ System Architecture

* Frontend communicates with backend via REST APIs
* Backend handles:

  * Workflow logic
  * State transitions
  * Database operations using Prisma
* SQLite used for lightweight and efficient storage

---

## 🔗 API Endpoints (Sample)

### Workflow

* `POST /workflows` → Create a workflow
* `GET /workflows` → Fetch all workflows
* `GET /workflows/:id` → Get workflow details

### Execution

* `POST /execute` → Start workflow execution
* `POST /execute/:id/next` → Move to next step
* `GET /execute/:id` → Get execution status

---

## 🚀 Running Locally

### 1. Clone the project

```bash id="wz2kqf"
git clone <your-repo-link>
cd project-root
```

---

### 2. Frontend Setup (React + Vite)

```bash id="v7z2dh"
cd frontend
npm install
npm run dev
```

* Runs on: http://localhost:5173/

---

### 3. Backend Setup (Node + Prisma)

```bash id="1x9q7s"
cd backend
npm install

# Run database migrations
npx prisma migrate dev

# Start server
npm run dev
```

* Runs on: http://localhost:3000/

---

## 🧪 Development Commands

### Frontend

```bash id="r6b5vh"
npm run dev
npm run build
```

### Backend

```bash id="d2kx8p"
npm run dev
npx prisma studio
```

---

## 💡 Key Highlights

* Designed a dynamic workflow engine (not static logic)
* Implemented conditional step execution
* Built state tracking and audit logging
* Integrated Prisma ORM for structured database handling
* Deployed full-stack application

---


Praveen D

Praveen D
Computer Science & Engineering
