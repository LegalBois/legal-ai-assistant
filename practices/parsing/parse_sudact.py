import csv
import copy
import json
import aiohttp
import asyncio
from itertools import cycle
from bs4 import BeautifulSoup
from tqdm.asyncio import tqdm_asyncio
from fake_useragent import FakeUserAgent
from urllib.parse import urljoin, urlencode
from concurrent.futures import ProcessPoolExecutor
from aiohttp.client_exceptions import ClientHttpProxyError, ClientProxyConnectionError


def delete_empty_candidates(task_candidates_idx_list, pages_data: dict):
    indices_to_del = [i for i, (_, v) in enumerate(pages_data.items()) if v is None]    
    task_candidates_idx_list: list = copy.copy(task_candidates_idx_list)
    for i in sorted(indices_to_del, reverse=True):
        del task_candidates_idx_list[i]

    return task_candidates_idx_list


def get_subcategories(html: str, base_url: str) -> list[str]:
    soup = BeautifulSoup(html, 'html.parser')
    ul_element = soup.find('ul', class_='results d')
    child_elements = ul_element.find_all('li', class_='wos')

    results = []
    for element in child_elements:
        link = element.find('a')
        results.append({
            'url': urljoin(base_url, link['href']),
            'description': link.get_text()
        })

    return results


def get_page_items(html: str) -> dict[str, list[str]] | None:
    soup = BeautifulSoup(html, 'html.parser')
    main_div = soup.find('div', class_='h-col2-inner2')
    title = main_div.find('h1').get_text()
    if title == '404. Страница не найдена' or main_div.find('ul', class_='results') is None:
        return None
    else:
        description = title + '\n' + main_div.find('div', class_='info').get_text()
        item_container = main_div.find('ul', class_='results')
        items = item_container.find_all('li')

        results = []
        for item in items:
            link = item.find('a')
            # https://sudact.ru/regular/doc/print/{hash}
            hash = link['href'].split("/")[-2]
            results.append(hash)
        data = {
            'description': description,
            'urls': results
        }
        return data


async def fetch(
    url: str,
    proxy_url: str,
    user_agent: str,
    session: aiohttp.ClientSession,
    semaphore: asyncio.Semaphore,
    tags: str | tuple[str]
):
    headers = {
        'User-Agent': user_agent
    }
    try:
        async with semaphore:
            async with session.get(url, proxy=proxy_url, headers=headers) as response:
                result = await response.text()
            await asyncio.sleep(0.5)
    except ClientHttpProxyError as ex:
        result = f'{ex.status}. {ex.message}'
    except ClientProxyConnectionError as ex:
        result = str(ex.os_error)
    except Exception as ex:
        result = repr(ex)

    data = {
        'url': url,
        'tags': tags,
        'html': result
    }
    return data


async def fetch_all(url_list, tags_list, proxies, max_concurrent_requests):
    """ Returns list of:

        {
            `url`: url,
            `tags`: tags,
            `html`: result
        }
    """
    ua = FakeUserAgent()
    conn = aiohttp.TCPConnector(verify_ssl=False)
    semaphore = asyncio.Semaphore(max_concurrent_requests)
    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=6), connector=conn) as session:
        tasks = [fetch(url, proxy, ua.random, session, semaphore, tags)
                 for url, proxy, tags in zip(url_list, proxies, tags_list)]
        results = await tqdm_asyncio.gather(*tasks)
    return results


async def parse_page_items(proxies: cycle, all_data: list, max_concurrency: int, max_workers: int):
    task_candidates_idx_list = list(range(len(all_data)))

    current_page = 1
    while len(task_candidates_idx_list) != 0: # while task_candidates_idx
        print(f'Page: {current_page}, categories unfinished: {len(task_candidates_idx_list)}')
        url_list = [all_data[task_candidates_idx]['url']+ '?' + urlencode({'page': current_page})
                    for task_candidates_idx in task_candidates_idx_list if task_candidates_idx is not None]

        pages_raw_data = await fetch_all(url_list=url_list, tags_list=task_candidates_idx_list,
                                         proxies=proxies, max_concurrent_requests=max_concurrency)
        html_pages = [page_data['html'] for page_data in pages_raw_data]

        with ProcessPoolExecutor(max_workers=max_workers) as executor:
            pages_data = executor.map(get_page_items, html_pages)
        pages_data = {idx: data for idx, data in zip(task_candidates_idx_list, pages_data)}

        task_candidates_idx_list = delete_empty_candidates(task_candidates_idx_list, pages_data)
        for task_candidates_idx in task_candidates_idx_list:
            all_data[task_candidates_idx]['tags'][-1] = pages_data[task_candidates_idx]['description']
            all_data[task_candidates_idx]['documents'].extend(pages_data[task_candidates_idx]['urls'])

        current_page += 1
    print(f'Page: {current_page}, categories unfinished: {len(task_candidates_idx_list)}')

    return all_data


async def main(proxies):
    max_concurrent = len(proxies)
    categories_urls = [
        'https://sudact.ru/practice/sudebnaya-praktika-po-administrativnym-delam/',
        'https://sudact.ru/practice/sudebnaya-praktika-po-ugolovnym-delam/',
  
        'https://sudact.ru/practice/sudebnaya-praktika-po-trudovym-sporam/',
        'https://sudact.ru/practice/sudebnaya-praktika-po-semejnym-delam/',
        'https://sudact.ru/practice/sudebnaya-praktika-po-grazhdanskomu-kodeksu/',
        'https://sudact.ru/practice/sudebnaya-praktika-po-zhilishnym-sporam/',
        'https://sudact.ru/practice/sudebnaya-praktika-po-socialnomu-obespecheniyu/',
    ]
    categories_tags = [
        ['Административный кодекс'],
        ['Уголовный кодекс'],

        ['Гражданский кодекс', 'Судебная практика по трудовым спорам'],
        ['Гражданский кодекс', 'Судебная практика по семейным делам'],
        ['Гражданский кодекс', 'Судебная практика по Гражданскому кодексу'],
        ['Гражданский кодекс', 'Судебная практика по жилищным спорам и ЖКХ'],
        ['Гражданский кодекс', 'Судебная практика по социальному обеспечению']
    ]
    proxies = cycle(proxies)
    categories_data = await fetch_all(url_list=categories_urls, tags_list=categories_tags,
                                      proxies=proxies, max_concurrent_requests=max_concurrent)
    all_data = [] # [url, tags]
    for categ_item in categories_data:
        tags = categ_item['tags']
        subcategories_data = get_subcategories(categ_item['html'], categ_item['url']) # url, description
        all_data.extend([
            {
                'url': subcat_item['url'],
                'tags': [*tags, subcat_item['description'], None],
                'documents': []
            }
            for subcat_item in subcategories_data
        ])
    all_data = await parse_page_items(proxies, all_data, max_concurrent, 13)

    return all_data


if __name__ == "__main__":
    with open('/mnt/88fdd009-dda3-49d8-9888-cfd9d9d5910a/ITMO/YEAR 2/INTRO_LLM/PROJECT/proxies_new.csv') as f:
        reader = csv.reader(f)
        proxies = [line[0] for line in reader]

    res = asyncio.run(main(proxies))

    with open('SUDACT_DATA_FULL.json', 'wt', encoding='utf-8') as output:
        json.dump(res, output, ensure_ascii=False)
