# Bizzy — AI Business Assistant

> Production-grade AI assistant with autonomous Agent Loop, Tool Calling, streaming responses, and a modern full-stack dashboard.

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Agent Flow](#agent-flow)
- [Available Tools](#available-tools)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Example Conversations](#example-conversations)
- [Security](#security)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [License](#license)
- [Author](#author)

---

## Overview

Bizzy is a production-grade AI assistant that goes beyond conventional chatbots. It interprets natural-language requests, autonomously selects and executes the appropriate tools, and completes multi-step business workflows end-to-end.

Rather than generating text-only responses, Bizzy performs real actions: querying sales data, detecting low-stock inventory, creating follow-up tasks, generating SEO-optimized product content, and searching an internal knowledge base.

**Example requests:**

- _"What were this month's sales?"_
- _"Find products with low inventory and create a restock task."_
- _"Write an SEO description for the Mechanical Keyboard."_
- _"What is our return policy?"_

The Agent's reasoning, tool selection, and execution are streamed to the client in real time, providing complete transparency into every step.

---

## Key Features

### Core Capabilities

- **Autonomous Agent Loop** — LLM-driven decision making with OpenAI-compatible Tool Calling
- **Real-Time Streaming** — Server-Sent Events (SSE) deliver live Agent step visibility
- **Error Recovery** — Automatic retry with alternative arguments when a tool fails
- **Multi-Step Workflows** — Sequential tool execution within a single request (up to 5 steps)
- **Bilingual Support** — Persian (RTL) and English out of the box

### Business Tools (6)

| Tool                         | Purpose                                             |
| ---------------------------- | --------------------------------------------------- |
| `get_products`               | Search and filter the product catalog               |
| `get_sales_report`           | Revenue, order count, top products for a date range |
| `get_low_stock_products`     | Identify items below stock threshold                |
| `create_task`                | Create follow-up tasks with priority and due date   |
| `create_product_description` | Generate SEO-optimized content (nested LLM call)    |
| `search_knowledge_base`      | Search company docs, policies, and FAQs             |

### Platform

- **JWT Authentication** — Access + refresh tokens with role-based access control
- **Three-Tier Rate Limiting** — Independent limits for general, auth, and chat endpoints
- **Schema Validation** — Zod-based input validation on every endpoint
- **Centralized Error Handling** — Consistent error responses and logging
- **OpenAPI Documentation** — Full Swagger UI at `/api-docs`
- **Dynamic Model Selection** — Switch LLM providers from the Settings UI
- **Integration Tests** — Jest + Supertest coverage for auth and health endpoints

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              NEXT.JS 15 FRONTEND                    │
│  ┌──────────────────────────────────────────────┐   │
│  │  Landing  │  Auth  │  Chat  │  Settings      │   │
│  └──────────────────────────────────────────────┘   │
│  • SSE Streaming Client                             │
│  • Zustand State Management                         │
│  • shadcn/ui + Tailwind CSS 4                       │
│  • Persian (RTL) + English                          │
└────────────────────────┬────────────────────────────┘
                         │ REST + SSE
                         ▼
┌─────────────────────────────────────────────────────┐
│            NODE.JS + EXPRESS BACKEND                │
│  ┌──────────────────────────────────────────────┐   │
│  │           Agent Service (Core)               │   │
│  │  ┌────────────────────────────────────────┐  │   │
│  │  │   LLM Service                          │  │   │
│  │  │   ├── Retry & Timeout Handling         │  │   │
│  │  │   ├── Tool Call Parsing                │  │   │
│  │  │   └── Usage Tracking                   │  │   │
│  │  └────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────┐  │   │
│  │  │   Tool Runner (6 Tools)                │  │   │
│  │  │   ├── Zod Validation                   │  │   │
│  │  │   ├── Role-Based Access                │  │   │
│  │  │   └── Per-Tool Timeouts                │  │   │
│  │  └────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────┘   │
│  • JWT Auth  • 3-Tier Rate Limiting                 │
│  • Zod Validation  • Swagger  • SSE                 │
└────────────────────────┬────────────────────────────┘
                         │ Mongoose ODM
                         ▼
┌─────────────────────────────────────────────────────┐
│                  MONGODB 7.x                        │
│  Users • Conversations • Messages • Products        │
│  Sales • Tasks • KnowledgeDocs • UserSettings       │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────┐
│              OPENROUTER API                         │
│  Ling 3.0 Flash VL • Nex N2.5 • GPT-4o-mini         │
└─────────────────────────────────────────────────────┘
```

---

## Agent Flow

```
User Message
     │
     ▼
┌────────────────────┐
│  System Prompt +   │
│  Conversation      │
│  History           │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│   LLM Decision     │◄──────────────┐
│   (with Tools)     │               │
└─────────┬──────────┘               │
          │                          │
          ▼                          │
    ┌───────────┐                    │
    │Tool Call? │                    │
    └─────┬─────┘                    │
          │                          │
    ┌─────┴─────┐                    │
    │No         │Yes                 │
    ▼           ▼                    │
┌────────┐  ┌──────────────┐         │
│ Final  │  │ Execute Tool │         │
│ Answer │  │ (validate,   │         │
└────────┘  │  timeout)    │         │
            └──────┬───────┘         │
                   │                 │
                   ▼                 │
            ┌──────────────┐         │
            │ Append Result│─────────┘
            │ to Messages  │
            └──────────────┘
```

**Constraints:**

- `MAX_AGENT_STEPS = 5` — Prevents infinite loops
- `AGENT_TIMEOUT_MS = 60000` — Total execution timeout
- `MAX_TOOL_RESULT_CHARS = 4000` — Context size protection

---

## Available Tools

### `get_products`

Retrieve products from the catalog with optional filtering.

**Arguments:**

- `search` _(string, optional)_ — Match product name or description
- `category` _(string, optional)_ — Filter by category
- `limit` _(integer, optional)_ — Max results (default 10, max 50)

### `get_sales_report`

Generate sales analytics for a specific period.

**Arguments:**

- `period` _(enum)_ — `today` | `this_week` | `this_month` | `last_month` | `this_year` | `custom`
- `from` _(ISO date, optional)_ — Required for custom period
- `to` _(ISO date, optional)_ — Required for custom period

**Returns:** Total revenue, order count, average order value, top products, daily breakdown.

### `get_low_stock_products`

Identify items requiring restock.

**Arguments:**

- `threshold` _(integer, optional)_ — Stock level threshold (default 5)

### `create_task`

Create a follow-up task for the current user.

**Arguments:**

- `title` _(string, required)_
- `description` _(string, optional)_
- `priority` _(enum)_ — `low` | `medium` | `high`
- `relatedProductIds` _(array, optional)_
- `dueDate` _(ISO date, optional)_

### `create_product_description`

Generate SEO-optimized product descriptions using a nested LLM call.

**Arguments:**

- `productId` _(string, optional)_ — Fetch product from DB
- `productName` _(string, optional)_ — Or provide name directly
- `tone` _(enum)_ — `professional` | `friendly` | `luxury` | `technical` | `playful`
- `language` _(enum)_ — `fa` | `en`
- `maxLength` _(integer, optional)_ — Max characters (default 300)

### `search_knowledge_base`

Search internal company documentation and FAQs.

**Arguments:**

- `query` _(string, required)_ — Natural language query
- `limit` _(integer, optional)_ — Max results (default 3)

**Coverage:** Return policies, shipping terms, warranty, general FAQ.

---

## Tech Stack

### Backend

| Technology     |      Version       | Purpose           |
| -------------- | :----------------: | ----------------- |
| Node.js        |        22.x        | Runtime           |
| Express        |        4.x         | HTTP framework    |
| MongoDB        |        7.x         | Primary database  |
| Mongoose       |        8.x         | ODM               |
| Zod            |        3.x         | Schema validation |
| JSON Web Token |        9.x         | Authentication    |
| bcryptjs       |        3.x         | Password hashing  |
| Axios          |        1.x         | HTTP client (LLM) |
| Helmet         |        8.x         | Security headers  |
| Swagger        | jsdoc + ui-express | API documentation |

### Frontend

| Technology     | Version | Purpose                      |
| -------------- | :-----: | ---------------------------- |
| Next.js        |  15.x   | React framework (App Router) |
| React          |  19.x   | UI library                   |
| TypeScript     |   5.x   | Type safety                  |
| Tailwind CSS   |   4.x   | Utility-first styling        |
| shadcn/ui      | Latest  | Component library (Radix UI) |
| Zustand        | Latest  | State management             |
| react-markdown | Latest  | Markdown rendering           |
| Sonner         | Latest  | Toast notifications          |

### AI / LLM

| Technology            | Purpose                            |
| --------------------- | ---------------------------------- |
| OpenRouter            | LLM gateway (multi-provider)       |
| Ling 3.0 Flash VL     | Primary model (free, tool calling) |
| Nex N2.5              | Agentic fallback models            |
| OpenAI-compatible API | Standard interface                 |

---

## Project Structure

```
my-project/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js              # Validated environment variables
│   │   │   ├── db.js               # MongoDB connection + event handling
│   │   │   ├── constants.js        # Shared constants
│   │   │   └── swagger.js          # OpenAPI specification
│   │   ├── utils/
│   │   │   ├── logger.js           # Structured logger
│   │   │   ├── ApiError.js         # Error class hierarchy
│   │   │   ├── asyncHandler.js     # Async route wrapper
│   │   │   ├── apiResponse.js      # Standard response shapes
│   │   │   └── sse.js              # Server-Sent Events helper
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT + role guard
│   │   │   ├── errorHandler.js     # Centralized error handling
│   │   │   ├── notFound.js         # 404 handler
│   │   │   ├── requestLogger.js    # Request/response logging
│   │   │   └── rateLimiter.js      # In-memory rate limiter
│   │   ├── services/
│   │   │   ├── llm.service.js      # OpenRouter client + retry logic
│   │   │   ├── agent.service.js    # Agent Loop (core)
│   │   │   └── tool-runner.service.js
│   │   ├── modules/
│   │   │   ├── auth/               # User model, register, login
│   │   │   ├── chat/               # Conversations, messages, SSE
│   │   │   ├── products/           # Product CRUD + services
│   │   │   ├── sales/              # Sales model + aggregation
│   │   │   ├── tasks/              # Task CRUD
│   │   │   ├── knowledge-base/     # KB documents
│   │   │   ├── settings/           # User preferences + model selection
│   │   │   └── tools/
│   │   │       ├── tools.registry.js
│   │   │       └── definitions/    # 6 tool implementations
│   │   ├── routes/
│   │   │   └── index.js            # Route aggregation
│   │   ├── app.js                  # Express application
│   │   └── server.js               # Entry point + graceful shutdown
│   ├── scripts/
│   │   ├── seed.js                 # Seed users, products, sales
│   │   ├── seed-knowledge.js       # Seed knowledge base
│   │   └── test-sse.js             # SSE test client
│   ├── tests/
│   │   ├── setup.js
│   │   ├── auth.test.js
│   │   └── health.test.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx          # Root layout + fonts
    │   │   ├── page.tsx            # Landing page
    │   │   ├── globals.css         # Theme + RTL config
    │   │   ├── (auth)/
    │   │   │   ├── login/page.tsx
    │   │   │   └── register/page.tsx
    │   │   └── (dashboard)/
    │   │       ├── layout.tsx      # Protected + sidebar
    │   │       ├── chat/
    │   │       │   ├── layout.tsx
    │   │       │   ├── page.tsx
    │   │       │   └── [id]/page.tsx
    │   │       └── settings/
    │   │           └── page.tsx    # Model selection
    │   ├── components/
    │   │   ├── ui/                 # shadcn primitives
    │   │   ├── agent/              # Agent step visualization
    │   │   ├── chat/               # Chat UI components
    │   │   ├── layout/             # Sidebar, header
    │   │   └── auth/               # Auth forms
    │   ├── lib/
    │   │   ├── api.ts              # Axios client + auth types
    │   │   ├── chat-api.ts         # Chat API + SSE client
    │   │   ├── settings-api.ts     # Settings API
    │   │   ├── fonts.ts            # Local font configuration
    │   │   └── utils.ts
    │   ├── store/                  # Zustand stores
    │   └── middleware.ts           # Route protection
    ├── public/
    │   └── fonts/                  # AzarMehr + Outfit
    ├── .env.local.example
    └── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **MongoDB** >= 7 (local installation or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **OpenRouter API key** — obtain from [openrouter.ai/keys](https://openrouter.ai/keys)

### Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env and fill in MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, OPENROUTER_API_KEY

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

Backend runs on **http://localhost:5000**
Swagger documentation at **http://localhost:5000/api-docs**

### Frontend Setup

```bash
cd frontend
npm install

# Create environment file
cp .env.local.example .env.local
# Verify NEXT_PUBLIC_API_URL points to the backend

# Start development server
npm run dev
```

Frontend runs on **http://localhost:3000**

### Default Credentials

After running the seed script:

| Role  | Email               | Password     |
| ----- | ------------------- | ------------ |
| Admin | `admin@example.com` | `admin12345` |
| User  | `user@example.com`  | `user12345`  |

---

## API Reference

Full interactive documentation available at `/api-docs` (Swagger UI).

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| `POST` | `/api/auth/register` | Register new user   |
| `POST` | `/api/auth/login`    | Login (returns JWT) |
| `GET`  | `/api/auth/me`       | Get current user    |

### Chat

| Method | Endpoint                        | Description         |
| ------ | ------------------------------- | ------------------- |
| `POST` | `/api/chat`                     | Create conversation |
| `GET`  | `/api/chat`                     | List conversations  |
| `GET`  | `/api/chat/:id/messages`        | Get messages        |
| `POST` | `/api/chat/:id/messages`        | Send message (JSON) |
| `POST` | `/api/chat/:id/messages/stream` | Send message (SSE)  |

### Products

| Method   | Endpoint                  | Description     |
| -------- | ------------------------- | --------------- |
| `GET`    | `/api/products`           | List products   |
| `GET`    | `/api/products/low-stock` | Low stock items |
| `GET`    | `/api/products/:id`       | Get product     |
| `POST`   | `/api/products`           | Create (admin)  |
| `PATCH`  | `/api/products/:id`       | Update (admin)  |
| `DELETE` | `/api/products/:id`       | Delete (admin)  |

### Tasks

| Method   | Endpoint         | Description       |
| -------- | ---------------- | ----------------- |
| `GET`    | `/api/tasks`     | List user's tasks |
| `POST`   | `/api/tasks`     | Create task       |
| `GET`    | `/api/tasks/:id` | Get task          |
| `PATCH`  | `/api/tasks/:id` | Update task       |
| `DELETE` | `/api/tasks/:id` | Delete task       |

### Sales

| Method | Endpoint            | Description        |
| ------ | ------------------- | ------------------ |
| `GET`  | `/api/sales`        | List sales (admin) |
| `GET`  | `/api/sales/report` | Sales analytics    |

### Settings

| Method  | Endpoint                    | Description           |
| ------- | --------------------------- | --------------------- |
| `GET`   | `/api/settings`             | Get user settings     |
| `PATCH` | `/api/settings`             | Update settings       |
| `GET`   | `/api/settings/models`      | List available models |
| `POST`  | `/api/settings/models/test` | Test a model          |

---

## Example Conversations

### Single-Tool Query

```
User:  فروش این ماه چقدر بوده؟

Agent: Let me check this month's sales report.

Tool:  get_sales_report({ period: "this_month" })

## Sales Report — Current Month

| Metric              | Value          |
|---------------------|----------------|
| Total Revenue       | 43,255,000     |
| Total Orders        | 12             |
| Avg Order Value     | 3,604,583      |
| Items Sold          | 46             |

Top Selling Products:
1. Mechanical Keyboard — 7 units — 17,500,000
2. USB-C Hub — 8 units — 9,600,000
...
```

### Multi-Step Workflow

```
User:  محصولات کم‌موجود رو پیدا کن و برام تسک بساز

Agent: I'll find low-stock products and create a task.

Tool:  get_low_stock_products({ threshold: 5 })
Tool:  create_task({
         title: "Review low-stock products",
         priority: "high",
         relatedProductIds: [...]
       })

Task created successfully:

Low Stock Products:
| Product              | SKU     | Stock |
|----------------------|---------|-------|
| Bluetooth Speaker    | BS-5001 | 2     |
| Mechanical Keyboard  | MK-2001 | 3     |
| Desk Lamp LED        | DL-8001 | 4     |

Task: "Review low-stock products" — Priority: High
```

### Knowledge Base Query

```
User:  شرایط مرجوعی محصولات چیه؟

Agent: Let me search the knowledge base.

Tool:  search_knowledge_base({ query: "شرایط مرجوعی محصولات" })

## Return Policy

Customers may request a return within 7 days of delivery.

Conditions:
- Item must be in original packaging and undamaged
- Refunds processed within 48 hours of approval

Non-returnable items:
- Opened hygiene products
- Customized items
- Gift cards
```

---

## Security

- **Authentication** — JWT access + refresh tokens with configurable expiry
- **Password Hashing** — bcrypt with 12 rounds
- **Authorization** — Role-based access control (`user` / `admin`)
- **Rate Limiting** — Three tiers with independent windows:
  - General endpoints: 200 req/min
  - Auth endpoints: 20 req/15 min
  - Chat endpoints: 30 req/min
- **Input Validation** — Zod schemas on every endpoint
- **Security Headers** — Helmet with sane defaults
- **CORS** — Explicit origin allowlist
- **Environment Validation** — Fail-fast on missing critical variables
- **Error Handling** — Stack traces suppressed in production

---

## Testing

```bash
cd backend
npm test
```

Test coverage includes:

- Health check endpoint
- Authentication flow (register, login, token validation)
- Input validation errors
- Authorization guards

Integration tests use **Jest** and **Supertest**.

---

## Roadmap

### Completed

- [x] Agent Loop with Tool Calling
- [x] Server-Sent Events streaming
- [x] JWT authentication + role-based access
- [x] Three-tier rate limiting
- [x] Six business tools
- [x] Swagger API documentation
- [x] Integration tests
- [x] Dynamic model selection UI
- [x] Persian (RTL) + English support

### In Progress

- [ ] Real RAG with vector embeddings
- [ ] PDF upload and chunking
- [ ] Chart visualizations for analytics
- [ ] Dark mode toggle persistence

### Planned

- [ ] Docker + Docker Compose
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Deployment guide (VPS + Nginx + PM2)
- [ ] End-to-end tests (Playwright)
- [ ] Mobile-responsive sidebar (Sheet)
- [ ] Regenerate response action
- [ ] Export report to PDF

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Author

**Amir Reza (ziper)**

Full-Stack Developer focused on AI-powered applications, autonomous agents, and modern web architecture.

- GitHub: [@ziperazz](https://github.com/ziperazz)

---

## Acknowledgements

- [OpenRouter](https://openrouter.ai) — Unified LLM API gateway
- [shadcn/ui](https://ui.shadcn.com) — Component primitives
- [Vercel](https://vercel.com) — Next.js framework and hosting
- [InclusionAI](https://openrouter.ai/models?q=ling) — Ling 3.0 models

---

<p align="center">
  Built as a portfolio project to demonstrate production-grade AI Agent architecture.
</p>
