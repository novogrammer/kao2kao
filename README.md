# 顔 to 顔

WebRTCで3Dビデオチャットをする（予定）

## 環境構築

### .envの作成
自分のTURNサーバーを指定しておく
```
TURN_SERVER_URI="turn:example.com:3478"
TURN_SERVER_USER="user"
TURN_SERVER_PASSWORD="password"

```


### 開発環境
+ Mac（Intel）
+ Docker for Desktop（Docker Composeも入る）
+ nodenv


### 本番環境

#### インフラ
インターネットからアクセスできるLinuxサーバーを準備する（たとえばEC2 AmazonLinux2 t2.micro）<br>
以下のポートを開放する<br>
22 80 443 3000 3478/tcp 3478/udp 49160-49200/udp

#### ソフトウェア

+ Docker
+ Docker Compose
+ nginxによるリバースプロキシ
  + 80 -> 3000
+ certbotによるnginxのssl化
  + 443 -> 3000 が自動的に追加される


## 実行

### ビルド
```
$ docker-compose build
```

### 開始
```
$ docker-compose up -d
```

### 終了
```
$ docker-compose down
```

## デバッグ実行

### ビルド
```
$ ./docker-compose-develop.sh build
```

### 開始
```
$ ./docker-compose-develop.sh up -d
```

### 終了
```
$ ./docker-compose-develop.sh down
```

