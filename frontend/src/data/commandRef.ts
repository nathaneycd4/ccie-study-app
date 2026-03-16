export interface CommandGroup {
  label: string
  commands: { cmd: string; desc: string }[]
}

export const COMMAND_REF: Record<string, CommandGroup[]> = {
  OSPF: [
    {
      label: 'Verification',
      commands: [
        { cmd: 'show ip ospf neighbor', desc: 'Adjacencies + state' },
        { cmd: 'show ip ospf neighbor detail', desc: 'Full detail incl. dead timer' },
        { cmd: 'show ip ospf interface brief', desc: 'Cost, state, DR/BDR per interface' },
        { cmd: 'show ip ospf database', desc: 'LSDB summary' },
        { cmd: 'show ip ospf database router', desc: 'Type 1 LSAs' },
        { cmd: 'show ip ospf database network', desc: 'Type 2 LSAs' },
        { cmd: 'show ip ospf database summary', desc: 'Type 3 LSAs (inter-area)' },
        { cmd: 'show ip route ospf', desc: 'OSPF routes in RIB' },
        { cmd: 'show ip ospf border-routers', desc: 'ABR/ASBR locations' },
      ],
    },
    {
      label: 'Debug',
      commands: [
        { cmd: 'debug ip ospf adj', desc: 'Adjacency formation events' },
        { cmd: 'debug ip ospf hello', desc: 'Hello packet exchange' },
        { cmd: 'debug ip ospf events', desc: 'General OSPF events' },
      ],
    },
  ],
  BGP: [
    {
      label: 'Verification',
      commands: [
        { cmd: 'show ip bgp summary', desc: 'All peers + state / prefix count' },
        { cmd: 'show ip bgp neighbors', desc: 'Detailed neighbor info' },
        { cmd: 'show ip bgp', desc: 'Full BGP table' },
        { cmd: 'show ip bgp [prefix]', desc: 'Best path + attributes for prefix' },
        { cmd: 'show ip route bgp', desc: 'BGP routes installed in RIB' },
        { cmd: 'show ip bgp neighbors [ip] routes', desc: 'Routes received from peer' },
        { cmd: 'show ip bgp neighbors [ip] advertised-routes', desc: 'Routes sent to peer' },
      ],
    },
    {
      label: 'Operations',
      commands: [
        { cmd: 'clear ip bgp * soft', desc: 'Soft reset all peers (no session drop)' },
        { cmd: 'clear ip bgp [ip] soft in', desc: 'Re-process inbound from peer' },
        { cmd: 'clear ip bgp [ip] soft out', desc: 'Re-advertise outbound to peer' },
      ],
    },
  ],
  EIGRP: [
    {
      label: 'Verification',
      commands: [
        { cmd: 'show ip eigrp neighbors', desc: 'Neighbor table + hold timer' },
        { cmd: 'show ip eigrp topology', desc: 'Topology table — FD, RD, successors' },
        { cmd: 'show ip eigrp topology all-links', desc: 'All routes incl. non-feasible' },
        { cmd: 'show ip eigrp interfaces', desc: 'EIGRP-enabled interfaces' },
        { cmd: 'show ip route eigrp', desc: 'EIGRP routes in RIB' },
        { cmd: 'show ip eigrp traffic', desc: 'Packet counters (hellos, updates, queries)' },
      ],
    },
    {
      label: 'Debug',
      commands: [
        { cmd: 'debug ip eigrp', desc: 'Updates / queries / replies' },
        { cmd: 'debug ip eigrp neighbor', desc: 'Neighbor events' },
      ],
    },
  ],
  'Spanning Tree': [
    {
      label: 'Verification',
      commands: [
        { cmd: 'show spanning-tree', desc: 'STP state across all VLANs' },
        { cmd: 'show spanning-tree vlan [x]', desc: 'STP state for specific VLAN' },
        { cmd: 'show spanning-tree summary', desc: 'Mode, port counts, root status' },
        { cmd: 'show spanning-tree blockedports', desc: 'Currently blocked ports' },
        { cmd: 'show spanning-tree detail', desc: 'Port timers, cost, transitions' },
        { cmd: 'show spanning-tree inconsistentports', desc: 'Ports in inconsistent state' },
      ],
    },
    {
      label: 'Debug',
      commands: [
        { cmd: 'debug spanning-tree events', desc: 'Topology change events' },
      ],
    },
  ],
  MPLS: [
    {
      label: 'Verification',
      commands: [
        { cmd: 'show mpls ldp neighbor', desc: 'LDP sessions + state' },
        { cmd: 'show mpls ldp bindings', desc: 'Label bindings (LIB)' },
        { cmd: 'show mpls forwarding-table', desc: 'LFIB — incoming/outgoing labels' },
        { cmd: 'show mpls ldp discovery', desc: 'LDP hello discovery' },
        { cmd: 'show ip cef [prefix]', desc: 'CEF adjacency for prefix' },
      ],
    },
  ],
  QoS: [
    {
      label: 'Verification',
      commands: [
        { cmd: 'show policy-map interface [int]', desc: 'Applied policy stats — drops, rate' },
        { cmd: 'show policy-map', desc: 'Policy-map definitions' },
        { cmd: 'show class-map', desc: 'Class-map match criteria' },
        { cmd: 'show mls qos interface [int]', desc: 'QoS trust state on interface' },
      ],
    },
  ],
  VLANs: [
    {
      label: 'Verification',
      commands: [
        { cmd: 'show vlan brief', desc: 'VLAN IDs + assigned ports' },
        { cmd: 'show interfaces trunk', desc: 'Trunk ports + allowed/active VLANs' },
        { cmd: 'show interfaces [int] switchport', desc: 'Access/trunk mode + native VLAN' },
        { cmd: 'show vtp status', desc: 'VTP mode, domain, revision number' },
      ],
    },
  ],
  'SD-WAN': [
    {
      label: 'Verification',
      commands: [
        { cmd: 'show sdwan control connections', desc: 'Control plane to vSmart/vBond' },
        { cmd: 'show sdwan bfd sessions', desc: 'BFD sessions to tunnel endpoints' },
        { cmd: 'show sdwan omp peers', desc: 'OMP peer sessions' },
        { cmd: 'show sdwan omp routes', desc: 'OMP route table' },
        { cmd: 'show sdwan policy from-vsmart', desc: 'Policy pushed from vSmart' },
        { cmd: 'show sdwan tunnel statistics', desc: 'Tunnel loss, latency, jitter' },
      ],
    },
  ],
  'SD-Access': [
    {
      label: 'Verification',
      commands: [
        { cmd: 'show lisp site', desc: 'LISP site registrations (control plane)' },
        { cmd: 'show lisp instance-id [id] ipv4', desc: 'LISP EID database per VN' },
        { cmd: 'show vxlan', desc: 'VXLAN tunnel info' },
        { cmd: 'show ip route lisp', desc: 'LISP routes in RIB' },
      ],
    },
  ],
  Automation: [
    {
      label: 'NETCONF / RESTCONF',
      commands: [
        { cmd: 'show platform software yang-management process', desc: 'YANG daemon status' },
        { cmd: 'show netconf-yang sessions', desc: 'Active NETCONF sessions' },
      ],
    },
    {
      label: 'EEM',
      commands: [
        { cmd: 'show event manager policy registered', desc: 'Registered EEM applets' },
        { cmd: 'show event manager history events', desc: 'EEM event history' },
      ],
    },
  ],
  'Network Assurance': [
    {
      label: 'Verification',
      commands: [
        { cmd: 'show ip sla summary', desc: 'IP SLA probe results summary' },
        { cmd: 'show ip sla statistics', desc: 'IP SLA detailed stats' },
        { cmd: 'show track', desc: 'Object tracking state' },
        { cmd: 'show logging', desc: 'Syslog buffer' },
        { cmd: 'show snmp', desc: 'SNMP stats + community info' },
      ],
    },
  ],
  Security: [
    {
      label: 'Verification',
      commands: [
        { cmd: 'show ip access-lists', desc: 'ACL entries + match counters' },
        { cmd: 'show crypto isakmp sa', desc: 'IKEv1 phase 1 SAs' },
        { cmd: 'show crypto ipsec sa', desc: 'IPsec phase 2 SAs + stats' },
        { cmd: 'show crypto ikev2 sa', desc: 'IKEv2 SAs' },
        { cmd: 'show aaa servers', desc: 'AAA server status' },
      ],
    },
  ],
  Wireless: [
    {
      label: 'Verification',
      commands: [
        { cmd: 'show ap summary', desc: 'AP join status + mode' },
        { cmd: 'show client summary', desc: 'Associated wireless clients' },
        { cmd: 'show wlan summary', desc: 'WLAN profiles + state' },
        { cmd: 'show wireless mobility summary', desc: 'Mobility group peers' },
      ],
    },
  ],
  'IP Services': [
    {
      label: 'Verification',
      commands: [
        { cmd: 'show ip nat translations', desc: 'Active NAT entries' },
        { cmd: 'show ip nat statistics', desc: 'NAT hit/miss counters' },
        { cmd: 'show ntp status', desc: 'NTP sync state + stratum' },
        { cmd: 'show ntp associations', desc: 'NTP peers + status' },
        { cmd: 'show standby brief', desc: 'HSRP groups + active/standby' },
        { cmd: 'show vrrp brief', desc: 'VRRP groups + state' },
      ],
    },
  ],
}
