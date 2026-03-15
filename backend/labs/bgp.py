"""
BGP troubleshooting lab generator.

Topology:
                    AS 65001
  [R1]----(eth)----[R2]----(eth)----[R3]
   |                                  |
  eBGP                              eBGP
  [R4] AS 65002                  [R5] AS 65003

- R1, R2, R3 are in AS 65001 with iBGP full-mesh
- R4 peers eBGP with R1
- R5 peers eBGP with R3
- R2 is route reflector (optional faults around RR)

Faults injected (randomly selected up to fault_count):
  1. Wrong remote-as on R1 (eBGP peer to R4)
  2. Wrong neighbor IP on R2 (iBGP)
  3. Missing network statement on R4 (prefix not originated)
  4. BGP neighbour not activated in address-family on R3
  5. Wrong update-source on R2 (iBGP uses loopback)
  6. Missing ebgp-multihop on R1 (when loopback peering)
  7. next-hop-self missing on R1 (R4 routes not reachable inside AS)
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
router bgp 65001
 bgp router-id 1.1.1.1
 bgp log-neighbor-changes
 neighbor 2.2.2.2 remote-as 65001
 neighbor 2.2.2.2 update-source Loopback0
 neighbor 3.3.3.3 remote-as 65001
 neighbor 3.3.3.3 update-source Loopback0
 neighbor 10.0.14.2 remote-as 65002
 neighbor 10.0.14.2 next-hop-self
 !
 address-family ipv4
  neighbor 2.2.2.2 activate
  neighbor 3.3.3.3 activate
  neighbor 10.0.14.2 activate
 exit-address-family
!
ip route 2.2.2.2 255.255.255.255 10.0.12.2
ip route 3.3.3.3 255.255.255.255 10.0.12.2
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
router bgp 65001
 bgp router-id 2.2.2.2
 bgp log-neighbor-changes
 neighbor 1.1.1.1 remote-as 65001
 neighbor 1.1.1.1 update-source Loopback0
 neighbor 3.3.3.3 remote-as 65001
 neighbor 3.3.3.3 update-source Loopback0
 !
 address-family ipv4
  neighbor 1.1.1.1 activate
  neighbor 3.3.3.3 activate
 exit-address-family
!
ip route 1.1.1.1 255.255.255.255 10.0.12.1
ip route 3.3.3.3 255.255.255.255 10.0.23.2
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
router bgp 65001
 bgp router-id 3.3.3.3
 bgp log-neighbor-changes
 neighbor 1.1.1.1 remote-as 65001
 neighbor 1.1.1.1 update-source Loopback0
 neighbor 2.2.2.2 remote-as 65001
 neighbor 2.2.2.2 update-source Loopback0
 neighbor 10.0.35.2 remote-as 65003
 neighbor 10.0.35.2 next-hop-self
 !
 address-family ipv4
  neighbor 1.1.1.1 activate
  neighbor 2.2.2.2 activate
  neighbor 10.0.35.2 activate
 exit-address-family
!
ip route 1.1.1.1 255.255.255.255 10.0.23.1
ip route 2.2.2.2 255.255.255.255 10.0.23.1
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
router bgp 65002
 bgp router-id 4.4.4.4
 bgp log-neighbor-changes
 neighbor 10.0.14.1 remote-as 65001
 !
 address-family ipv4
  neighbor 10.0.14.1 activate
  network 4.4.4.4 mask 255.255.255.255
  network 10.0.14.0 mask 255.255.255.0
 exit-address-family
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
router bgp 65003
 bgp router-id 5.5.5.5
 bgp log-neighbor-changes
 neighbor 10.0.35.1 remote-as 65001
 !
 address-family ipv4
  neighbor 10.0.35.1 activate
  network 5.5.5.5 mask 255.255.255.255
  network 10.0.35.0 mask 255.255.255.0
 exit-address-family
!
end
"""

# ── fault injectors ───────────────────────────────────────────────────────────

def fault_wrong_remote_as(configs: dict) -> str:
    """R1 has wrong remote-as for eBGP peer R4 (65002 → 65099)."""
    configs["R1"] = configs["R1"].replace(
        "neighbor 10.0.14.2 remote-as 65002",
        "neighbor 10.0.14.2 remote-as 65099",
    )
    return "Wrong remote-as: R1 neighbor 10.0.14.2 remote-as 65099 (should be 65002)"


def fault_wrong_neighbor_ip(configs: dict) -> str:
    """R2 has wrong iBGP neighbor IP for R3 (3.3.3.3 → 3.3.3.9)."""
    configs["R2"] = configs["R2"].replace(
        "neighbor 3.3.3.3 remote-as 65001\n neighbor 3.3.3.3 update-source Loopback0",
        "neighbor 3.3.3.9 remote-as 65001\n neighbor 3.3.3.9 update-source Loopback0",
    ).replace(
        "  neighbor 3.3.3.3 activate",
        "  neighbor 3.3.3.9 activate",
    )
    return "Wrong neighbor IP: R2 iBGP neighbor 3.3.3.9 (should be 3.3.3.3 — R3 loopback)"


def fault_missing_network(configs: dict) -> str:
    """R4 is missing the network statement for its loopback."""
    configs["R4"] = configs["R4"].replace(
        "  network 4.4.4.4 mask 255.255.255.255\n",
        "",
    )
    return "Missing network statement: R4 loopback 4.4.4.4/32 not originated into BGP"


def fault_missing_activate(configs: dict) -> str:
    """R3 has eBGP neighbor missing from address-family activation."""
    configs["R3"] = configs["R3"].replace(
        "  neighbor 10.0.35.2 activate\n",
        "",
    )
    return "Missing activation: R3 neighbor 10.0.35.2 not activated in address-family ipv4"


def fault_wrong_update_source(configs: dict) -> str:
    """R2 uses Loopback0 as update-source but static route to R1 loopback is missing."""
    configs["R2"] = configs["R2"].replace(
        "ip route 1.1.1.1 255.255.255.255 10.0.12.1\n",
        "",
    )
    return "Missing static route: R2 has no route to 1.1.1.1 — iBGP session to R1 (loopback peer) will not establish"


def fault_missing_next_hop_self(configs: dict) -> str:
    """R1 is missing next-hop-self for eBGP peer — R4 prefixes unreachable inside AS."""
    configs["R1"] = configs["R1"].replace(
        " neighbor 10.0.14.2 next-hop-self\n",
        "",
    )
    return "Missing next-hop-self: R1 not setting next-hop-self for R4 — R4 prefixes will be unreachable to iBGP peers"


def fault_wrong_as_on_r5(configs: dict) -> str:
    """R3 thinks R5 is in AS 65099 instead of 65003."""
    configs["R3"] = configs["R3"].replace(
        "neighbor 10.0.35.2 remote-as 65003",
        "neighbor 10.0.35.2 remote-as 65099",
    )
    return "Wrong remote-as: R3 neighbor 10.0.35.2 remote-as 65099 (should be 65003)"


FAULTS = [
    fault_wrong_remote_as,
    fault_wrong_neighbor_ip,
    fault_missing_network,
    fault_missing_activate,
    fault_wrong_update_source,
    fault_missing_next_hop_self,
    fault_wrong_as_on_r5,
]

# ── lab builder ───────────────────────────────────────────────────────────────

def build_bgp_lab(fault_count: int = 2, seed: Optional[int] = None) -> Tuple[str, List[str], str]:
    """
    Build and start a BGP troubleshooting lab in CML.

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
    lab = client.create_lab(title=f"BGP-Troubleshoot-{int(time.time())}")

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
