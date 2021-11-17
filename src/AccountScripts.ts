import { timeout } from "rxjs/operators";
import { ExtendedKey, MnemonicPassPhrase, Network, Wallet } from "symbol-hd-wallets";
import { Account, AccountInfo, Address, MosaicId, NetworkType, RepositoryFactoryHttp } from "symbol-sdk";
import MosaicScripts from "./MosaicScripts";
import NetworkScripts, { NetworkStructure } from "./NetworkScripts";
import SecureStorageScripts from "./SecureStrageScripts";
import { QRCodeGenerator } from "symbol-qr-library";


export interface AccountStructure {
  /** アドレス */
  address: string;
  /** 公開鍵 */
  publicKey: string;
  /** 秘密鍵 */
  privateKey: string;
  /** Walletアドレスパス */
  path: string,
  /** 接続先NETWORK */
  network: "TEST_NET" | "MAIN_NET";
}

export interface AccountMosaicBalance {
  mosaicId: string;
  amount: number;
  name: string;
}

const TIME_OUT = 5000;

class CommonLogics {
  static generatePrivateKeyFromMnemonic(mnemonic: string, password: string, path: string, nw: Network): string {
    const extendedKey = ExtendedKey.createFromSeed(new MnemonicPassPhrase(mnemonic).toSeed(password).toString("hex"), nw);
    return new Wallet(extendedKey).getChildAccountPrivateKey(path);
  }
  static generateWalletPath(index: number): string {
    return `m/44\'/4343\'/${index.toString()}\'/0\'/0\'`;
  }
}

export default class AccountScripts {

  static NETWORK = Network.SYMBOL;
  static SECURE_STRAGE_KEY = "ACCOUNT_KEY";

  /** ニーモニックによりウォレットのルートアカウントを読み込む */
  static createRootAccountFromMnemonic(mnemonic: string, password: string, network: NetworkStructure): AccountStructure {
    const walletPath = CommonLogics.generateWalletPath(0);
    const privateKey = CommonLogics.generatePrivateKeyFromMnemonic(mnemonic, password, walletPath, this.NETWORK);
    const nwType = NetworkScripts.getEnumNwType(network.type);
    const account = Account.createFromPrivateKey(privateKey, nwType);
    return this._accountToAccountStructure(account, walletPath, network);
  }

  /** ニーモニックとPATH向けのindex値によりアカウントを読み込む */
  static createAccountFromMnemonicAndIndex(mnemonic: string, password: string, index: number, network: NetworkStructure): AccountStructure {
    const walletPath = CommonLogics.generateWalletPath(index);
    const privateKey = CommonLogics.generatePrivateKeyFromMnemonic(mnemonic, password, walletPath, this.NETWORK);
    const nwType = NetworkScripts.getEnumNwType(network.type);
    const account = Account.createFromPrivateKey(privateKey, nwType);
    return this._accountToAccountStructure(account, walletPath, network);
  }

  /** 秘密鍵よりアカウントを作成する */
  static createFromPrivateKey(privateKey: string, network: NetworkStructure): AccountStructure {
    const nwType = NetworkScripts.getEnumNwType(network.type);
    return this._accountToAccountStructure(Account.createFromPrivateKey(privateKey, nwType), Wallet.DEFAULT_WALLET_PATH, network);
  }

  /** アカウントの情報を取得する */
  static async createAccountInfoFromAddress(rawAddress: string, network: NetworkStructure): Promise<AccountInfo> {
    const address = Address.createFromRawAddress(rawAddress);
    const accountRepo = new RepositoryFactoryHttp(network.node).createAccountRepository();
    return await accountRepo.getAccountInfo(address).pipe(timeout(TIME_OUT)).toPromise();
  }

  /** Redux向けのアカウントオブジェクトを生成する */
  static _accountToAccountStructure(account: Account, path: string, { type }: NetworkStructure): AccountStructure {
    return {
      address: account.address.pretty(),
      publicKey: account.publicKey,
      privateKey: account.privateKey,
      path: path,
      network: type,
    }
  }

  /** SecureStrageのアカウント一覧を取得する */
  static async getSecureStrageAccounts(): Promise<string | null> {
    return await SecureStorageScripts.get(this.SECURE_STRAGE_KEY);
  }

  /** SecureStrageへアカウント情報を保存する */
  static async setSecureStrageAccounts(account: AccountStructure): Promise<void> {

    const rowAccounts = await this.getSecureStrageAccounts();
    if (rowAccounts === null) {
      await SecureStorageScripts.set(this.SECURE_STRAGE_KEY, JSON.stringify([account]));
      return;
    }

    const accounts = JSON.parse(rowAccounts) as AccountStructure[];
    for (const item of accounts) {
      if (item.publicKey !== account.publicKey) accounts.push(account);
    }
    await SecureStorageScripts.set(this.SECURE_STRAGE_KEY, JSON.stringify(accounts));
  }

  /** 指定公開鍵に属する残高情報を取得する */
  static async getBalanceFromAddress(address: string, network: NetworkStructure): Promise<AccountMosaicBalance[]> {
    try {
      const accountInfo = await AccountScripts.createAccountInfoFromAddress(address, network);
      return await Promise.all(accountInfo.mosaics.map(async (mosaic) => {
        const mosaicStructure = await MosaicScripts.getMosaicStructureFromMosaicId(mosaic.id.toHex(), network);
        return {
          mosaicId: mosaic.id.toHex(),
          amount: mosaic.amount.compact() / Math.pow(10, mosaicStructure.divisibility),
          name: mosaicStructure.mosaicName,
        };
      }))
    } catch (e) {
      return [
        {
          mosaicId: network.currencyMosaicId || "",
          amount: 0,
          name: network.currencyMosaicId || "",
        }
      ]
    }
  }

  /** アドレスのQRを発行する */
  static async getAddressQRFromRowAddress(name: string, rawAddress: string, network: NetworkStructure): Promise<string> {
    const nwType = NetworkScripts.getEnumNwType(network.type);
    const qrCode = QRCodeGenerator.createExportAddress(name, rawAddress, nwType, network.generationHash);
    return await qrCode.toBase64().toPromise();
  }

  /** 自分宛の入金を監視する */
  static async watchTransactionToMe(rawAddress: string, network: NetworkStructure): Promise<void> {
    // 返り値として取得したTxの返却と、停止用関数を返す(複雑になるためNG)
    // もしくはStateの更新を含む関数を受け取り、この関数の内部で受け取った関数を評価し続ける（検証）
    const address = Address.createFromRawAddress(rawAddress);
    const repositoryFactory = new RepositoryFactoryHttp(network.node);
    const listerner = repositoryFactory.createListener();
    listerner.open().then(() => {
      listerner.newBlock(); // セッションアウト防止用
      listerner
        .confirmed(address)
        .subscribe(tx => {
          console.log("受信", tx);
          // 受け取ったStateを更新し続ける
          // UI側では受け取ったトランザクションのステータスを表示し続ける（増えていく）
        })
    })
  }
}
