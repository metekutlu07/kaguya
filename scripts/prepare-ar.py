"""Build AR-only scaled USDZ packages without altering the source models."""
from pathlib import Path
import struct
import tempfile
import zipfile
from pxr import Usd, UsdGeom, Gf

ASSETS = Path(__file__).resolve().parent.parent / "assets" / "composition"
SCALE = 0.3
MODELS = ("blanket", "box", "cowrie", "gamer", "light-stick")


def write_aligned(package, name, payload):
    # USDZ members must be uncompressed and start on a 64-byte boundary.
    info = zipfile.ZipInfo(name)
    offset = package.fp.tell() + 30 + len(name.encode("utf-8"))
    padding = (-offset - 4) % 64
    info.extra = struct.pack("<HH", 0x1986, padding) + bytes(padding)
    package.writestr(info, payload, compress_type=zipfile.ZIP_STORED)


for model in MODELS:
    source = ASSETS / f"{model}-small.usdz"
    target = ASSETS / f"{model}-ar-table.usdz"
    # Preserve the original single binary root layer for Apple Quick Look.
    with tempfile.TemporaryDirectory() as temp, zipfile.ZipFile(source) as original:
        root_layer = Path(temp) / "model.usdc"
        if original.namelist()[0] != root_layer.name:
            raise ValueError(f"Unexpected USDZ root layer: {source}")
        root_layer.write_bytes(original.read(root_layer.name))
        stage = Usd.Stage.Open(str(root_layer))
        root = UsdGeom.Xformable(stage.GetDefaultPrim())
        if not root or root.GetOrderedXformOps():
            raise ValueError(f"Unexpected USDZ root transform: {source}")
        root.AddScaleOp(UsdGeom.XformOp.PrecisionDouble, "arTable").Set(Gf.Vec3d(SCALE))
        stage.GetRootLayer().Save()
        with zipfile.ZipFile(target, "w") as output:
            for name in original.namelist():
                payload = root_layer.read_bytes() if name == root_layer.name else original.read(name)
                write_aligned(output, name, payload)
    print(f"Built {target.name} at {SCALE:.0%} scale")
