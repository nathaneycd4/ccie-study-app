"""
OSPF troubleshooting lab generator.

Topology:
                      Area 0 (backbone)
  [R1]----(eth)----[R2]----(eth)----[R3]
   |                                  |
  Area 1                           Area 2
  [R4]                              [R5]

Faults injected (randomly selected up to fault_count):
  1. Mismatched OSPF area on a link
  2. Mismatched hello/dead timers
  3. Missing network statement
  4. OSPF MD5 auth mismatch
  5. Passive interface blocking adjacency
  6. Mismatched MTU (ip mtu)
  7. Wrong subnet mask in network statement
  8. OSPF process not redistributing connected (where expected)
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
router ospf 1
 router-id 1.1.1.1
 network 10.0.12.0 0.0.0.255 area 0
 network 10.0.14.0 0.0.0.255 area 1
 network 1.1.1.1 0.0.0.0 area 0
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
router ospf 1
 router-id 2.2.2.2
 network 10.0.12.0 0.0.0.255 area 0
 network 10.0.23.0 0.0.0.255 area 0
 network 2.2.2.2 0.0.0.0 area 0
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
router ospf 1
 router-id 3.3.3.3
 network 10.0.23.0 0.0.0.255 area 0
 network 10.0.35.0 0.0.0.255 area 2
 network 3.3.3.3 0.0.0.0 area 0
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
router ospf 1
 router-id 4.4.4.4
 network 10.0.14.0 0.0.0.255 area 1
 network 4.4.4.4 0.0.0.0 area 1
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
router ospf 1
 router-id 5.5.5.5
 network 10.0.35.0 0.0.0.255 area 2
 network 5.5.5.5 0.0.0.0 area 2
!
end
"""

# ── fault injectors ───────────────────────────────────────────────────────────

def fault_area_mismatch(configs: dict) -> str:
    """R2 advertises 10.0.12.0 into area 1 instead of area 0."""
    configs["R2"] = configs["R2"].replace(
        "network 10.0.12.0 0.0.0.255 area 0",
        "network 10.0.12.0 0.0.0.255 area 1",
    )
    return "Area mismatch: R1-R2 link (R2 side in wrong area)"


def fault_timer_mismatch(configs: dict) -> str:
    """R3 has non-default hello/dead timers on its R2-facing interface."""
    configs["R3"] = configs["R3"].replace(
        "interface Ethernet0/0\n ip address 10.0.23.2 255.255.255.0\n no shutdown",
        "interface Ethernet0/0\n ip address 10.0.23.2 255.255.255.0\n ip ospf hello-interval 20\n ip ospf dead-interval 80\n no shutdown",
    )
    return "Timer mismatch: R3 Gi0/0 hello=20/dead=80, R2 uses defaults (10/40)"


def fault_missing_network(configs: dict) -> str:
    """R4 is missing its loopback network statement."""
    configs["R4"] = configs["R4"].replace(
        " network 4.4.4.4 0.0.0.0 area 1\n",
        "",
    )
    return "Missing network statement: R4 loopback 4.4.4.4 not advertised"


def fault_auth_mismatch(configs: dict) -> str:
    """R1 enables MD5 auth on the R1-R2 link; R2 does not."""
    configs["R1"] = configs["R1"].replace(
        "interface Ethernet0/0\n ip address 10.0.12.1 255.255.255.0\n no shutdown",
        "interface Ethernet0/0\n ip address 10.0.12.1 255.255.255.0\n ip ospf authentication message-digest\n ip ospf message-digest-key 1 md5 CISCO123\n no shutdown",
    )
    return "Auth mismatch: R1 Gi0/0 has MD5 auth enabled, R2 does not"


def fault_passive_interface(configs: dict) -> str:
    """R2 marks its R3-facing interface as passive."""
    configs["R2"] = configs["R2"].replace(
        "router ospf 1\n router-id 2.2.2.2",
        "router ospf 1\n router-id 2.2.2.2\n passive-interface Ethernet0/1",
    )
    return "Passive interface: R2 Gi0/1 (toward R3) is passive — no adjacency R2-R3"


