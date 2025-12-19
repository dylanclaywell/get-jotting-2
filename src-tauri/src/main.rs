// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use tauri::path::BaseDirectory;
use tauri::Manager;
use tauri::WindowEvent;
use tauri_plugin_sql::{Builder, Migration, MigrationKind};

fn main() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create folders table",
            sql: "CREATE TABLE IF NOT EXISTS folders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                parent_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(parent_id) REFERENCES folders(id) ON DELETE CASCADE
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create files table",
            sql: "CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                content TEXT,
                folder_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(folder_id) REFERENCES folders(id) ON DELETE CASCADE
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create theme entry table",
            sql: "CREATE TABLE IF NOT EXISTS theme_entry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL,
                value TEXT NOT NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add default theme entries",
            sql: "
                INSERT INTO theme_entry (key, value) VALUES
                ('background', '#FFFFFF'),
                ('editorBackground', '#FFFFFF'),

                ('activeTabBackground', '#FFFFFF'),
                ('activeTabHighlight', '#f6339a'),

                ('inactiveTabBackground', '#FFFFFF'),
                ('editorText', '#000000'),
                ('fileTreeBackground', '#FFFFFF'),

                ('activeFileText', '#000000'),
                ('activeFileBackground', '#bedbff'),
                ('activeFolderText', '#000000'),
                ('activeFolderBackground', '#bedbff'),

                ('inactiveFileText', '#000000'),
                ('inactiveFileBackground', '#FFFFFF'),
                ('inactiveFolderText', '#000000'),
                ('inactiveFolderBackground', '#FFFFFF')
                ;
            ",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .setup(|app| {
            // 1. Get paths for the Resource and AppLocalData directories
            let resource_path = app.path().resolve("themes", BaseDirectory::Resource)?;
            let local_data_path = app.path().resolve("themes", BaseDirectory::AppLocalData)?;

            // 2. Check if themes already exist in AppLocalData
            if !local_data_path.exists() {
                println!("First run: Initializing theme files...");

                // Create the destination directory
                fs::create_dir_all(&local_data_path)?;

                // 3. Copy files from Resources to AppLocalData
                // For a simple directory copy, we iterate through the resource folder
                if resource_path.is_dir() {
                    for entry in fs::read_dir(resource_path)? {
                        let entry = entry?;
                        let file_name = entry.file_name();
                        let dest_file = local_data_path.join(file_name);
                        fs::copy(entry.path(), dest_file)?;
                    }
                }
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::Destroyed = event {
                // Check if the destroyed window was the "main" window
                if window.label() == "main" {
                    // Explicitly exit the application
                    window.app_handle().exit(0);
                }
            }
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:jotting.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    // get_jotting_2_lib::run()
}
