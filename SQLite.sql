-- SQLite 倒序排列
CREATE TABLE Video_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  avid INT,
  title VARCHAR(255),
  "desc" VARCHAR(255),
  pubdate DATE,
  cover VARCHAR(255),
  series_id INT,
  resolution VARCHAR(255)
);

INSERT INTO Video_new (avid, title, "desc", pubdate, cover, series_id, resolution)
SELECT avid, title, "desc", pubdate, cover, series_id, resolution
FROM Video
ORDER BY id DESC;

DROP TABLE Video;

ALTER TABLE Video_new RENAME TO Video;