import sys
from pathlib import Path
from time import sleep

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_mistralai.chat_models import ChatMistralAI
from tqdm import tqdm


def main():
    """
    Script for creating summary of legal practice docs, using Mistral AI.

    Need 3 cmd params:
        1. str: MISTRAL_API_KEY
        2. int: left index of practice docs list
        3. int: right index of practice docs list
    """
    mistral_api_key, left_i, right_i = sys.argv[1:]
    left_i, right_i = int(left_i), int(right_i)

    with open("summary_prompt.txt") as f:
        summary_prompt = f.read()

    llm = ChatMistralAI(model_name="mistral-large-latest", api_key=mistral_api_key, timeout=60 * 3)
    prompt_1 = ChatPromptTemplate.from_messages(
        [
            ("system", summary_prompt),
            ("user", "{doc}"),
        ]
    )
    chain = prompt_1 | llm | StrOutputParser()

    docs_path = Path("data/practice_processed")
    docs_paths = list(docs_path.iterdir())

    summaries_path = Path("data/summaries/")
    summaries_path.mkdir(exist_ok=True)

    for doc_path in tqdm(docs_paths[left_i:right_i]):
        with open(doc_path, "r") as f:
            doc = f.read()

        while True:
            try:
                summary = chain.invoke({"doc": doc})
                break
            except Exception as e:
                print(e)
                sleep(5)

        with open(summaries_path / f"{doc_path.stem}.txt", "w") as f:
            f.write(summary)


if __name__ == "__main__":
    main()
