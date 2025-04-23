# Структура .json-файла для загрузки задач
## В файле должен быть представлен массив объектов (задач), имеющих следующие свойства:
```
id: number,
title: string,
description: string,
date: CalendarDate,
isCompleted: boolean
```
## Например,
```
[
    {
        "title": "Interview",
        "description": "",
        "date": "2025-04-20",
        "id": 1745430622908,
        "isCompleted": false
    }
]
```
