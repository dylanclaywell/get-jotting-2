// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use tauri::path::BaseDirectory;
use tauri::Manager;
use tauri::WindowEvent;
use tauri_plugin_sql::{Migration, MigrationKind};

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
        Migration {
            version: 5,
            description: "add tab changed indicator theme entry",
            sql: "
                INSERT INTO theme_entry (key, value) VALUES
                ('tabChangedIndicator', '#fbbf24')
                ;
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "add active and inactive tab text theme entries",
            sql: "
                INSERT INTO theme_entry (key, value) VALUES
                ('activeTabText', '#000000'),
                ('inactiveTabText', '#808080')
                ;
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "add active and inactive file and folder hover background theme entries",
            sql: "
                INSERT INTO theme_entry (key, value) VALUES
                ('activeFileHoverBackground', '#bedbff'),
                ('activeFolderHoverBackground', '#bedbff'),
                ('inactiveFileHoverBackground', '#f0f0f0'),
                ('inactiveFolderHoverBackground', '#f0f0f0')
                ;
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 8,
            description: "add active and inactive file and folder hover text theme entries",
            sql: "
                INSERT INTO theme_entry (key, value) VALUES
                ('activeFileHoverText', '#000000'),
                ('activeFolderHoverText', '#000000'),
                ('inactiveFileHoverText', '#000000'),
                ('inactiveFolderHoverText', '#000000')
                ;
            ",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
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
