import httpx

from youku_db import insert_youku_video


headers = {
    "referer": "https://www.youku.com/profile/index/?spm=a2h0c.8166622.PhoneSokuPgc_1.dportrait&uid=UNTU1Mzg3Mzk2",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.39",
    "cookie": "",
}

page = 1
next_session = ""

while True:
    data = {"type": "video", "pageNo": page, "uid": "UNTU1Mzg3Mzk2"}
    if next_session:
        data["nextSession"] = next_session
    req = httpx.get(
        "https://www.youku.com/profile/profile-data", headers=headers, params=data
    ).json()

    for v in req["data"]["componentList"][1 if page == 1 else 0]["moduleList"]:
        vid = v["data"]["videoId"]
        title = v["data"]["title"]
        pubdate = v["data"]["subTitle"]
        print(vid, pubdate, title)
        insert_youku_video(vid, title, pubdate)

    next_session = req["data"]["componentList"][1 if page == 1 else 0]["nextSession"]
    page += 1
    print(f"page: {page}")
