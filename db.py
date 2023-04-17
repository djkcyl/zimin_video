from peewee import (
    Model,
    SqliteDatabase,
    CharField,
    TextField,
    DateTimeField,
    ForeignKeyField,
    BooleanField,
    IntegrityError,
)
import re

# 创建SQLite数据库
db = SqliteDatabase("zimin.db")


# 定义系列表模型
class Series(Model):
    name = CharField()
    is_multi = BooleanField()
    desc = TextField()

    class Meta:
        database = db


# 定义视频表模型
class Video(Model):
    avid = CharField(unique=True)
    title = CharField()
    desc = TextField()
    pubdate = DateTimeField()
    cover = CharField()
    series = ForeignKeyField(Series, backref="videos", null=True)
    resolution = CharField()

    class Meta:
        database = db


# 连接到数据库并创建表
db.connect()
db.create_tables([Video, Series])


def insert_video(
    avid,
    title,
    desc,
    pubdate,
    cover,
    resolution,
    series=None,
):
    try:
        Video.create(
            avid=avid,
            title=title,
            desc=desc,
            pubdate=pubdate,
            cover=cover,
            series=series,
            resolution=resolution,
        )
        return True
    except IntegrityError:
        # avid 重复，插入失败
        return False


def search_videos_by_title(pattern) -> list[Video]:
    regex = re.compile(pattern, re.IGNORECASE)
    videos = Video.select().where(regex.search(Video.title))
    return list(videos)
