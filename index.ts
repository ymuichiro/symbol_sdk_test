import { NetworkType } from "symbol-sdk";
import AccountScripts from "./src/AccountScripts";
import MnemonicScripts from "./src/MnemonicScripts";
import NetworkScripts from "./src/NetworkScripts";
import SAMPLE from "./test_data";

const divider = (message: string) => console.log("=".repeat(20), message, "=".repeat(20));
divider("start");

(async () => {
  // 接続NWを設定する
  const nodeUrl = "http://symbol-test.next-web-technology.com:3000";
  const network = await NetworkScripts.getNetworkStructureFromNode(nodeUrl, NetworkType.TEST_NET);

  // 新規アカウントを作成する
  // const mnemonic = MnemonicScripts.generate();
  // console.log("mnemonic", mnemonic);
  // const account = AccountScripts.createFromMnemonic(mnemonic, "password", network);
  // divider("create success");
  // console.log("public", account.publicKey, "private", account.privateKey);

  // 既存アカウントを読み込む
  const account = AccountScripts.createFromMnemonic(SAMPLE.MNEMONIC.join(" "), "password", network);
  divider("create success");
  console.log("public", account.publicKey, "private", account.privateKey);




  //
})();

export { };