#!/usr/bin/env python3
"""Smoke test for the AutoCAD COM bridge -- no MCP, no network.

Run this first. If it does not draw, nothing built on top of it will work.

    python test_draw.py

Expects AutoCAD to be running with a drawing open (it will start AutoCAD and
create a drawing if not, which takes a while the first time).
"""

import sys
import traceback

from acad import AcadError, bridge, deg2rad, doubles, flatten_points, point


def step(label, fn):
    """Run one drawing step and report what happened."""
    try:
        result = bridge.run(fn)
    except AcadError as exc:
        print(f"  [FAIL] {label}\n         {exc}")
        return None
    except Exception as exc:  # noqa: BLE001
        print(f"  [FAIL] {label}\n         unexpected {type(exc).__name__}: {exc}")
        traceback.print_exc()
        return None
    print(f"  [ ok ] {label}" + (f"  -> {result}" if result else ""))
    return result


def main() -> int:
    print("AutoCAD COM bridge smoke test")
    print("-" * 60)

    def _connect(acad):
        app = acad.app
        return f"{app.Name} {app.Version}, drawing '{acad.doc.Name}'"

    if step("connect to AutoCAD", _connect) is None:
        print("\nCannot reach AutoCAD. Start it, open a drawing, and rerun.")
        return 1

    def _layer(acad):
        layer = acad.doc.Layers.Add("MCP-TEST")
        layer.Color = 3  # green
        acad.doc.ActiveLayer = layer
        return "layer MCP-TEST is current"

    step("create + activate a layer", _layer)

    def _rectangle(acad):
        pts = [[0, 0], [100, 0], [100, 60], [0, 60]]
        pl = acad.ms.AddLightWeightPolyline(doubles(flatten_points(pts)))
        pl.Closed = True
        return f"rectangle handle {pl.Handle}"

    rect = step("draw a closed rectangle (VARIANT polyline)", _rectangle)

    def _circle(acad):
        c = acad.ms.AddCircle(point(50, 30), 20.0)
        return f"circle handle {c.Handle}"

    step("draw a circle", _circle)

    def _arc(acad):
        a = acad.ms.AddArc(point(50, 30), 28.0, deg2rad(0), deg2rad(180))
        return f"arc handle {a.Handle}"

    step("draw an arc", _arc)

    def _text(acad):
        t = acad.ms.AddText("MCP TEST", point(10, 70), 6.0)
        return f"text handle {t.Handle}"

    step("add text", _text)

    def _dim(acad):
        d = acad.ms.AddDimRotated(point(0, 0), point(100, 0), point(50, -15), 0.0)
        return f"dimension handle {d.Handle}"

    step("add a linear dimension", _dim)

    def _hatch(acad):
        hatch = acad.ms.AddHatch(0, "ANSI31", True)
        circle = acad.ms.AddCircle(point(150, 30), 15.0)
        from acad import dispatches

        hatch.AppendOuterLoop(dispatches([circle]))
        hatch.Evaluate()
        return f"hatch handle {hatch.Handle}"

    step("hatch a closed boundary (VT_DISPATCH array)", _hatch)

    def _zoom(acad):
        acad.app.ZoomExtents()
        return "zoomed to extents"

    step("zoom extents", _zoom)

    def _count(acad):
        return f"{acad.ms.Count} entities in model space"

    step("count entities", _count)

    if rect:
        def _query(acad):
            from acad import entity_summary

            handle = rect.split()[-1]
            return entity_summary(acad.entity_by_handle(handle))

        step("look the rectangle up by its handle", _query)

    print("-" * 60)
    print("Done. Check the AutoCAD window: you should see a 100x60 rectangle,")
    print("a circle and arc inside it, a text label, a dimension, and a")
    print("hatched circle to the right.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
