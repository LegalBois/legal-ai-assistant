# Databases pipeline

Описание пайплайна по созданию векторных БД, которые используются для ИИ-ассистента.

## Legal practices

БД с документами по судебным практикам. Взяты с сайта [sudact.ru](https://sudact.ru/) из раздела "Судебная практика".

С помощью [скриптов](/practices/parsing/) было скачено ~50k практик по административным, гражданским и уголовным делам.

Обработка документов (преобразование HTML в txt): [practice_preprocessing](/practices/practice_preprocessing.ipynb).

Затем была произведена суммаризация этих документов с помощью модели `mistral-large`. Скрипты находятся в [тут](/practices/summarization/).

Модель для расчета эмбеддингов: `deepvk/USER-bge-m3`. [Расчет эмбеддингов](/practices/calculate_embeddings.ipynb).

Инициализация векторной базы данных `ChromaDB`: [init_practice_collection](/practices/init_practice_collection.ipynb).

## Legal docs



## Docker compose

В `docker-compose` для поднятия приложения монтируется 2 volume:

1. `/emb_model` - папка с моделью для создания эмбеддингов. Заранее загружена с помощью

    ```cmd
    mkdir emb_model &&
    cd emb_model &&
    git clone https://huggingface.co/deepvk/USER-bge-m3
    ```

2. `/storage` - папка с `ChromaDB collections`, в которых есть как коллекия с судебными практиками, так с юридическими документами
