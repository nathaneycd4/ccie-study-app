"""Anthropic Claude streaming service."""
import os
from typing import AsyncIterator
import anthropic
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are an expert CCIE Enterprise Infrastructure mentor with deep expertise in routing protocols (OSPF, BGP, EIGRP), MPLS, Multicast, SD-WAN, Catalyst Center, SD-Access, and network automation. Your student is preparing for the CCIE EI lab exam.

Be concise but thorough. Use real Cisco IOS-XE command examples. Walk through troubleshooting systematically.

When the student asks to create or spin up a lab (e.g. "create an OSPF lab", "spin up a BGP scenario", "give me a lab to practice"), include this JSON on its own line in your response:
{"action": "create_lab", "topic": "ospf", "fault_count": 2}
(adjust topic and fault_count as appropriate)"""


def get_client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])


async def stream_chat(
    messages: list[dict],
    session_id: str,
) -> AsyncIterator[str]:
    """
    Stream Claude response as SSE-compatible chunks.
    Yields text deltas.
    """
    client = get_client()

    with client.messages.stream(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            yield text