def fault_mtu_mismatch(configs: dict) -> str:
    """R5 has ip mtu 1400 on its uplink, R3 uses default 1500."""
    configs["R5"] = configs["R5"].replace(
        "interface Ethernet0/0\n ip address 10.0.35.2 255.255.255.0\n no shutdown",
        "interface Ethernet0/0\n ip address 10.0.35.2 255.255.255.0\n ip mtu 1400\n no shutdown",
    )
    return "MTU mismatch: R5 Gi0/0 ip mtu 1400, R3 uses default 1500 — DBD exchange will fail"


def fault_wrong_wildcard(configs: dict) -> str:
    """R1 uses wrong wildcard for area 1 network statement."""
    configs["R1"] = configs["R1"].replace(
        "network 10.0.14.0 0.0.0.255 area 1",
        "network 10.0.14.0 0.0.0.0 area 1",
    )
    return "Wrong wildcard: R1 'network 10.0.14.0 0.0.0.0 area 1' — won't match 10.0.14.1"


FAULTS = [
    fault_area_mismatch,
    fault_timer_mismatch,
    fault_missing_network,
    fault_auth_mismatch,
    fault_passive_interface,
    fault_mtu_mismatch,
    fault_wrong_wildcard,
]

# ── lab builder ───────────────────────────────────────────────────────────────

def build_ospf_lab(fault_count: int = 2, seed: Optional[int] = None) -> Tuple[str, List[str], str]:
    """
    Build and start an OSPF troubleshooting lab in CML.

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

    print("\n=== OSPF Troubleshooting Lab ===")
    print(f"Faults injected: {len(injected)}")
    print("\nTopology:")
    print("  Area 1     Area 0 (backbone)    Area 2")
    print("  [R4]--[R1]----------[R2]----------[R3]--[R5]")
    print("\nAddressing:")
    print("  R1-R2: 10.0.12.0/24   R2-R3: 10.0.23.0/24")
    print("  R1-R4: 10.0.14.0/24   R3-R5: 10.0.35.0/24")
    print("  Loopbacks: R1=1.1.1.1 R2=2.2.2.2 R3=3.3.3.3 R4=4.4.4.4 R5=5.5.5.5")
    print("\nSymptom: OSPF is not fully converged. Not all loopbacks are reachable.")
    print("Your task: Find and fix all issues.\n")

    client = get_client()
    lab = client.create_lab(title=f"OSPF-Troubleshoot-{int(time.time())}")

    # Create nodes
    nodes = {}
    positions = {
        "R1": (100, 200), "R2": (300, 200), "R3": (500, 200),
        "R4": (100, 400), "R5": (500, 400),
    }
    for name, (x, y) in positions.items():
        n = lab.create_node(label=name, node_definition="iol-xe", x=x, y=y)
        nodes[name] = n

    # Create interfaces then link them
    # R1 Gi0/0 <-> R2 Gi0/0  (area 0 backbone)
    lab.create_link(nodes["R1"].create_interface(), nodes["R2"].create_interface())
    # R2 Gi0/1 <-> R3 Gi0/0  (area 0 backbone)
    lab.create_link(nodes["R2"].create_interface(), nodes["R3"].create_interface())
    # R1 Gi0/1 <-> R4 Gi0/0  (area 1)
    lab.create_link(nodes["R1"].create_interface(), nodes["R4"].create_interface())
    # R3 Gi0/1 <-> R5 Gi0/0  (area 2)
    lab.create_link(nodes["R3"].create_interface(), nodes["R5"].create_interface())

    # Push configs
    for name, node in nodes.items():
        node.config = configs[name]

    # Start the lab
    print("Starting lab (this takes a few minutes for IOSv to boot)...")
    lab.start()

    cml_host = __import__("os").environ.get("CML_HOST", "192.168.137.10")
    cml_url = f"https://{cml_host}/#/labs/{lab.id}"

    print(f"Lab ID: {lab.id}")
    print(f"Lab URL: {cml_url}")

    # Print the answer key last (hidden behind a separator so you can avoid spoilers)
    print("\n" + "="*60)
    print("ANSWER KEY (scroll down only when done)")
    print("="*60)
    for i, fault in enumerate(injected, 1):
        print(f"  Fault {i}: {fault}")
    print("="*60 + "\n")

    return lab.id, injected, cml_url
