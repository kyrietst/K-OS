# Development Environment Guide

## Google IDX & Cloud Environments

### Browser Tools & Playwright

Running Playwright (and the Antigravity Browser Tool) in cloud environments like
Google IDX requires specific configuration due to missing environment variables
(specifically `$HOME`).

#### Typical Error

```
failed to install playwright: $HOME environment variable is not set
```

#### The Fix (Hard Patch)

We have patched the agent scripts (`.agent/scripts/*.py`) to force a `$HOME`
value if missing:

```python
import os
# FIX PARA GOOGLE IDX
if 'HOME' not in os.environ:
    os.environ['HOME'] = "/home/user"
```

If you re-deploy or update agents, ensure this patch is preserved or applied to
`playwright_runner.py` and `auto_preview.py`.

### Installation

Dependencies effectively installed via:

```bash
# Set HOME for the session
export HOME=/home/user

# Install Playwright Runner Dependencies
pip install playwright
python -m playwright install chromium

# Install Project Dependencies
npm install
```

## Next.js 16 & Turbopack

We use Next.js 16 with Turbopack for fast HMR.

- **Dev Command:** `npm run dev` (configured to run `next dev --turbopack`)
- **Server:** Runs on port 3000 by default.
- **Strict Mode:** React Strict Mode is enabled, which doubles effect execution
  in dev.

## HeroUI V3 Beta

This project uses **HeroUI v3 (Beta)**.

- **Documentation:** [v3.heroui.com](https://v3.heroui.com)
- **Breaking Changes:**
  - Dropdowns require `<Dropdown.Popover>`.
  - Button variants differ from v2.
  - TailWind v4 compatible.
