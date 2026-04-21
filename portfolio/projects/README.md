# Portfolio Projects

Add project favicons/logos here and register them in `projects.json`.

## How to add a new project:

1. Drop the project favicon/logo (PNG, ~64x64 or larger) into this folder
2. Add an entry to `projects.json`:

```json
{
    "name": "Project Name",
    "slug": "project-slug",
    "type": "Typ projektu",
    "description": "Krótki opis rozwiązania po polsku.",
    "type_en": "Project Type",
    "description_en": "Short solution description in English.",
    "url": "https://project-url.com",
    "favicon": "project-logo.png"
}
```

3. The carousel on the homepage will automatically pick up the new project.

## Fields:
- **name** — Display name
- **slug** — URL-safe identifier
- **type / type_en** — Category label (PL/EN)
- **description / description_en** — Hover tooltip description (PL/EN)
- **url** — Live project link (null if not public)
- **favicon** — Image filename in this folder
