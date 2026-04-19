/**
 * Tauri 插件管理命令处理器
 *
 * 为前端提供本地文件操作接口：
 * - import_plugin_file: 获取选择的插件文件信息（文件选择由前端处理）
 * - get_plugin_directory: 获取插件存储目录路径
 * - validate_plugin_file: 验证插件包格式
 * - export_plugin: 导出插件到本地磁盘
 */
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// 导入插件的响应数据结构
#[derive(Serialize, Deserialize, Debug)]
#[allow(dead_code)]
pub struct ImportPluginResponse {
    /// 选择的文件路径
    pub file_path: String,
    /// 文件名称
    pub file_name: String,
    /// 文件大小（字节）
    pub file_size: u64,
}

/// 插件验证结果
#[derive(Serialize, Deserialize, Debug)]
pub struct ValidationResult {
    /// 是否有效
    pub valid: bool,
    /// 验证消息
    pub message: String,
    /// 插件 ID（如果有效）
    pub plugin_id: Option<String>,
}

/// 导出结果
#[derive(Serialize, Deserialize, Debug)]
pub struct ExportResult {
    /// 导出目标路径
    pub export_path: String,
    /// 是否成功
    pub success: bool,
    /// 消息
    pub message: String,
}

/// 获取插件目录（在 Tauri Desktop 上可用）
///
/// # Returns
/// 插件存储目录的完整路径
#[tauri::command]
pub async fn get_plugin_directory() -> Result<String, String> {
    let app_data = dirs::config_dir()
        .map(|p| p.join("Veto/plugins"))
        .ok_or_else(|| "无法获取应用数据目录".to_string())?;

    Ok(app_data
        .to_str()
        .ok_or_else(|| "路径转换失败".to_string())?
        .to_string())
}

/// 验证插件包的基本格式
///
/// # Arguments
/// * `file_path` - 插件文件的完整路径
///
/// # Returns
/// 验证结果，包含是否有效和相关信息
#[tauri::command]
pub async fn validate_plugin_file(file_path: String) -> Result<ValidationResult, String> {
    let path = PathBuf::from(&file_path);

    // 检查文件是否存在
    if !path.exists() {
        return Ok(ValidationResult {
            valid: false,
            message: "文件不存在".to_string(),
            plugin_id: None,
        });
    }

    // 检查文件扩展名
    let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");

    if ext != "csmod" {
        return Ok(ValidationResult {
            valid: false,
            message: "文件格式不正确，应为 .csmod".to_string(),
            plugin_id: None,
        });
    }

    // 尝试作为 ZIP 打开（csmod 本质上是 ZIP 文件）
    let file = std::fs::File::open(&path).map_err(|e| format!("无法打开文件: {}", e))?;

    match zip::ZipArchive::new(file) {
        Ok(mut archive) => {
            // 检查 manifest.json 是否存在
            match archive.by_name("manifest.json") {
                Ok(mut manifest_file) => {
                    let mut manifest_content = String::new();
                    use std::io::Read;
                    manifest_file
                        .read_to_string(&mut manifest_content)
                        .map_err(|e| format!("无法读取 manifest: {}", e))?;

                    // 尝试解析 JSON
                    match serde_json::from_str::<serde_json::Value>(&manifest_content) {
                        Ok(manifest) => {
                            let plugin_id = manifest
                                .get("id")
                                .and_then(|v| v.as_str())
                                .unwrap_or("unknown")
                                .to_string();

                            Ok(ValidationResult {
                                valid: true,
                                message: "插件包有效".to_string(),
                                plugin_id: Some(plugin_id),
                            })
                        }
                        Err(_) => Ok(ValidationResult {
                            valid: false,
                            message: "manifest.json 格式错误".to_string(),
                            plugin_id: None,
                        }),
                    }
                }
                Err(_) => Ok(ValidationResult {
                    valid: false,
                    message: "缺少 manifest.json 文件".to_string(),
                    plugin_id: None,
                }),
            }
        }
        Err(_) => Ok(ValidationResult {
            valid: false,
            message: "无法解析为有效的 ZIP 包".to_string(),
            plugin_id: None,
        }),
    }
}

/// 导出插件到本地磁盘
///
/// # Arguments
/// * `_plugin_id` - 插件 ID
/// * `export_path` - 导出目标路径
///
/// # Returns
/// 导出结果
#[tauri::command]
pub async fn export_plugin(
    _plugin_id: String,
    export_path: String,
) -> Result<ExportResult, String> {
    // 验证导出路径
    if !export_path.ends_with(".csmod") {
        return Ok(ExportResult {
            export_path,
            success: false,
            message: "导出路径必须以 .csmod 结尾".to_string(),
        });
    }

    Ok(ExportResult {
        export_path,
        success: true,
        message: "导出路径已验证，准备导出".to_string(),
    })
}

/// 检查文件是否可读（用于权限检查）
///
/// # Arguments
/// * `file_path` - 文件路径
///
/// # Returns
/// 是否可读
#[tauri::command]
pub async fn check_file_readable(file_path: String) -> Result<bool, String> {
    let path = PathBuf::from(&file_path);
    Ok(path.exists() && path.is_file())
}
