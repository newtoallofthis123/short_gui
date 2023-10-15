// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;

use regex::Regex;
use tauri::Menu;

const REQUEST_URL: &str = "https://www.noobscience.rocks/api/go";
const SUDO_REQUEST_URL: &str = "https://www.noobscience.rocks/api/go/sudo";

fn get_client()-> reqwest::Client{
    let client = reqwest::Client::new();
    return client;   
}

fn convert_to_json(txt: &str)-> serde_json::Value{
    let json = serde_json::from_str(txt).unwrap();
    return json;
}

pub fn is_valid_url(url: &str) -> bool {
    let url_regex = Regex::new(r#"^(https?://)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$"#).unwrap();
    url_regex.is_match(url)
}

#[tauri::command]
async fn send_request(url: &str, slug: &str, custom: bool)-> Result<serde_json::Value, ()>{
    let client = get_client();

    if !is_valid_url(url.clone()) {
        return Err(());
    }

    let mut form_data = HashMap::new();
    form_data.insert("url", url);
    form_data.insert("slug", slug);

    let response = client.post(
        if custom {
            SUDO_REQUEST_URL
        } else {
            REQUEST_URL
        }
    )
        .form(&form_data)
        .send()
        .await
        .unwrap();

    // Get the response text
    let response_text = response.text().await.unwrap();

    let json = convert_to_json(&response_text);
    Ok(json)
}

fn get_menu()-> Menu{
    let quit = tauri::CustomMenuItem::new("quit".to_string(), "Quit");
    let web = tauri::CustomMenuItem::new("web".to_string(), "Open Web App");
    let cli = tauri::CustomMenuItem::new("cli".to_string(), "Download CLI");
    let terms = tauri::CustomMenuItem::new("terms".to_string(), "Terms of Service");

    let menu = Menu::new().add_item(quit).add_item(web).add_item(cli).add_item(terms);
    menu
}

fn main() {

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            send_request
        ])
        .menu(get_menu())
        .on_menu_event(|event| {
            match event.menu_item_id() {
                "quit" => {
                    std::process::exit(0);
                }
                "web" => {
                    webbrowser::open("https://www.noobscience.rocks").unwrap();
                }
                "cli" => {
                    webbrowser::open("https://github.com/newtoallofthis123/short_cli").unwrap();
                }
                "terms" => {
                    webbrowser::open("https://www.noobscience.rocks/terms").unwrap();
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
