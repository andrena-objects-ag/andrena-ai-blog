# andrena AI Blog

A demonstration application for the **andrena agentic software engineering workshop**. Based on the [RealWorld](https://github.com/gothinkster/realworld) fullstack example app (CRUD, auth, routing, pagination, and more).

## Getting Started

### Prerequisites

- Java 17+ (21 recommended)
- Maven 3.9+
- Node.js 18.5.0+


<details>
<summary><b>uv installieren (falls noch nicht vorhanden)</b></summary>

**macOS/Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows:**
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Alternative (pip):**
```bash
pip install uv
```

</details>



### Frontend

```shell
npm --prefix=frontend install
npm --prefix=frontend start
```

The Angular dev server starts at `http://localhost:4200`.

### Backend

```shell
uv sync --directory backend
uv run --directory backend python manage.py migrate
uv run --directory backend python manage.py runserver
```

The Django server starts at `http://localhost:8000`.


### Test Login

Use the following credentials to sign in:

- Email: `test@andrena.de`
- Password: `test`

## Run API Tests (Playwright)

```shell
npm --prefix=frontend run test:api
```

This runs Playwright API contract tests against the backend that is already running.

- Default target: `http://127.0.0.1:8000`
- Override target: `API_BASE_URL=http://127.0.0.1:8010 npm --prefix=frontend run test:api`
- This command runs cleanup automatically after tests (even when tests fail).

## Code Stats

To analyse lines of code, install [tokei](https://github.com/XAMPPRocky/tokei?tab=readme-ov-file#installation), then run:

```shell
tokei backend/src
```
