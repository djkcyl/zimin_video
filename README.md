# zimin_video

简单的爬虫，简单的后台

> 本项目前后端均由 **ChatGPT 4** 独立完成

### 运行
```
pip install fastapi peewee uvicorn bilireq
python -m uvicorn main:app --reload
```

然后打开 [http://127.0.0.1:8000](http://127.0.0.1:8000) 即可查看效果

## 项目路径

- 这是chatgpt给我写的第一版
![5(RU8XL%D5H4Y(I~}OFQ@26](https://user-images.githubusercontent.com/59153990/232398115-89f07460-813e-4556-af80-3a445128a2c8.jpg)

- 这是我手动prompt后的第二版
![JM$$D @Z9@1NR4 KUURR2YX_tmb](https://user-images.githubusercontent.com/59153990/232398166-edfd2497-00ee-4525-a350-0783af7e6039.jpg)

- 这是第三版，基本完成
![RS@G)8UER`A44`}9% 2`E8N](https://user-images.githubusercontent.com/59153990/232398191-b1ecce70-6526-446a-b7c8-d524651ccbfa.jpg)

- 这是第四版，换了我指定的css库
![R}B$EH }%TPUK_NGC DUE@G](https://user-images.githubusercontent.com/59153990/232398316-757d9fcc-69c8-4047-a187-8296636a829a.jpg)

## ChatGPT 使用小贴士

- 大概就是，第一次给需求的时候，尽量给足，往细了给，特别的你有什么，你要什么

- 然后如果第一次他给的结果可以跑起来，那就可以提更多更细的要求了，比如修改布局，改进功能之类的

- 不要让会话保持太多的垃圾，问两三次就可以直接重开会话，然后告诉他你现在有什么代码，例如这样

![W_RTG{P7 {2P$ZOG ~{@GL](https://user-images.githubusercontent.com/59153990/232398506-11ae2c03-e944-439c-9d13-286355efb619.jpg)

- 把你有的代码文件都告诉他，然后跟他说你需要什么功能，要从什么路径实现

- 如果他给的结果不合理，不要继续问，而是修改你的prompt再让他回答，不然会累计太多无用token

- 如果你觉得修改可能输出的内容太多，那就告诉他让他分开文件输出，比如你可以让他先输出某个文件

![ZEXPL 9~M_69F$ZFWKT1RP5](https://user-images.githubusercontent.com/59153990/232398532-40c1af60-88ee-414c-8192-6d6d6db637b4.jpg)

- 然后再让他输出剩下的文件

![7$20W`M_87R~V8KX6UO9AM8](https://user-images.githubusercontent.com/59153990/232398540-abe81afd-b6c4-4279-ac72-622657d781c8.jpg)

- 这样可以保证gpt4有足够高的可用度

