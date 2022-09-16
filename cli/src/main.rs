mod config;
mod create;
mod delete;
mod read;
mod update;

use crate::config::Command;
use anyhow::Result;
use config::SystemSettings;

#[tokio::main]
async fn main() -> Result<()> {
  let sys = SystemSettings::load_from_env()?;

  match sys.command {
    Command::Create(cmd) => cmd.invoke(sys.solana).await?,
    Command::Read(cmd) => cmd.invoke(sys.solana).await?,
    Command::Update(cmd) => cmd.invoke(sys.solana).await?,
    Command::Delete(cmd) => cmd.invoke(sys.solana).await?,
  };

  Ok(())
}

// #[cfg(test)]
// mod tests {
//   use assert_cmd::prelude::*;
//   use std::process::Command;

//   #[test]
//   fn test_create() {
//     let mut cmd = Command::cargo_bin("vvtec").unwrap();
//     cmd
//       .arg("create")
//       .arg("--name")
//       .arg("crypto.sol.usdt")
//       .spawn()
//       .expect("msg");
//   }

//   #[test]
//   fn test_read() {
//     let mut cmd = Command::cargo_bin("vvtec").unwrap();

//     cmd
//       .arg("read")
//       .arg("crypto.sol.usdt")
//       .spawn()
//       .expect("msg");
//   }

//   #[test]
//   fn test_update() {
//     let mut cmd = Command::cargo_bin("vvtec").unwrap();

//     cmd
//       .arg("update")
//       .arg("crypto.sol.usdt")
//       .arg("1860000000")
//       .spawn()
//       .expect("msg");
//   }

//   #[test]
//   fn test_delete() {
//     let mut cmd = Command::cargo_bin("vvtec").unwrap();

//     cmd
//       .arg("delete")
//       .arg("crypto.sol.usdt")
//       .spawn()
//       .expect("msg");
//   }
// }
