"""CML connection helper."""
import os
import warnings
warnings.filterwarnings("ignore")

from virl2_client import ClientLibrary
from dotenv import load_dotenv

load_dotenv()

def get_client() -> ClientLibrary:
    return ClientLibrary(
        os.environ["CML_HOST"],
        os.environ["CML_USER"],
        os.environ["CML_PASS"],
        ssl_verify=False,
    )
