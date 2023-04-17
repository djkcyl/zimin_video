from peewee import Model, SqliteDatabase, CharField, DateTimeField, IntegrityError

# 创建一个名为 youku.db 的 SQLite 数据库
youku_db = SqliteDatabase("youku.db")


# 定义优酷视频模型类
class YoukuVideo(Model):
    vid = CharField(unique=True)
    title = CharField()
    pubdate = DateTimeField()

    class Meta:
        database = youku_db


# 连接到优酷数据库并创建表
youku_db.connect()
youku_db.create_tables([YoukuVideo])


def insert_youku_video(vid, title, pubdate):
    try:
        new_video = YoukuVideo.create(
            vid=vid, 
            title=title, 
            pubdate=pubdate
        )
        return True
    except IntegrityError:
        # vid 重复，插入失败
        return False