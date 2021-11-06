# Classes

- Account ... Walletの生成や復元、照会や情報変更を担当
  - 作成 ... ニーモニックとインデックスを受取り、アカウントを作成する
  - 復元 ... 秘密鍵を受取り、アカウントを復元する
- Wallet ... Account,Munemonic操作の抽象化クラス
  - HDアカウントの復元、 秘密鍵アカウントの作成
  - アカウントの削除
  - アカウントの名称変更
  - Paper walletのダウンロード
- Mnemonic ... ニーモニックの作成、保存
  - ニーモニック生成 ... ニーモニックを生成する
  - ニーモニックの保存（RNSecureStorageへ作成されたニーモニックを保存する）
  - ニーモニックの取得（RNSecureStorageに保存されたニーモニックを取得する）

# Store
Reduxにより保持。 Root walletはセキュリティ上保持させない。
UIがReactの為、Class内で状態管理を行なわないように注意

- Wallet
  - Account: Account[]