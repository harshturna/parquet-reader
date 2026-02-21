# Parquet Reader

A browser-based tool for opening, exploring, and querying Apache Parquet files. No installs, no server uploads — everything runs locally in your browser.

**Live:** [parquetreader.byharsh.com](https://parquetreader.byharsh.com)

## Features

- Drag-and-drop `.parquet` file loading
- Schema inspection with column names and types
- Sortable, filterable data grid powered by AG Grid
- SQL editor with full DuckDB-WASM query support
- CSV export
- Fully client-side — your data never leaves the browser

## Tech Stack

React · TypeScript · Vite · Tailwind CSS · DuckDB-WASM · AG Grid · Hyparquet · CodeMirror

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
