import Database from "@tauri-apps/plugin-sql";

const db = new Database("sqlite:jotting.db");

export default db;
