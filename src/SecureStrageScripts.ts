// import RNSecureStorage, { ACCESSIBLE } from "rn-secure-storage";

export default class SecureStorageScripts {

  /** 保存する */
  static set = async (key: string, value: string): Promise<string | null> => {
    // return RNSecureStorage.set(key, value, {
    //   accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    // });
    return "ok";
  };

  /** 取得する */
  static get = async (key: string): Promise<string | null> => {
    // try {
    //   return await RNSecureStorage.get(key);
    // } catch (e) {
    //   return null;
    // }
    return "ok";
  };

  /** 対象キーを削除する */
  static remove = async (key: string): Promise<string | null> => {
    // return RNSecureStorage.remove(key);
    return "ok";
  };
}