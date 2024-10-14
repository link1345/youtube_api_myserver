
# YoutubeAPI My Server

## これはなに？(What is this!?)

事前にYoutubeのAPIを叩くことで、動画の配信後・配信前・配信中・録画物をリストにして、WebAPIとして提供するプログラムです。

このプログラムを利用することで、自分のサイト上などで動画のリストを表示することが可能です。

YoutubeAPIを直接叩くと、API制限に引っかかるので、このようなものを用意する必要があります。

[ - english - ]

This program hits the YouTube API in advance to create a list of videos that are live, upcoming, or recorded, and serves it as a Web API.

With this program, you can display a list of videos on your own site and more!

Directly hitting the YouTube API can run into API limits, so having something like this is a must.

### 背景 (background)

「ぶいぎーく！のAPIサーバー(予定/未公認)」と銘打っていましたが、どのWebサイトにも利用できるじゃん…OSSにしよう…となったので、特に用途を制限しない方向にしました。

[ - english - ]

We initially branded it as the “ぶいぎーく！のAPIサーバー (Planned/Unofficial),” but then realized it could be used on any website… So, we decided to make it open-source and not restrict its use!

## Command

### install

```
pnpm install
```

### Dev start

```
pnpm dev
```

### build

```
pnpm build
```

### prepare

```
pnpm prepare
```

### preview

```
pnpm preview
```

## Setting

### server/profile.json

`server/profile.json`を下記の形に書き換えてください。

nameは、このprofile.jsonで一意的な名称にください。データベースでも使用します。

displayNameは、特にデータベースに関係ないので、ご自由にお使いください。

youtubeHandleは、Youtubeチャンネルの `https://www.youtube.com/@******` の `******` の部分を書きます。

[ - english - ]

Please rewrite `server/profile.json` in the following format:

name: Provide a unique name in this profile.json. This will also be used in the database.

displayName: Feel free to use any name here as it is not related to the database.

youtubeHandle: Write the part of the YouTube channel URL `https://www.youtube.com/@******` that corresponds to `******`.

```
{
    "members": [
        {
            "name": "unique ID",
            "displayName": "display Name",
            "youtubeHandle": "******"
        }
    ]
}
```

### Youtube API Key

`.env`ファイルを、プロジェクト直下に作り、その中に下記の形式で書いてください。


[ - english - ]

Please create a `.env` file in the root directory of your project and write it in the following format

```
NITRO_YOUTUBE_KEY="******************"
```

### 初回起動(Init Start)

初回起動時は、DBの設定やユーザーの登録、初回の動画取得処理が入ります。

` ---> Init Start!`と表記されたら初回起動処理が走っています。` <---Init End!`が、表示されるまで、プログラムを切らないでください。

[ - english - ]

During the initial startup, the database settings, user registration, and the initial video retrieval process will be performed.

When ` ---> Init Start!` is displayed, the initial startup process is running. Please do not turn off the program until ` <---Init End!` is displayed.

### API一覧( API list )

#### /api/member

設定ファイルに登録されているメンバーの一覧が見れます。

[ - english - ]

You can view the list of members registered in the configuration file.

#### /api/search

DBに登録されている動画一覧が見れます。

[ - english - ]

You can view the list of videos registered in the database.

#### /api/search?type=***

* video (録画)
* liveNow (ライブ中)
* liveBefore (ライブ前)
* liveAfter (ライブ後)

DBに登録されている動画のうち、特定のタイプの動画一覧が見れます。

[ - english - ]

You can view the list of specific types of videos registered in the database.


#### /api/search?name=***

DBに登録されている動画のうち、特定のメンバー(nameを指定)の動画一覧が見れます。

[ - english - ]

You can view the list of videos registered in the database for specific members (specify the name)

## Q&A

### Q. APIサーバーの起動ポートを変えたい (How can I change the startup port of the API server?)

`.env`ファイルに下記の通りに書いて、`****` を好きな番号にしてください。

[ - english - ]

Please write the following in the `.env` file and replace `****` with your preferred number.

```
PORT=****
```

### Q. 追加メンバーのYoutue動画更新されない (  )

動画一覧の取得は、12時間に1回行われます。

新規メンバーも、12時間に1回のタイミングで更新されます。

未ライブ、ライブ中の動画の取得は、1時間に1回行われます。

もし、強制的に更新したい場合は、server/plugins/hello.tsで下記の文のコメントアウトを外してください。

```
await runTask('youtube:search');
```

[ - english - ]

The list of videos is retrieved once every 12 hours.

New members are also updated every 12 hours.

Retrieval of videos that are not live or currently live occurs every hour.

If you want to force an update, please uncomment the following line in server/plugins/hello.ts.

### Q. 登録メンバーを削除したい (How can I delete registered members?)

現時点では、データベースからのメンバーの削除は実装されていません。

`server/profile.json`から削除された場合、新規に動画を取得しにいくことはありません。

※ 未配信や配信中は、除く。

[ - english - ]

At this time, the deletion of members from the database has not been implemented. If a member is deleted from server/profile.json, the program will not fetch new videos.

Note: This excludes videos that are not yet distributed or currently being distributed.


### Q. 削除された動画は、このプログラム上ではどう処理されるのか (How are deleted videos handled in this program?)

未配信や配信中の動画は、データベースから削除されますが、配信後や録画動画の場合、データベースから削除されません。

[ - english - ]

Videos that are not yet distributed or currently being distributed will be deleted from the database. However, videos that have already been distributed or recorded will not be deleted from the database.

