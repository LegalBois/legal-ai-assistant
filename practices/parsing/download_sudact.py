import os
import csv
import json
import requests
import time
from tqdm import tqdm
from fake_useragent import FakeUserAgent
from itertools import count, cycle, repeat
from concurrent.futures import ProcessPoolExecutor

import warnings
warnings.filterwarnings("ignore")


def ua_generator():
    ua = FakeUserAgent()
    while True:
        yield ua.random


def download_file(doc_id, proxy, user_agent):
    out_folder = '/mnt/88fdd009-dda3-49d8-9888-cfd9d9d5910a/ITMO/YEAR 2/INTRO_LLM/OUTPUT_PARSE'
    try:
        response = requests.get(f'https://sudact.ru/regular/doc/print/{doc_id}',
                                proxies={"http": proxy},
                                headers={"User-Agent": user_agent},
                                timeout=6,
                                verify=False)
        time.sleep(0.65)

        if response.status_code == 200:
            with open(os.path.join(out_folder, f'{doc_id}.html'), "wt", encoding='utf-8') as out_file:
                out_file.write(response.text)
            return None
        else:
            print(doc_id)
            return doc_id
    except Exception as ex:
        print((doc_id, ex))
        return doc_id


if __name__ == '__main__':
    with open('/mnt/88fdd009-dda3-49d8-9888-cfd9d9d5910a/ITMO/YEAR 2/INTRO_LLM/SUDACT_DATA_FULL.json',
              'rt', encoding='utf-8') as input:
        data = json.load(input)

    with open('/mnt/88fdd009-dda3-49d8-9888-cfd9d9d5910a/ITMO/YEAR 2/INTRO_LLM/PROJECT/proxies_new.csv') as f:
        proxies = [line[0] for line in csv.reader(f)]

    full_doc_list = [
        data_item["documents"]
        for data_item in data
    ]

    print('Started')

    all_res = []
    for chunk in tqdm(full_doc_list):
        with ProcessPoolExecutor(max_workers=10) as executor:
            res = list(tqdm(executor.map(download_file, chunk, cycle(proxies), ua_generator()), total=len(chunk)))
        all_res.extend(res)
    
    all_res = [item for item in all_res if item is not None]
    with open('bad_download_ids.json', 'wt', encoding='utf-8') as output:
        json.dump(all_res, output, ensure_ascii=False)
            
            
