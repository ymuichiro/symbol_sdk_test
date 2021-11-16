import { MnemonicPassPhrase } from "symbol-hd-wallets";

(async () => {
  const mnemonic = MnemonicPassPhrase.createRandom(); // hd-wallet向け
  const seed = mnemonic.toSeed("password").toString("hex"); // passphraseにて暗号化(root seed)
  console.log(mnemonic, seed);
})();
