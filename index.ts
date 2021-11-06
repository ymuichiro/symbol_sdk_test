import { Mosaic, NetworkType } from "symbol-sdk";
import AccountScripts from "./src/AccountScripts";
import MnemonicScripts from "./src/MnemonicScripts";
import MosaicScripts from "./src/MosaicScripts";
import NetworkScripts from "./src/NetworkScripts";
import SAMPLE from "./test_data";

const divider = (message: string) => console.log("=".repeat(20), message, "=".repeat(20));

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
  const { address, publicKey, privateKey } = AccountScripts.createFromMnemonic(SAMPLE.MNEMONIC.join(" "), "password", network);
  divider("create success");
  console.log("address", address, "public", publicKey, "private", privateKey);

  // 保有モザイクとそれぞれの残高を表示する
  const accountBalances = await AccountScripts.getBalanceFromAddress("TB6Q5E-YACWBP-CXKGIL-I6XWCH-DRFLTB-KUK34I-YJQ", network);
  divider("current mosaics info");
  for (const accountBalance of accountBalances) {
    console.log(accountBalance.name, accountBalance.mosaicId, accountBalance.amount);
  }

  // 別のアカウントへ送金する


  // 取引履歴を表示する

  // サブアカウントを発行する

  // 保有アカウントの一覧を取得する


  //
})();

export { };