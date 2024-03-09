import asyncio
import base64

from pysui import SuiConfig, SuiRpcResult, AsyncClient
from pysui.sui.sui_txn import AsyncTransaction
from pysui.sui.sui_pgql.pgql_clients import AsyncSuiGQLClient
import pysui.sui.sui_pgql.pgql_query as qn
import pysui.sui.sui_pgql.pgql_types as ptypes

def handle_result(result: SuiRpcResult) -> SuiRpcResult:
    """."""
    if result.is_ok():
        if hasattr(result.result_data, "to_json"):
            print(result.result_data.to_json(indent=2))
        else:
            print(result.result_data)
    else:
        print(result.result_string)
        if result.result_data and hasattr(result.result_data, "to_json"):
            print(result.result_data.to_json(indent=2))
        else:
            print(result.result_data)
    return result

async def do_event(client: AsyncSuiGQLClient, package_id, package_name, event_name):
    """."""
    handle_result(
        await client.execute_query(
            with_query_node=qn.GetEvents(event_filter={"sender": "0x0"})
        )
    )

async def do_gas(client: AsyncSuiGQLClient):
    """Fetch 0x2::sui::SUI (default) for owner."""
    result = handle_result(
        await client.execute_query(
            # GetAllCoins defaults to "0x2::sui::SUI"
            with_query_node=qn.GetCoins(owner=client.config.active_address.address)
        )
    )
    if result.is_ok():
        print(
            f"Total coins in page: {len(result.result_data.data)} has more: {result.result_data.next_cursor.hasNextPage}"
        )

async def main():
    """."""
    print(dir(SuiConfig.default_config()))
    print(SuiConfig.default_config().rpc_url)
    client_init = AsyncSuiGQLClient(
        write_schema=False,
        config=SuiConfig.default_config(),
    )
    print(f"Schema version {client_init.schema_version}")
    ## QueryNodes (fetch)
    # await do_coin_meta(client_init)
    # await do_coins_for_type(client_init)
    await do_gas(client_init)
    # await do_sysstate(client_init)
    # await do_all_balances(client_init)
    # await do_object(client_init)
    # await do_objects(client_init)
    # await do_past_object(client_init)
    # await do_multiple_past_object(client_init)
    # await do_objects_for(client_init)
    # await do_dynamics(client_init)
    # await do_event(client_init)
    # await do_tx(client_init)
    # await do_txs(client_init)
    # await do_staked_sui(client_init)
    # await do_latest_cp(client_init)
    # await do_sequence_cp(client_init)
    # await do_digest_cp(client_init)
    # await do_checkpoints(client_init)
    # await do_owned_nameservice(client_init)
    # await do_nameservice(client_init)
    # await do_refgas(client_init)
    # await do_struct(client_init)
    # await do_structs(client_init)
    # await do_func(client_init)
    # await do_funcs(client_init)
    # await do_module(client_init)
    # await do_package(client_init)
    # await do_dry_run(client_init)
    # await do_execute(client_init)
    ## Config
    # await do_chain_id(client_init)
    # await do_configs(client_init)
    # await do_protcfg(client_init)
    await client_init.client.close_async()


if __name__ == "__main__":
    asyncio.run(main())