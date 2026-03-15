"""
EIGRP troubleshooting lab generator.

Topology:
                      AS 100
  [R1]----(eth)----[R2]----(eth)----[R3]
   |                                  |
  [R4]                              [R5]

All routers in EIGRP AS 100.

Faults injected (randomly selected up to fault_count):
  1. Wrong EIGRP AS number on R2
  2. Passive interface on R1 toward R2
  3. Mismatched K-values on R3
  4. Wrong wildcard in network statement on R4
  5. Missing network statement on R5 loopback
  6. Distribute-list blocking routes on R2
  7. EIGRP neighbour authentication mismatch on R1-R2 link
"""

import random
import time
from typing import Optional, Tuple, List
from cml_client import get_client

# ── base configs ──────────────────────────────────────────────────────────────

BASE_R1 = """\
hostname R1
no ip domain-lookup
!
interface Ethernet0/0
 ip address 10.0.12.1 255.255.255.0
 no shutdown
!
interface Ethernet0/1
 ip address 10.0.14.1 255.255.255.0
 no shutdown
!
interface Loopback0
 ip address 1.1.1.1 255.255.255.255
!
router eigrp 100
 network 10.0.12.0 0.0.0.255
 network 10.0.14.0 0.0.0.255
 network 1.1.1.1 0.0.0.0
 no auto-summary
!
end
"""

BASE_R2 = """\
hostname R2
no ip domain-lookup
!
interface Ethernet0/0
 ip address 10.0.12.2 255.255.255.0
 no shutdown
!
interface Ethernet0/1
 ip address 10.0.23.1 255.255.255.0
 no shutdown
!
interface Loopback0
 ip address 2.2.2.2 255.255.255.255
!
router eigrp 100
 network 10.0.12.0 0.0.0.255
 network 10.0.23.0 0.0.0.255
 network 2.2.2.2 0.0.0.0
 no auto-summary
!
end
"""

BASE_R3 = """\
hostname R3
no ip domain-lookup
!
interface Ethernet0/0
 ip address 10.0.23.2 255.255.255.0
 no shutdown
!
interface Ethernet0/1
 ip address 10.0.35.1 255.255.255.0
 no shutdown
!
interface Loopback0
 ip address 3.3.3.3 255.255.255.255
!
router eigrp 100
 network 10.0.23.0 0.0.0.255
 network 10.0.35.0 0.0.0.255
 network 3.3.3.3 0.0.0.0
 no auto-summary
!
end
"""

BASE_R4 = """\
hostname R4
no ip domain-lookup
!
interface Ethernet0/0
 ip address 10.0.14.2 255.255.255.0
 no shutdown
!
interface Loopback0
 ip address 4.4.4.4 255.255.255.255
!
router eigrp 100
 network 10.0.14.0 0.0.0.255
 network 4.4.4.4 0.0.0.0
 no auto-summary
!
end
"""

BASE_R5 = """\
hostname R5
no ip domain-lookup
!
interface Ethernet0/0
 ip address 10.0.35.2 255.255.255.0
 no shutdown
!
interface Loopback0
 ip address 5.5.5.5 255.255.255.255
!
router eigrp 100
 network 10.0.35.0 0.0.0.255
 network 5.5.5.5 0.0.0.0
 no auto-summary
!
end
"""

# ── fault injectors ───────────────────────────────────────────────────────────

def fault_wrong_as(configs: dict) -> str:
    """R2 uses EIGRP AS 200 instead of 100."""
    configs["R2"] = configs["R2"].replace(
        "router eigrp 100",
        "router eigrp 200",
    )
    return "Wrong AS: R2 running EIGRP AS 200 (should be 100) — no adjacency with R1 or R3"


def fault_passive_interface(configs: dict) -> str:
    """R1 marks its R2-facing interface as passive."""
    configs["R1"] = configs["R1"].replace(
        "router eigrp 100\n network 10.0.12.0 0.0.0.255",
        "router eigrp 100\n passive-interface Ethernet0/0\n network 10.0.12.0 0.0.0.255",
    )
    return "Passive interface: R1 Ethernet0/0 (toward R2) is passive — no adjacency R1-R2"


