"""
Seed script: CCIE EI quiz cards covering the full exam blueprint.
Run with: python seed_quiz_data.py
"""
import asyncio
import os
import sys
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(__file__))

from app.db import AsyncSessionLocal, create_tables
from app.models.models import QuizCard

CARDS = [
    # ── OSPF ─────────────────────────────────────────────────────────────────
    {
        "topic": "OSPF",
        "question": "What are the 5 OSPF packet types?",
        "answer": "1. Hello\n2. DBD (Database Description)\n3. LSR (Link-State Request)\n4. LSU (Link-State Update)\n5. LSAck (Link-State Acknowledgement)",
        "tags": ["ospf", "packets"],
    },
    {
        "topic": "OSPF",
        "question": "What are the default OSPF Hello and Dead timers on a broadcast vs NBMA network?",
        "answer": "Broadcast/Point-to-point: Hello 10s, Dead 40s\nNBMA: Hello 30s, Dead 120s\n\nTimers must match for adjacency to form.",
        "tags": ["ospf", "timers", "adjacency"],
    },
    {
        "topic": "OSPF",
        "question": "What conditions must match for two OSPF routers to become neighbours?",
        "answer": "1. Same Area ID\n2. Same subnet/mask\n3. Same Hello and Dead timers\n4. Authentication type and key (if configured)\n5. Same MTU (for full adjacency — EXSTART/EXCHANGE stall if mismatched)\n6. Stub flags must match\n7. Same process-ID is NOT required",
        "tags": ["ospf", "adjacency"],
    },
    {
        "topic": "OSPF",
        "question": "What causes OSPF to remain in EXSTART/EXCHANGE state?",
        "answer": "MTU mismatch between neighbours. The DBD exchange fails because one side's packets exceed the other's MTU.\n\nFix: match MTU on both interfaces, or apply 'ip ospf mtu-ignore' (hides the mismatch but doesn't fix it).",
        "tags": ["ospf", "troubleshooting", "adjacency"],
    },
    {
        "topic": "OSPF",
        "question": "What is the OSPF DR/BDR election process?",
        "answer": "On multi-access (broadcast/NBMA) segments only.\n\nElection:\n1. Highest OSPF priority (default 1, range 0-255). Priority 0 = ineligible.\n2. Tiebreak: highest Router ID.\n\nNon-preemptive: a new higher-priority router will NOT displace an existing DR until it fails.",
        "tags": ["ospf", "dr-bdr", "election"],
    },
    {
        "topic": "OSPF",
        "question": "What does 'ip ospf network point-to-point' do on an Ethernet interface?",
        "answer": "Disables DR/BDR election and treats the link as point-to-point. Both routers form a FULL adjacency directly without DR/BDR.\n\nBenefit: faster convergence, no waiting for DR/BDR timers. Both sides must have the same network type.",
        "tags": ["ospf", "network-type", "configuration"],
    },
    {
        "topic": "OSPF",
        "question": "What causes OSPF to remain in 2-WAY state instead of FULL?",
        "answer": "Normal for DROther-to-DROther relationships on broadcast segments.\n\nDROther routers only form FULL adjacency with the DR and BDR. 2-WAY with other DROthers is correct behaviour, not a fault.",
        "tags": ["ospf", "adjacency", "dr-bdr"],
    },
    {
        "topic": "OSPF",
        "question": "What are all OSPF LSA types and what does each describe?",
        "answer": "Type 1 – Router LSA: every router, links within area.\nType 2 – Network LSA: DR, multi-access segment.\nType 3 – Summary LSA: ABR, inter-area prefixes.\nType 4 – ASBR Summary: ABR, location of ASBR.\nType 5 – AS External: ASBR, external routes (flooded everywhere except stubs).\nType 7 – NSSA External: ASBR inside NSSA, converted to Type 5 at ABR.",
        "tags": ["ospf", "lsa"],
    },
    {
        "topic": "OSPF",
        "question": "What is the purpose of OSPF Area 0 and what is a virtual link?",
        "answer": "Area 0 is the backbone — all inter-area routing must transit it. Every non-backbone area must connect to Area 0.\n\nVirtual link: logical tunnel through a transit area to reconnect a discontiguous area to Area 0.\nConfig (on both ABRs): area <transit-area> virtual-link <remote-ABR-router-id>",
        "tags": ["ospf", "areas", "virtual-link", "design"],
    },
    {
        "topic": "OSPF",
        "question": "What are the OSPF area types and which LSA types does each block?",
        "answer": "Stub: blocks Type 4, 5. ABR injects default route.\nTotally Stubby (Cisco): blocks Type 3, 4, 5. Only default from ABR.\nNSSA: blocks Type 5; allows Type 7 from local ASBR.\nTotally NSSA (Cisco): blocks Type 3, 4, 5; allows Type 7; default from ABR.",
        "tags": ["ospf", "stub-area", "nssa", "lsa"],
    },
    {
        "topic": "OSPF",
        "question": "What is the OSPF router-id selection order?",
        "answer": "1. Manually configured: router-id x.x.x.x\n2. Highest loopback interface IP\n3. Highest active physical interface IP\n\nChange takes effect only after: clear ip ospf process (or reload).",
        "tags": ["ospf", "router-id", "configuration"],
    },
    {
        "topic": "OSPF",
        "question": "How is OSPF cost calculated and how do you fix it for high-speed links?",
        "answer": "Cost = Reference BW / Interface BW\nDefault reference = 100 Mbps → GigabitEthernet = cost 1 (same as FastEthernet — wrong!)\n\nFix: auto-cost reference-bandwidth 10000 (for 10G networks)\nMust be consistent across ALL routers in the area.",
        "tags": ["ospf", "metric", "cost"],
    },
    {
        "topic": "OSPF",
        "question": "How do you configure OSPF MD5 authentication on an interface?",
        "answer": "interface GigabitEthernet0/0\n ip ospf authentication message-digest\n ip ospf message-digest-key 1 md5 <PASSWORD>\n\nArea-level alternative:\nrouter ospf 1\n area 0 authentication message-digest",
        "tags": ["ospf", "authentication", "security"],
    },
    {
        "topic": "OSPF",
        "question": "Where is OSPF summarisation configured and what commands are used?",
        "answer": "Inter-area (on ABR):\n area <id> range <network> <mask>\n\nExternal (on ASBR):\n summary-address <network> <mask>\n\nSummarisation reduces LSA flooding and routing table size. Creates a Null0 discard route locally.",
        "tags": ["ospf", "summarization", "design"],
    },
    {
        "topic": "OSPF",
        "question": "What show commands verify OSPF neighbours, database, and routes?",
        "answer": "show ip ospf neighbor — adjacency states\nshow ip ospf database — all LSAs\nshow ip ospf database router — Type 1\nshow ip ospf database network — Type 2\nshow ip ospf database external — Type 5\nshow ip route ospf — OSPF routes in RIB\ndebug ip ospf adj — adjacency events",
        "tags": ["ospf", "verification"],
    },
    # ── BGP ──────────────────────────────────────────────────────────────────
    {
        "topic": "BGP",
        "question": "What are the BGP neighbour states in order?",
        "answer": "1. Idle\n2. Connect\n3. Active\n4. OpenSent\n5. OpenConfirm\n6. Established\n\nMemory aid: I Can Always Order Extra Espresso",
        "tags": ["bgp", "states"],
    },
    {
        "topic": "BGP",
        "question": "What is the difference between eBGP and iBGP?",
        "answer": "eBGP: between different AS numbers, TTL=1 (direct link required), sets next-hop to self.\niBGP: same AS, TTL=255, preserves eBGP next-hop, requires full mesh or RR/Confederation.",
        "tags": ["bgp", "ebgp", "ibgp"],
    },
    {
        "topic": "BGP",
        "question": "Why does iBGP require a full mesh and how is this solved?",
        "answer": "BGP split-horizon: iBGP routes learned from one peer cannot be advertised to another iBGP peer.\n\nSolutions:\n- Route Reflector (RR): RR re-advertises client routes. Simpler, most common.\n- Confederations: splits AS into sub-ASes with eBGP between them. More complex.",
        "tags": ["bgp", "ibgp", "full-mesh", "route-reflector"],
    },
    {
        "topic": "BGP",
        "question": "What is the complete BGP best-path selection order?",
        "answer": "1. Highest Weight (Cisco local)\n2. Highest Local Preference\n3. Locally originated\n4. Shortest AS-PATH\n5. Lowest Origin (IGP < EGP < Incomplete)\n6. Lowest MED\n7. eBGP over iBGP\n8. Lowest IGP metric to next-hop\n9. Oldest eBGP route\n10. Lowest Router ID\n11. Lowest Cluster List length\n12. Lowest neighbour IP\n\nMnemonic: We Love Oranges AS Oranges Mean Pure Refreshment",
        "tags": ["bgp", "best-path", "attributes"],
    },
    {
        "topic": "BGP",
        "question": "What does 'neighbor X next-hop-self' do and when is it needed?",
        "answer": "Forces the router to advertise itself as the next-hop for iBGP updates, replacing the original eBGP next-hop.\n\nNeeded when eBGP next-hop IPs are not reachable inside the AS (e.g., peering on public IPs that aren't redistributed into the IGP).",
        "tags": ["bgp", "next-hop", "ibgp"],
    },
    {
        "topic": "BGP",
        "question": "What causes BGP to be stuck in ACTIVE state?",
        "answer": "Cannot establish TCP session to peer on port 179.\n\nCheck:\n- IP reachability (ping peer IP)\n- ACL blocking TCP/179\n- Correct neighbor IP and update-source\n- ebgp-multihop if not directly connected\n- Firewall or NAT interference",
        "tags": ["bgp", "troubleshooting", "adjacency"],
    },
    {
        "topic": "BGP",
        "question": "How do you influence inbound vs outbound BGP traffic?",
        "answer": "Outbound (traffic leaving your AS — influence remote AS's choice):\n- AS-PATH prepending (longer path = less preferred)\n- MED (lower = preferred, advisory only)\n\nInbound (traffic entering your AS — your own preference):\n- Local Preference (higher = preferred, iBGP scope)\n- Weight (higher = preferred, Cisco-local, not advertised)",
        "tags": ["bgp", "traffic-engineering", "attributes"],
    },
    {
        "topic": "BGP",
        "question": "What is the BGP community attribute and what are the well-known communities?",
        "answer": "32-bit tag for grouping routes and applying policy. Sent as optional transitive attribute.\n\nWell-known:\n- no-export (0xFFFFFF01): don't advertise to eBGP peers\n- no-advertise (0xFFFFFF02): don't advertise to any peer\n- local-AS (0xFFFFFF03): don't send outside confederation sub-AS\n\nEnable with: neighbor X send-community",
        "tags": ["bgp", "community", "policy"],
    },
    {
        "topic": "BGP",
        "question": "What is BGP soft reset and why is it needed?",
        "answer": "Applies updated route-maps/policy without resetting the TCP session (which would cause a routing disruption).\n\nOutbound: clear ip bgp X soft out — re-sends our updates with new policy\nInbound: clear ip bgp X soft in — requires Route Refresh capability (RFC 2918), asks peer to re-send updates",
        "tags": ["bgp", "soft-reset", "policy"],
    },
    {
        "topic": "BGP",
        "question": "What is eBGP multihop and when is it required?",
        "answer": "eBGP normally requires directly connected peers (TTL=1). ebgp-multihop N raises the TTL to allow peering over multiple hops.\n\nRequired for loopback-to-loopback eBGP peering:\nneighbor X ebgp-multihop 2\nneighbor X update-source Loopback0\n\nAlso add a route to the peer's loopback.",
        "tags": ["bgp", "ebgp-multihop", "configuration"],
    },
    {
        "topic": "BGP",
        "question": "How do you advertise a prefix in BGP and what are the methods?",
        "answer": "1. network statement: network X.X.X.X mask Y.Y.Y.Y\n   — prefix must exist in RIB (exact match)\n2. Redistribution: redistribute ospf/eigrp/connected\n3. Aggregation: aggregate-address X.X.X.X Y.Y.Y.Y [summary-only]",
        "tags": ["bgp", "advertisement", "configuration"],
    },
    {
        "topic": "BGP",
        "question": "What is a BGP Route Reflector and what are the reflection rules?",
        "answer": "Breaks the iBGP full-mesh requirement.\n\nReflection rules:\n- Route from RR client → reflected to all clients and non-client iBGP peers\n- Route from non-client iBGP → reflected to clients only\n- Route from eBGP → sent to all iBGP peers\n\nLoop prevention: Originator-ID and Cluster-List attributes.",
        "tags": ["bgp", "route-reflector", "scalability"],
    },
    # ── EIGRP ─────────────────────────────────────────────────────────────────
    {
        "topic": "EIGRP",
        "question": "What are EIGRP K-values and their defaults?",
        "answer": "K1=1 (Bandwidth), K2=0 (Load), K3=1 (Delay), K4=0 (Reliability), K5=0\n\nDefault metric uses only bandwidth and delay:\nMetric = 256 × (10^7/min-BW + sum-delay/10)\n\nK-values must match between EIGRP neighbours or adjacency will not form.",
        "tags": ["eigrp", "metric", "k-values"],
    },
    {
        "topic": "EIGRP",
        "question": "What is the EIGRP Feasibility Condition and why does it matter?",
        "answer": "FC: Reported Distance (RD) of a neighbour's path < local Feasible Distance (FD)\n\nA route meeting the FC is a Feasible Successor — guaranteed loop-free backup.\nIf the successor fails, the FS is promoted instantly without running DUAL queries.\n\nIf no FS exists, EIGRP goes Active and sends Queries to all neighbours.",
        "tags": ["eigrp", "feasibility-condition", "dual"],
    },
    {
        "topic": "EIGRP",
        "question": "What causes EIGRP Stuck in Active (SIA) and how do you prevent it?",
        "answer": "SIA: router sends Query but doesn't receive Reply within Active Timer (default 3 minutes). Resets the neighbour that didn't reply.\n\nPrevention:\n- EIGRP stub: stub routers don't propagate queries\n- Summarisation: limits query propagation scope\n- Tune active-time: timers active-time <minutes>",
        "tags": ["eigrp", "sia", "troubleshooting"],
    },
    {
        "topic": "EIGRP",
        "question": "What is EIGRP variance and how does unequal-cost load balancing work?",
        "answer": "variance N: installs routes with FD ≤ N × successor FD into the routing table.\n\nTraffic is load-balanced proportionally (inversely to metric).\nDefault variance=1 = equal-cost only.\n\nRoute must also meet the Feasibility Condition to be eligible.",
        "tags": ["eigrp", "variance", "load-balancing"],
    },
    {
        "topic": "EIGRP",
        "question": "What is EIGRP stub routing and when should you use it?",
        "answer": "Stub router: only advertises specified route types (connected, summary, static, redistributed).\nHub will NOT send Queries to stub routers.\n\nUse on spoke/branch routers in hub-and-spoke topologies to:\n- Prevent SIA\n- Reduce query scope\n- Save CPU/bandwidth\n\nConfig: eigrp stub connected summary",
        "tags": ["eigrp", "stub", "design"],
    },
    {
        "topic": "EIGRP",
        "question": "What are the EIGRP neighbour requirements?",
        "answer": "1. Same AS number\n2. Same K-values\n3. Authentication match (if configured)\n4. Reachable via Hello (multicast 224.0.0.10 or unicast)\n\nNote: Unlike OSPF, Hello/Hold timers do NOT need to match.",
        "tags": ["eigrp", "adjacency"],
    },
    {
        "topic": "EIGRP",
        "question": "How do you configure EIGRP summarisation and what side effect does it have?",
        "answer": "Per-interface (classic mode):\n ip summary-address eigrp <AS> <network> <mask>\n\nEffect: suppresses component routes, advertises only the summary.\nSide effect: creates a local Null0 discard route to prevent routing loops.",
        "tags": ["eigrp", "summarization", "configuration"],
    },
    {
        "topic": "EIGRP",
        "question": "What is EIGRP named mode and what are its advantages over classic mode?",
        "answer": "router eigrp <NAME>\n address-family ipv4 unicast autonomous-system <X>\n\nAdvantages:\n- Supports IPv4 and IPv6 in one process\n- Per-interface parameters under af-interface\n- Centrally manages all settings\n- Required for some advanced features (e.g. wide metrics)\n- Recommended for all new deployments",
        "tags": ["eigrp", "named-mode", "configuration"],
    },
    # ── Spanning Tree ─────────────────────────────────────────────────────────
    {
        "topic": "Spanning Tree",
        "question": "What is the STP port role/state election order?",
        "answer": "To determine which port is the best:\n1. Lowest Root Bridge ID (priority + MAC)\n2. Lowest Root Path Cost to root\n3. Lowest Sender Bridge ID\n4. Lowest Sender Port ID (priority + port number)\n\nApplied in order at each decision point.",
        "tags": ["stp", "election"],
    },
    {
        "topic": "Spanning Tree",
        "question": "What are the 802.1D STP port states and timers?",
        "answer": "States (in order): Blocking → Listening → Learning → Forwarding (+ Disabled)\n\nTimers:\n- Hello: 2s\n- Forward Delay: 15s (Listening + Learning = 30s total)\n- Max Age: 20s\n\nTotal convergence from topology change ≈ 50 seconds.",
        "tags": ["stp", "timers", "states"],
    },
    {
        "topic": "Spanning Tree",
        "question": "What is the difference between PVST+, RSTP (802.1w), and MST (802.1s)?",
        "answer": "PVST+: Cisco per-VLAN STP based on 802.1D. One instance per VLAN. ~50s convergence.\n\nRSTP (802.1w): rapid convergence (~1-2s). New port roles: Alternate (blocked backup to root), Backup (backup to designated). Edge ports skip negotiation.\n\nRPVST+: Cisco RSTP per VLAN.\n\nMST (802.1s): maps multiple VLANs to fewer instances. CIST + internal instances. Most scalable.",
        "tags": ["stp", "variants", "rstp", "mst"],
    },
    {
        "topic": "Spanning Tree",
        "question": "What do PortFast, BPDU Guard, Root Guard, and Loop Guard do?",
        "answer": "PortFast: bypasses Listening/Learning, immediate Forwarding. Access ports only. Also enables RSTP edge port.\n\nBPDU Guard: err-disables port if BPDU received. Pair with PortFast.\n\nRoot Guard: prevents port from becoming Root Port. Puts port in root-inconsistent if superior BPDU received.\n\nLoop Guard: prevents Alternate/Backup port from becoming Designated if BPDUs stop (prevents unidirectional link loops).",
        "tags": ["stp", "protection", "portfast"],
    },
    {
        "topic": "Spanning Tree",
        "question": "How do you set STP root bridge priority and what is the default?",
        "answer": "Default priority: 32768 (+ VLAN ID with PVST+)\n\nSet primary root: spanning-tree vlan X root primary\n  — sets priority to 24576 (or lower if needed)\n\nSet manually: spanning-tree vlan X priority <0-61440 in multiples of 4096>\n\nLowest priority wins Root Bridge election.",
        "tags": ["stp", "root-bridge", "configuration"],
    },
    # ── VLANs & Switching ─────────────────────────────────────────────────────
    {
        "topic": "VLANs",
        "question": "What is 802.1Q trunking and what is the native VLAN?",
        "answer": "802.1Q inserts a 4-byte tag into the Ethernet frame: TPID (0x8100) + TCI (PCP 3 bits, DEI 1 bit, VLAN ID 12 bits).\n\nNative VLAN: traffic on this VLAN is NOT tagged on the trunk. Default is VLAN 1.\n\nSecurity: change native VLAN to unused VLAN and tag it explicitly to prevent double-tagging VLAN hopping:\n switchport trunk native vlan <unused>\n vlan dot1q tag native",
        "tags": ["vlan", "trunking", "8021q"],
    },
    {
        "topic": "VLANs",
        "question": "What are VTP modes and what is the VTP revision number risk?",
        "answer": "Server: creates/modifies/deletes VLANs, advertises, syncs.\nClient: syncs from server, cannot modify.\nTransparent: forwards VTP but uses local VLAN DB only.\nOff (VTPv3): doesn't participate.\n\nRisk: a switch with HIGHER revision number overwrites the VLAN DB when connected.\nFix before adding a switch: reset revision by changing VTP domain name twice, or set to Transparent mode.",
        "tags": ["vlan", "vtp"],
    },
    {
        "topic": "VLANs",
        "question": "What is EtherChannel and what are the negotiation protocols?",
        "answer": "EtherChannel bundles multiple physical links into one logical link.\n\nPAgP (Cisco): Auto (passive), Desirable (active)\nLACP (802.3ad): Passive, Active\n\nRules:\n- Same speed, duplex, VLAN config on all member ports\n- Port-channel interface inherits config of member ports\n- STP sees one logical link (no loops, faster convergence)",
        "tags": ["vlan", "etherchannel", "lacp"],
    },
    # ── QoS ───────────────────────────────────────────────────────────────────
    {
        "topic": "QoS",
        "question": "What are the 3 QoS models?",
        "answer": "Best Effort: no QoS, all packets equal. Default.\n\nIntServ: per-flow reservation with RSVP. Guarantees bandwidth but doesn't scale beyond small networks.\n\nDiffServ: marks packets with DSCP at network edge, applies PHB (Per-Hop Behaviour) at each node. Scalable — industry standard.",
        "tags": ["qos", "models"],
    },
    {
        "topic": "QoS",
        "question": "What DSCP values map to common traffic classes?",
        "answer": "EF (46): voice bearer — strict priority queue\nCS5 (40): voice signalling\nAF41 (34): interactive video\nAF31 (26): call signalling\nCS3 (24): network management\nAF11 (10): bulk data\nBE/CS0 (0): default/best-effort\n\nAF format: AFxy → DSCP = 8x + 2y\nDrop probability: AF_1 < AF_2 < AF_3",
        "tags": ["qos", "dscp", "marking"],
    },
    {
        "topic": "QoS",
        "question": "What is the difference between policing and shaping?",
        "answer": "Policing: drops or re-marks traffic exceeding the configured rate. Applied inbound or outbound. No buffering — instant action. Hard rate limit.\n\nShaping: buffers excess traffic and delays it to conform to the rate. Outbound only. Smooths bursts — better for TCP but adds latency/jitter.\n\nUse shaping toward SP to match their policer and avoid tail-drop.",
        "tags": ["qos", "policing", "shaping"],
    },
    {
        "topic": "QoS",
        "question": "What are the MQC (Modular QoS CLI) building blocks?",
        "answer": "1. class-map: matches traffic (match dscp, match protocol, match access-group)\n2. policy-map: applies actions to matched classes (set dscp, police, shape, bandwidth, priority, queue-limit)\n3. service-policy: attaches policy-map to interface (input or output)\n\nHierarchical policies: child policy-map nested inside parent for per-class shaping.",
        "tags": ["qos", "mqc", "configuration"],
    },
    # ── MPLS ──────────────────────────────────────────────────────────────────
    {
        "topic": "MPLS",
        "question": "How does MPLS label switching work?",
        "answer": "MPLS inserts a 32-bit label between L2 and L3 (shim header): Label (20b), TC/EXP (3b, maps to QoS), S/BoS (1b), TTL (8b).\n\nLabel operations:\n- Ingress PE: PUSH label\n- P router: SWAP label\n- Penultimate P: POP label (PHP — Penultimate Hop Popping)\n- Egress PE: IP lookup and forward\n\nPHP reduces one lookup at the egress PE.",
        "tags": ["mpls", "labels", "lsp"],
    },
    {
        "topic": "MPLS",
        "question": "What is the difference between RD and RT in MPLS L3VPN?",
        "answer": "RD (Route Distinguisher): 64-bit prefix prepended to customer IPv4 prefix to create a unique VPNv4 address. Prevents overlap between customers in the PE VPNv4 table. Does NOT control import/export.\n\nRT (Route Target): BGP extended community that controls VRF import/export policy:\n- export: tag routes leaving the VRF\n- import: accept routes with matching RT into VRF\n\nRT determines VPN topology (full-mesh, hub-spoke, extranet).",
        "tags": ["mpls", "l3vpn", "rd", "rt"],
    },
    # ── SD-WAN ────────────────────────────────────────────────────────────────
    {
        "topic": "SD-WAN",
        "question": "What are the 4 planes in Cisco SD-WAN (Viptela) architecture?",
        "answer": "Management – vManage: centralised GUI/REST API for config, monitoring, policy.\n\nControl – vSmart: distributes routing info and policies via OMP. No user traffic passes through it.\n\nOrchestration – vBond: authenticates and onboards WAN Edge devices, facilitates NAT traversal.\n\nData – WAN Edge (vEdge/cEdge): forwards user traffic, builds IPsec data-plane tunnels, runs BFD for path quality.",
        "tags": ["sdwan", "architecture"],
    },
    {
        "topic": "SD-WAN",
        "question": "What is OMP and what route types does it carry?",
        "answer": "OMP (Overlay Management Protocol): SD-WAN control plane between vSmart and WAN Edges. Runs over DTLS/TLS.\n\nRoute types:\n- OMP routes: prefixes reachable behind each site (service-side)\n- TLOC routes: Transport Location — identifies WAN transport endpoint (System-IP + colour + encap)\n- Service routes: VPN services available at a site\n- Policies: data/control policies pushed from vManage via vSmart",
        "tags": ["sdwan", "omp", "control-plane"],
    },
    {
        "topic": "SD-WAN",
        "question": "What is a TLOC and how does it relate to data-plane tunnels?",
        "answer": "TLOC (Transport Location): uniquely identifies a WAN transport endpoint.\nComponents: System-IP + Colour + Encapsulation (IPsec or GRE)\n\nColour labels transport type: mpls, biz-internet, lte, private1, etc.\n\nTLOC routes exchanged via OMP. IPsec data-plane tunnels built between TLOCs. BFD probes run per-tunnel to measure loss, latency, jitter for application-aware routing.",
        "tags": ["sdwan", "tloc", "data-plane"],
    },
    {
        "topic": "SD-WAN",
        "question": "What is Application-Aware Routing (AAR) in SD-WAN?",
        "answer": "AAR selects the best WAN transport path for each application based on real-time SLA metrics measured by BFD:\n- Loss\n- Latency\n- Jitter\n\nConfig: define SLA class (thresholds), match application with data policy, prefer path meeting SLA.\n\nIf preferred path degrades below SLA, traffic automatically fails over to secondary transport.",
        "tags": ["sdwan", "aar", "sla"],
    },
    # ── SD-Access ─────────────────────────────────────────────────────────────
    {
        "topic": "SD-Access",
        "question": "What are the 3 planes in Cisco SD-Access fabric?",
        "answer": "Control Plane – LISP: maps endpoint identity (EID = IP/MAC) to location (RLOC = fabric node IP). Map-Server/Map-Resolver role.\n\nData Plane – VXLAN: encapsulates traffic between fabric nodes. Carries SGT and Virtual Network info in the header.\n\nPolicy Plane – TrustSec (SGT): Scalable Group Tags assigned at ingress, enforced via SGACL throughout the fabric.",
        "tags": ["sdaccess", "fabric", "lisp", "vxlan"],
    },
    {
        "topic": "SD-Access",
        "question": "What are the SD-Access fabric node roles?",
        "answer": "Fabric Edge: connects wired/wireless endpoints. Registers EIDs. Performs VXLAN encap/decap at ingress/egress.\n\nFabric Border: connects fabric to external networks (WAN, DC, internet, traditional campus). Translates between fabric and non-fabric domains.\n\nFabric Control Plane Node: runs LISP Map-Server/Map-Resolver. Stores EID-to-RLOC mappings.\n\nWLC (as Fabric AP border): handles wireless client mobility within the fabric.",
        "tags": ["sdaccess", "roles", "edge", "border"],
    },
    {
        "topic": "SD-Access",
        "question": "What is a Virtual Network (VN) in SD-Access and how does it relate to VRF?",
        "answer": "Virtual Network (VN) provides macro-segmentation in SD-Access — equivalent to a VRF in traditional networking.\n\nEach VN:\n- Has its own VXLAN VNI (L3 VNI for routing, L2 VNI per segment)\n- Mapped to a VRF on fabric nodes\n- Provides traffic isolation between groups (e.g. Corp VN vs Guest VN)\n\nMicro-segmentation within a VN is provided by SGTs/SGACLs.",
        "tags": ["sdaccess", "vn", "vrf", "segmentation"],
    },
    # ── Security ──────────────────────────────────────────────────────────────
    {
        "topic": "Security",
        "question": "What is 802.1X and what are the three roles?",
        "answer": "Port-based Network Access Control (PNAC).\n\nRoles:\n- Supplicant: endpoint requesting access (EAP client)\n- Authenticator: switch/WLC controlling port access, relays EAP over RADIUS\n- Authentication Server: RADIUS (Cisco ISE) validates identity\n\nCommon EAP methods:\n- EAP-TLS: mutual certificate auth (most secure)\n- PEAP-MSCHAPv2: username/password with server cert\n- EAP-FAST: Cisco, uses PAC instead of cert",
        "tags": ["security", "8021x", "nac"],
    },
    {
        "topic": "Security",
        "question": "What is Cisco TrustSec and how do SGTs work end-to-end?",
        "answer": "TrustSec provides policy-based access using Scalable Group Tags (SGT).\n\nFlow:\n1. Endpoint authenticates via 802.1X/MAB → ISE assigns SGT\n2. SGT propagated in-band (802.1AE MACsec tag) or out-of-band (SXP)\n3. Enforcing device (switch, FW, router) applies SGACL: source-SGT → destination-SGT = permit/deny\n\nBenefit: policy decoupled from IP/VLAN. Works across SD-Access fabric natively.",
        "tags": ["security", "trustsec", "sgt"],
    },
    {
        "topic": "Security",
        "question": "What is the difference between ZBFW and classic IOS ACL-based firewall?",
        "answer": "ACL-based (CBAC): stateful inspection per interface with ip inspect. Older, less flexible.\n\nZone-Based Firewall (ZBFW):\n- Interfaces assigned to zones (e.g. INSIDE, OUTSIDE, DMZ)\n- Policy applied between zone-pairs using MQC (class-map → policy-map → zone-pair service-policy)\n- Self zone: traffic to/from router itself\n- Default: traffic between zones is DENY unless explicit policy permits\n- Stateful: return traffic automatically permitted",
        "tags": ["security", "zbfw", "firewall"],
    },
    # ── Network Assurance ─────────────────────────────────────────────────────
    {
        "topic": "Network Assurance",
        "question": "What is the difference between SNMPv2c and SNMPv3?",
        "answer": "SNMPv2c:\n- Community string (cleartext) for authentication\n- GetBulk for efficient MIB walks\n- No encryption\n\nSNMPv3 security levels:\n- noAuthNoPriv: username only\n- authNoPriv: HMAC-MD5 or HMAC-SHA\n- authPriv: auth + AES-128/AES-256 encryption\n\nSNMPv3 required for PCI-DSS, HIPAA, and any secure environment.",
        "tags": ["assurance", "snmp"],
    },
    {
        "topic": "Network Assurance",
        "question": "What is NetFlow and what information does it collect?",
        "answer": "NetFlow captures per-flow statistics exported to a collector.\n\nA flow is defined by 7-tuple:\n- Source/Destination IP\n- Source/Destination Port\n- Protocol\n- Input interface\n- ToS/DSCP\n\nVersions: v5 (fixed format), v9 (flexible templates), IPFIX (v10, RFC standard)\n\nUses: traffic analysis, capacity planning, security anomaly detection, billing.",
        "tags": ["assurance", "netflow", "telemetry"],
    },
    {
        "topic": "Network Assurance",
        "question": "What is streaming telemetry and how does it differ from SNMP polling?",
        "answer": "SNMP polling: manager requests data on a schedule (pull). High overhead, misses transient events between polls.\n\nStreaming telemetry (push): device sends data continuously at configured interval or on-change. Uses:\n- gRPC/gNMI (most common)\n- NETCONF over SSH\n- gNMI Subscribe (SAMPLE or ON_CHANGE)\n\nAdvantages: sub-second granularity, lower CPU on device, scalable to thousands of metrics.",
        "tags": ["assurance", "telemetry", "grpc"],
    },
    # ── Automation ────────────────────────────────────────────────────────────
    {
        "topic": "Automation",
        "question": "What is the difference between NETCONF, RESTCONF, and gRPC/gNMI?",
        "answer": "NETCONF (RFC 6241): XML + YANG over SSH. RPC operations: get, get-config, edit-config, commit. Candidate/running/startup datastores. Port 830.\n\nRESTCONF (RFC 8040): REST API over HTTPS. YANG data as JSON or XML. Stateless. Subset of NETCONF functionality. Port 443.\n\ngRPC/gNMI: binary (protobuf) over HTTP/2. High-frequency streaming telemetry. Get/Set/Subscribe. Port 57400.",
        "tags": ["automation", "netconf", "restconf", "gnmi"],
    },
    {
        "topic": "Automation",
        "question": "What is YANG and what are its key constructs?",
        "answer": "YANG (RFC 6020/7950): data modelling language for network config and state.\n\nKey constructs:\n- module: top-level namespace\n- container: groups related nodes (no key)\n- list: repeated elements with a key leaf\n- leaf: single typed value\n- leaf-list: list of typed values\n- typedef: custom reusable type\n- grouping/uses: reusable blocks\n- rpc: remote procedure call\n- notification: async event\n\nModel sources: OpenConfig, Cisco-IOS-XE-*, IETF",
        "tags": ["automation", "yang"],
    },
    {
        "topic": "Automation",
        "question": "What is Ansible and how does it manage network devices without an agent?",
        "answer": "Ansible: agentless automation using YAML playbooks.\n\nFor network devices:\n- Connects via SSH (network_cli) or HTTP API (httpapi)\n- Modules: cisco.ios.ios_command, ios_config, ios_facts, cisco.nxos.*, etc.\n- Playbooks: tasks applied against inventory groups\n- Idempotent: running twice = same result\n\nKey concepts:\n- inventory: defines hosts/groups\n- vars: host/group variables\n- roles: reusable playbook structure\n- jinja2 templates: generate configs",
        "tags": ["automation", "ansible"],
    },
    {
        "topic": "Automation",
        "question": "What is the difference between imperative and declarative network automation?",
        "answer": "Imperative: describes HOW to achieve the desired state — step-by-step commands.\nExample: send 'interface Gi0/0' then 'ip address X' then 'no shutdown'\nTools: scripts, CLI automation, Ansible ios_command\n\nDeclarative: describes WHAT the desired end state should be — system figures out how.\nExample: 'ensure Gi0/0 has IP X and is up'\nTools: Ansible ios_config (idempotent), NETCONF edit-config, Terraform, NSO\n\nDeclarative is preferred for large-scale consistent deployments.",
        "tags": ["automation", "declarative", "imperative"],
    },
    # ── IP Services ───────────────────────────────────────────────────────────
    {
        "topic": "IP Services",
        "question": "What is the difference between HSRP, VRRP, and GLBP?",
        "answer": "HSRP (Cisco): Active + Standby. Virtual MAC: 0000.0c07.acXX. Preemption off by default.\n\nVRRP (RFC 5798): Master + Backups. Virtual MAC: 0000.5e00.01XX. Preemption on by default. IP address owner can be Master (real IP = VIP).\n\nGLBP (Cisco): one AVG assigns multiple AVFs — all gateways actively forward. Load balancing across all routers. Unique to GLBP.",
        "tags": ["ip-services", "fhrp", "hsrp", "vrrp", "glbp"],
    },
    {
        "topic": "IP Services",
        "question": "What is IP SLA and how is it used with object tracking?",
        "answer": "IP SLA generates synthetic test traffic to measure network performance.\n\nCommon operations: icmp-echo, udp-jitter, http, tcp-connect, dns\n\nWith Object Tracking:\nip sla 1\n icmp-echo 8.8.8.8\n frequency 10\nip sla schedule 1 life forever start-time now\n\ntrack 1 ip sla 1 reachability\n\nip route 0.0.0.0 0.0.0.0 10.0.0.1 track 1  ← floating static",
        "tags": ["ip-services", "ipsla", "tracking"],
    },
    {
        "topic": "IP Services",
        "question": "What is NAT overload (PAT) and how does it work?",
        "answer": "PAT maps many inside local IP:port pairs to one inside global IP using unique source ports.\n\nTranslation table: inside-local IP:port ↔ inside-global IP:port\n\nConfig:\nip nat inside source list <ACL> interface <outside> overload\n\nSupports ~65,000 sessions per public IP.\nProtocols embedding IP in payload (FTP, SIP, H.323) require ALG (Application Layer Gateway).",
        "tags": ["ip-services", "nat", "pat"],
    },
    # ── Wireless ──────────────────────────────────────────────────────────────
    {
        "topic": "Wireless",
        "question": "What are the key differences between Wi-Fi 5 (802.11ac) and Wi-Fi 6 (802.11ax)?",
        "answer": "Wi-Fi 5 (802.11ac):\n- 5 GHz only\n- MU-MIMO downlink only (max 8 streams)\n- 160 MHz channels, 256-QAM\n- Max ~3.5 Gbps\n\nWi-Fi 6 (802.11ax):\n- 2.4 + 5 GHz (Wi-Fi 6E adds 6 GHz)\n- MU-MIMO uplink and downlink\n- OFDMA: splits channel into RUs for multiple clients simultaneously\n- BSS Colouring: reduces co-channel interference\n- TWT: improves IoT battery life\n- 1024-QAM, max ~9.6 Gbps",
        "tags": ["wireless", "80211ax", "wifi6"],
    },
    {
        "topic": "Wireless",
        "question": "What are the Cisco AP modes: Local, FlexConnect, and Fabric?",
        "answer": "Local mode: all client traffic tunnelled to WLC via CAPWAP. Centralised forwarding. Default.\n\nFlexConnect: AP can locally switch traffic even when WLC is unreachable (standalone mode). Used in branch offices. Supports local auth.\n\nFabric (SD-Access): AP is a fabric edge node. Client traffic VXLAN-encapsulated to WLC acting as fabric-mode WLC. SGT assigned at association. Requires DNA Center.",
        "tags": ["wireless", "ap-modes", "flexconnect"],
    },
    {
        "topic": "Wireless",
        "question": "What is the difference between CAPWAP and LWAPP?",
        "answer": "LWAPP (Lightweight Access Point Protocol): Cisco-proprietary predecessor to CAPWAP.\n\nCAPWAP (RFC 5415): standards-based replacement. Two UDP channels:\n- Control channel (UDP 5246): management, config, stats\n- Data channel (UDP 5247): client data traffic\n\nCAPWAP uses DTLS for control channel encryption. Data channel encryption optional.\n\nCisco migrated from LWAPP to CAPWAP with WLC 5.x / IOS-XE WLC.",
        "tags": ["wireless", "capwap", "lwapp"],
    },
]


async def seed():
    await create_tables()

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, func
        count_result = await session.execute(select(func.count(QuizCard.id)))
        count = count_result.scalar()

        if count and count > 0:
            print(f"Database already has {count} cards. Skipping seed.")
            return

        session.add_all([QuizCard(**c) for c in CARDS])
        await session.commit()

        topics: dict[str, int] = {}
        for c in CARDS:
            topics[c["topic"]] = topics.get(c["topic"], 0) + 1

        print(f"Seeded {len(CARDS)} quiz cards:")
        for topic, n in sorted(topics.items()):
            print(f"  {topic}: {n}")


if __name__ == "__main__":
    asyncio.run(seed())
