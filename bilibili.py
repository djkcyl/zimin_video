import asyncio

from datetime import datetime
from loguru import logger
from grpc.aio._call import AioRpcError
from google.protobuf.json_format import MessageToJson
from bilireq.grpc.dynamic import grpc_get_user_dynamics
from bilireq.grpc.utils import grpc_request
from bilireq.grpc.protos.bilibili.app.view.v1.view_pb2_grpc import ViewStub
from bilireq.grpc.protos.bilibili.app.view.v1.view_pb2 import ViewReq, ViewReply
from bilireq.grpc.protos.bilibili.app.dynamic.v2.dynamic_pb2 import DynamicType

from db import insert_video


@grpc_request
async def grpc_get_view_info(aid: int = 0, bvid: str = "", **kwargs) -> ViewReply:
    stub = ViewStub(kwargs.pop("_channel"))
    for _ in range(3):
        try:
            if aid:
                req = ViewReq(aid=aid)
            elif bvid:
                req = ViewReq(bvid=bvid)
            else:
                raise ValueError("aid or bvid must be provided")
            return await stub.View(req, **kwargs)
        except AioRpcError:
            continue
    raise


async def main(update=False):
    has_more = True
    offset = ""
    while has_more:
        dyn = await grpc_get_user_dynamics(686127, offset=None if update else offset)
        dynlist = dyn.list[::-1] if update else dyn.list
        avlist = []
        for i in dynlist:
            if i.card_type == DynamicType.av:
                if i.modules[0].module_author.is_top:
                    continue

                for m in i.modules:
                    if avid := m.module_dynamic.dyn_archive.avid:
                        avlist.append(avid)
                        break
                else:
                    print(
                        MessageToJson(i, ensure_ascii=False, indent=4),
                        file=open("error.json", "w", encoding="utf-8"),
                    )
                    print(offset)
                    exit()

        try:
            av_infos = await asyncio.gather(*[grpc_get_view_info(aid=av) for av in avlist])
        except Exception as e:
            logger.exception(e)
            logger.info(f"offset: {offset}")
            exit()

        for av_info in av_infos:
            av_info: ViewReply
            print(
                MessageToJson(av_info, ensure_ascii=False, indent=4),
                file=open("error.json", "w", encoding="utf-8"),
            )
            pubdate = datetime.fromtimestamp(av_info.arc.pubdate)
            resoultion = f"{av_info.arc.dimension.width}x{av_info.arc.dimension.height}"
            if insert_video(
                avid=str(av_info.arc.aid),
                title=av_info.arc.title,
                desc=av_info.arc.desc,
                pubdate=pubdate,
                cover=av_info.arc.pic,
                resolution=resoultion,
            ):
                logger.info(f"{av_info.arc.aid} - {pubdate} - {resoultion} - {av_info.arc.title}")

        has_more = dyn.has_more
        offset = dyn.history_offset
        if update:
            break


if __name__ == "__main__":
    asyncio.run(main(True))
