
---

## 📝 docs/architecture.md
```md
# 🏗️ Architecture

## High-Level Overview
Explain the system design at a glance.

## Components
- **Frontend** → Next.js for UI
- **Backend** → Django APIs
- **Database** → PostgreSQL
- **Infra** → Docker, Nginx, AWS

## Architecture Diagram
(Include diagram here - can use Excalidraw, Mermaid, or PlantUML)

```mermaid
flowchart TD
  User --> Frontend
  Frontend --> Backend
  Backend --> Database
  Backend --> ExternalAPI
