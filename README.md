# SimpleDigitalSignage

PCブラウザ、タブレットを想定したURLサイトを順繰り表示するデジタルサイネージを実現します。

# 使い方
- view.html
    - デジタルサイネージするページ
    - view.html#url.js でアクセスするとurl.jsの指示どおり画面表示する
    - demo [https://sktn3.github.io/SimpleDigitalSignage/view.html#url.js]("https://sktn3.github.io/SimpleDigitalSignage/view.html#url.js", "デモ")
- url.js
    - json形式で表示するURLとインターバル秒数（秒）を列挙
    - （正しくはjsonP形式。別のドメインにあるファイルでも指定可能）

