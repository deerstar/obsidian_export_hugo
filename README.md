# Hugo Export (Obsidian plugin)

Plugin ID: `exporthugo`

Export the current Obsidian note to a Hugo **Page Bundle** directory:

- Creates a folder named after the note
- Writes `index.md`
- Copies embedded images into the same folder
- Rewrites image references to relative file names

### Requirements

- **Desktop Obsidian** (this plugin uses `fs/path`, so `manifest.json` has `isDesktopOnly: true`)
- Node.js (18+ recommended) for building

### Usage (in Obsidian)

- **Settings → Community plugins → Hugo Export → Hugo content 目录路径**: set your Hugo `content` path (example on Windows: `D:\\blog\\content\\2025\\`).
- Open a note, then:
  - Click the ribbon **upload** icon (**导出到 Hugo**), or
  - Run command **导出当前笔记到 Hugo（Page Bundle）**

### Output

Given a note named `MyNote.md`, and `hugoContentPath` set to `D:\blog\content\2025\`, the plugin will create:

- `D:\blog\content\2025\MyNote\index.md`
- `D:\blog\content\2025\MyNote\<images...>`

If **自动序号前缀（文件夹名）** is enabled, it will scan existing subfolders under `hugoContentPath` and export to:

- `D:\blog\content\2025\01_MyNote\index.md`

### Install (manual)

Copy these files into your vault plugin directory:

- `main.js`
- `manifest.json`
- `styles.css` (optional)

Target path:

`<Vault>/.obsidian/plugins/exporthugo/`

### Package a folder for easy copying (recommended)

This repo provides a one-command packaging step that creates:

`release/exporthugo/`

with:

- `release/exporthugo/main.js`
- `release/exporthugo/manifest.json`
- `release/exporthugo/styles.css`

Run:

```bash
npm run package
```

Then copy the whole folder `release/exporthugo/` into:

`<Vault>/.obsidian/plugins/exporthugo/`

### Development

Install dependencies:

```bash
npm install
```

Watch mode (rebuilds `main.js` on changes):

```bash
npm run dev
```

Production build:

```bash
npm run build
```
