import { timeout } from "rxjs/operators";
import { ExtendedKey, MnemonicPassPhrase, Network, Wallet } from "symbol-hd-wallets";
import { Account, Address, Mosaic, MosaicId, NamespaceHttp, NetworkHttp, NetworkType, RepositoryFactoryHttp } from "symbol-sdk";
import AccountScripts from "./src/AccountScripts";
import MosaicScripts from "./src/MosaicScripts";
import NetworkScripts from "./src/NetworkScripts";
import TransactionScripts from "./src/TransactionScripts";
import { SAMPLE1, SAMPLE2 } from "./test_data";

const divider = (message: string) => console.log("=".repeat(20), message, "=".repeat(20));

// 新規アカウントを発行する
(async () => {
  const mnemonic = MnemonicPassPhrase.createRandom(); // hd-wallet向け
  const seed = mnemonic.toSeed("password").toString("hex"); // passphraseにて暗号化(root seed)
  const xkey = ExtendedKey.createFromSeed(seed, Network.SYMBOL);
  const wallet = new Wallet(xkey);
  const masterAccount = wallet.getAccountPrivateKey();
  const defaultAccount = wallet.getChildAccountPrivateKey(Wallet.DEFAULT_WALLET_PATH);
  console.log(mnemonic);
  // console.log(masterAccount);
  // console.log(defaultAccount);
});

// 過去作成したニーモニックよりアカウントを復元し、保有モザイクを確認する
(async () => {
  const nodeUrl = "http://symbol-test.next-web-technology.com:3000";
  const nw = await NetworkScripts.getNetworkStructureFromNode(nodeUrl, NetworkType.TEST_NET);
  // Accountの作成
  const account1 = AccountScripts.createFromMnemonic(SAMPLE1.MNEMONIC, "password", nw);
  const account2 = AccountScripts.createFromMnemonic(SAMPLE2.MNEMONIC, "password", nw);
  console.log(account1.address);
  console.log(account2.address);
  // Account情報の取得
  const [account1Info] = await AccountScripts.getBalanceFromAddress(account1.address, nw);
  const [account2Info] = await AccountScripts.getBalanceFromAddress(account2.address, nw);
  console.log(JSON.stringify(account1Info));
  console.log(JSON.stringify(account2Info));
  // ACCOUNT1 -> 2への送金
  const mosaic = await MosaicScripts.getMosaicStructureFromMosaicId(account1Info.mosaicId, nw);
  const tx = await TransactionScripts.createTransaction(account2.address, [{ mosaic, amount: 1 }], "test", nw);
  console.log(tx.transactionInfo?.id);
  const result = await TransactionScripts.signTransaction(account1, tx, nw);
  console.log(result);
})();


export { };