def fault_k_value_mismatch(configs: dict) -> str:
    """R3 has non-default K-values (K2=1) — will not form adjacency."""
    configs["R3"] = configs["R3"].replace(
        "router eigrp 100\n network 10.0.23.0 0.0.0.255",
        "router eigrp 100\n metric weights 0 1 1 1 1 0\n network 10.0.23.0 0.0.0.255",
    )
    return "K-value mismatch: R3 metric weights 0 1 1 1 1 0 (K2=1, default is 0) — adjacency with R2 will fail"


def fault_wrong_wildcard(configs: dict) -> str:
    """R4 uses wrong wildcard for its loopback network statement."""
    configs["R4"] = configs["R4"].replace(
        " network 4.4.4.4 0.0.0.0",
        " network 4.4.4.4 0.0.0.255",
    )
    return "Wrong wildcard: R4 'network 4.4.4.4 0.0.0.255' — won't match 4.4.4.4/32 loopback"


def fault_missing_network(configs: dict) -> str:
    """R5 loopback missing from EIGRP network statement."""
    configs["R5"] = configs["R5"].replace(
        " network 5.5.5.5 0.0.0.0\n",
        "",
    )
    return "Missing network statement: R5 loopback 5.5.5.5 not advertised into EIGRP"


def fault_distribute_list(configs: dict) -> str:
    """R2 has a distribute-list blocking all outbound routes toward R3."""
    configs["R2"] = configs["R2"].replace(
        "router eigrp 100\n network 10.0.12.0 0.0.0.255",
        "router eigrp 100\n distribute-list 99 out Ethernet0/1\n network 10.0.12.0 0.0.0.255",
    )
    configs["R2"] += "\naccess-list 99 deny any\n"
    return "Distribute-list: R2 blocking all EIGRP routes outbound on Ethernet0/1 (toward R3)"


def fault_auth_mismatch(configs: dict) -> str:
    """R1 requires MD5 auth on R2-facing link; R2 does not."""
    configs["R1"] = configs["R1"].replace(
        "interface Ethernet0/0\n ip address 10.0.12.1 255.255.255.0\n no shutdown",
        "interface Ethernet0/0\n ip address 10.0.12.1 255.255.255.0\n ip authentication mode eigrp 100 md5\n ip authentication key-chain eigrp 100 EIGRP-KEY\n no shutdown",
    )
    configs["R1"] += "\nkey chain EIGRP-KEY\n key 1\n  key-string CISCO123\n"
    return "Auth mismatch: R1 Ethernet0/0 requires EIGRP MD5 auth (key: CISCO123), R2 has no auth configured"


FAULTS = [
    fault_wrong_as,
    fault_passive_interface,
    fault_k_value_mismatch,
    fault_wrong_wildcard,
    fault_missing_network,
    fault_distribute_list,
    fault_auth_mismatch,
]

# ── lab builder ───────────────────────────────────────────────────────────────

def build_eigrp_lab(fault_count: int = 2, seed: Optional[int] = None) -> Tuple[str, List[str], str]:
    """
    Build and start an EIGRP troubleshooting lab in CML.

    Returns:
        (cml_lab_id, injected_fault_descriptions, cml_url)
    """
    if seed is not None:
        random.seed(seed)

    configs = {
        "R1": BASE_R1,
        "R2": BASE_R2,
        "R3": BASE_R3,
        "R4": BASE_R4,
        "R5": BASE_R5,
    }

    chosen = random.sample(FAULTS, min(fault_count, len(FAULTS)))
    injected = [f(configs) for f in chosen]

    client = get_client()
    lab = client.create_lab(title=f"EIGRP-Troubleshoot-{int(time.time())}")

    nodes = {}
    positions = {
        "R1": (100, 200), "R2": (300, 200), "R3": (500, 200),
        "R4": (100, 400), "R5": (500, 400),
    }
    for name, (x, y) in positions.items():
        n = lab.create_node(label=name, node_definition="iol-xe", x=x, y=y)
        nodes[name] = n

    lab.create_link(nodes["R1"].create_interface(), nodes["R2"].create_interface())
    lab.create_link(nodes["R2"].create_interface(), nodes["R3"].create_interface())
    lab.create_link(nodes["R1"].create_interface(), nodes["R4"].create_interface())
    lab.create_link(nodes["R3"].create_interface(), nodes["R5"].create_interface())

    for name, node in nodes.items():
        node.config = configs[name]

    lab.start()

    cml_host = __import__("os").environ.get("CML_HOST", "192.168.137.10")
    cml_url = f"https://{cml_host}/#/labs/{lab.id}"

    return lab.id, injected, cml_url
