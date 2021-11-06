import { MnemonicPassPhrase } from "symbol-hd-wallets";
import SecureStorageScripts from "./SecureStrageScripts";

export default class MnemonicScripts {

  static SECURE_STRAGE_KEY = "MNEMONIC_KEY";

  /**
   * ニーモニックを生成する
   */
  static generate(): string {
    return MnemonicPassPhrase.createRandom().plain;
  }

  /**
   * ニーモニックをSecureStrageへ格納する
   */
  static async set(mnemonic: string): Promise<string | null> {
    return await SecureStorageScripts.set(this.SECURE_STRAGE_KEY, mnemonic);
  }

  /**
   * SecureStrageよりニーモニックを取得する
   */
  static async get(): Promise<string | null> {
    return await SecureStorageScripts.get(this.SECURE_STRAGE_KEY);
  }

  /**
   * 端末に保存されたニーモニックを削除する
   */
  static async clear(): Promise<string | null> {
    return SecureStorageScripts.remove(this.SECURE_STRAGE_KEY);
  }
}
