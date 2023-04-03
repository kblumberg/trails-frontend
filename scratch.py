from shroomdk import ShroomDK

sdk = ShroomDK('')

address = '9VhsSZ6ni7dZtmKRHE81yAd3UQW1oKu9LNEWRGFMA5wj'

sql = 'SELECT DISTINCT tx_id FROM solana.core.fact_nft_sales WHERE block_timestamp >= CURRENT_DATE - 1 LIMIT 100'


# sql = '''
#     WITH t0 AS (
#         SELECT INITCAP(SPLIT(marketplace, ' ')[0]::string) AS program
#         , COUNT(1) AS n
#         FROM solana.core.fact_nft_sales
#         WHERE block_timestamp >= CURRENT_DATE - 180
#             AND (
#                 purchaser = '{}'
#                 OR seller = '{}'
#             )
#         GROUP BY 1
#         ORDER BY 2 DESC
#     ), t1 AS (
#         SELECT INITCAP(SPLIT(swap_program, ' ')[0]::string) AS program
#         , COUNT(1) AS n
#         FROM solana.core.fact_swaps
#         WHERE block_timestamp >= CURRENT_DATE - 180
#             AND swapper = '{}'
#         GROUP BY 1
#         ORDER BY 2 DESC
#     ), t2 AS (
#         SELECT *
#         FROM t0
#         UNION 
#         SELECT *
#         FROM t1
#     )
#     SELECT *
#     , LOG(2, n + 1) + 1 AS log_n
#     FROM t2
#     ORDER BY n DESC
# '''.format(address, address, address)

results = sdk.query(sql)