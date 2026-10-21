#!/usr/bin/env python3
"""Compare a freshly generated golden file with the committed one, numerically.

Peak times come from a golden-section search, so their last digits vary between numpy/BLAS builds; an exact text
diff is too strict. Fails if any number differs by more than 1e-6 relative, or if the structure differs.

    python3 compare_golden.py NEW.json COMMITTED.json
"""
import json
import sys


def walk(a, b, path, bad):
    if isinstance(a, dict) and isinstance(b, dict):
        if a.keys() != b.keys():
            bad.append(f'{path}: keys differ')
        for k in a.keys() & b.keys():
            walk(a[k], b[k], f'{path}.{k}', bad)
    elif isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            bad.append(f'{path}: length {len(a)} vs {len(b)}')
        for i, (x, y) in enumerate(zip(a, b)):
            walk(x, y, f'{path}[{i}]', bad)
    elif isinstance(a, (int, float)) and isinstance(b, (int, float)):
        if abs(a - b) > 1e-6 * max(abs(a), abs(b), 1e-9):
            bad.append(f'{path}: {a} vs {b}')
    elif a != b:
        bad.append(f'{path}: {a!r} vs {b!r}')


if __name__ == '__main__':
    with open(sys.argv[1]) as f:
        new = json.load(f)
    with open(sys.argv[2]) as f:
        old = json.load(f)
    bad = []
    walk(new, old, '$', bad)
    for line in bad[:20]:
        print(line)
    print(f'{len(bad)} difference(s)' if bad else 'golden file matches the oracle')
    sys.exit(1 if bad else 0)
