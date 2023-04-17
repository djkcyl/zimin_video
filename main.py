from fastapi import FastAPI, HTTPException, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import peewee
from playhouse.shortcuts import model_to_dict

app = FastAPI()

db = peewee.SqliteDatabase("zimin.db")

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


class Series(peewee.Model):
    name = peewee.CharField()
    is_multi = peewee.BooleanField()
    desc = peewee.TextField()

    class Meta:
        database = db


class Video(peewee.Model):
    avid = peewee.CharField(unique=True)
    title = peewee.CharField()
    desc = peewee.TextField()
    pubdate = peewee.DateTimeField()
    cover = peewee.CharField()
    series = peewee.ForeignKeyField(Series, backref="videos", null=True)
    resolution = peewee.CharField()

    class Meta:
        database = db


db.create_tables([Series, Video])


class SeriesSchema(BaseModel):
    id: Optional[int]
    name: str
    is_multi: bool
    desc: str


class VideoSchema(BaseModel):
    id: int
    avid: str
    title: str
    desc: str
    pubdate: datetime
    cover: str
    series: Optional[int] = None
    resolution: str


@app.get("/")
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/api/series/", response_model=List[SeriesSchema])
def get_series():
    return [{**model_to_dict(s)} for s in Series.select()]


@app.post("/api/series/", response_model=SeriesSchema)
def create_series(series: SeriesSchema):
    created_series = Series.create(**series.dict())
    return model_to_dict(created_series)


@app.post("/api/series/{series_id}/videos/")
def add_videos_to_series(series_id: int, video_ids: List[int]):
    updated_videos = Video.update(series=series_id).where(Video.id.in_(video_ids)).execute()
    return {"updated_videos": updated_videos}


@app.get("/api/series-covers/", response_model=List[str])
def get_series_covers():
    return [video.cover for video in Video.select().where(Video.series.is_null(False))]


@app.get("/api/unassigned-videos/")
def get_unassigned_videos(skip: int = 0, limit: int = 100, search: Optional[str] = None):
    query = Video.select().where(Video.series.is_null())
    if search:
        query = query.where(Video.title.contains(search))

    total_count = query.count()  # 获取未分配视频的总数

    # 添加分页
    query = query.offset(skip).limit(limit)

    videos = [{**model_to_dict(video), "pubdate": video.pubdate.isoformat()} for video in query]
    return {"videos": videos, "total_count": total_count}  # 在响应中添加视频总数


@app.post("/api/series/{series_id}/remove/")
def remove_series(series_id: int):
    # 将该系列的视频设置为未分配
    Video.update(series=None).where(Video.series == series_id).execute()

    # 删除系列
    Series.get(Series.id == series_id).delete_instance()

    return {"detail": "Series removed"}


@app.get("/api/series/{series_id}/video_count/")
def get_series_video_count(series_id: int):
    series = Series.get_or_none(Series.id == series_id)
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")

    video_count = series.videos.count()
    return {"video_count": video_count}


@app.on_event("shutdown")
def shutdown_event():
    db.close()
