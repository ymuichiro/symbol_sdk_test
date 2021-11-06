import { timeout } from "rxjs/operators";
import { ExtendedKey, MnemonicPassPhrase, Network, Wallet } from "symbol-hd-wallets";
import { Account, AccountHttp, AccountInfo, Address, RepositoryFactoryHttp } from "symbol-sdk";
import MosaicScripts from "./MosaicScripts";
import NetworkScripts, { NetworkStructure } from "./NetworkScripts";
import SecureStorageScripts from "./SecureStrageScripts";

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

const TIME_OUT = 5000;

export default class AccountScripts {

  static NETWORK = Network.SYMBOL;
  static SECURE_STRAGE_KEY = "ACCOUNT_KEY";

  /**
   * ニーモニックにより新規アカウントを生成する
   * TODO wallet path を判断する為、現状の子アドレスの高さを以下関数へ渡す事
   */
  static createFromMnemonic(mnemonic: string, password: string, network: NetworkStructure): AccountStructure {
    const extendedKey = ExtendedKey.createFromSeed(new MnemonicPassPhrase(mnemonic).toSeed(password).toString("hex"), this.NETWORK);
    const privateKey = new Wallet(extendedKey).getChildAccountPrivateKey(Wallet.DEFAULT_WALLET_PATH);
    const nwType = NetworkScripts.getEnumNwType(network.type);
    return this._accountToAccountStructure(Account.createFromPrivateKey(privateKey, nwType), Wallet.DEFAULT_WALLET_PATH, network);
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
  static async getBalanceFromAddress(address: string, network: NetworkStructure): Promise<{ mosaicId: string, amount: number, name: string }[]> {
    const accountInfo = await AccountScripts.createAccountInfoFromAddress(address, network);
    return await Promise.all(accountInfo.mosaics.map(async (mosaic) => {
      const mosaicStructure = await MosaicScripts.getMosaicStructureFromMosaicId(mosaic.id.toHex(), network);
      return {
        mosaicId: mosaic.id.toHex(),
        amount: mosaic.amount.compact() / Math.pow(10, mosaicStructure.divisibility),
        name: mosaicStructure.mosaicName,
      };
    }))
  }
}
