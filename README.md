# Databases pipeline

Описание пайплайна по созданию векторных БД, которые используются для ИИ-ассистента.

## Legal practices

БД с документами по судебным практикам. Взяты с сайта [sudact.ru](https://sudact.ru/) из раздела "Судебная практика".

С помощью [скриптов](/practices/parsing/) было скачено ~50k практик по административным, гражданским и уголовным делам.

Обработка документов (преобразование HTML в txt): [practice_preprocessing](/practices/practice_preprocessing.ipynb).

Затем была произведена суммаризация этих документов с помощью модели `mistral-large`. Скрипты находятся в [тут](/practices/summarization/).

Модель для расчета эмбеддингов: `deepvk/USER-bge-m3`. [Расчет эмбеддингов](/practices/calculate_embeddings.ipynb).

Инициализация векторной базы данных `ChromaDB`: [init_practice_collection](/practices/create_practice_collection.ipynb).

## Legal docs

БД с юридическими документами. Содержит [основные кодексы](/docs/codexes.json) и [основные законы](/docs/laws.json) РФ. Данные взяты с [sudact.ru](https://sudact.ru/law/?law-txt=&law-date_from=&law-date_to=).

[Анализ документов и их препроцессинг (разделение на чанки, обработка метаданных)](/docs/preprocessing.ipynb).

Модель для расчета эмбеддингов та же: `deepvk/USER-bge-m3`. [Расчет эмбеддингов](/docs/calculate_embeddings.ipynb).

Добавление коллекции с юридическими документами в векторную БД `ChromaDB`: [create_docs_collection](/docs/create_docs_collection.ipynb).

## Docker compose

В `docker-compose` для поднятия приложения монтируется 2 volume:

1. `/emb_model` - папка с моделью для создания эмбеддингов. Заранее загружена с помощью

    ```cmd
    mkdir emb_model &&
    cd emb_model &&
    git clone https://huggingface.co/deepvk/USER-bge-m3
    ```

2. `/storage` - папка с `ChromaDB collections`, в которых есть как коллекия с судебными практиками, так с юридическими документами
