import asyncio
import json
import websockets
from pysui.sui.sui_types.event_filter import MoveEventTypeQuery
from pysui.sui.sui_builders.get_builders import QueryEvents
from pysui.sui.sui_clients.sync_client import SuiClient
from pysui import SuiConfig
from pysui.sui.sui_pgql.pgql_fragments import SuiConfig

def get_all_pools(client, package_id, package_name, event_name) -> list[str]:
    """Get all deepbook pools"""

    response = client.execute(
        QueryEvents(
            query=MoveEventTypeQuery(f"{package_id}::{package_name}::{event_name}")
        )
    )

    return response._data.__dict__

if __name__ == "__main__":
    # base_url="wss://fullnode.mainnet.sui.io:443", timeout=3
    
    cfg = SuiConfig.default_config()
    client = SuiClient(cfg)
    print(client)

    package_id = "0x2fdff17b86e34ab722c8ba5e63f0da070d9a4163705b3fdc6a95802cab40a72a"
    package_name = "SupraSValueFeed"
    event_name = "SCCProcessedEvent"

    get_all_pools(client, package_id, package_name, event_name)


