#!/usr/bin/env python3

import sys, os
import base64

def usage():
	print("genkeys.py <raw_key> <out_file>")
	sys.exit()

if len(sys.argv) != 3:
	usage()

RAW_KEY = open(sys.argv[1], "rb").read()
OUT_PATH = sys.argv[2]

def genkey(raw_key, out_file):
	key_js_template = 'module.exports = new Int32Array(Buffer.from("%s", "base64"));'
	js = key_js_template % (base64.b64encode(raw_key).decode("u8"))
	out_dir = os.path.dirname(out_file)

	if not os.path.exists(out_dir):
		os.makedirs(out_dir)

	with open(out_file, "w") as f:
		f.write(js)

genkey(RAW_KEY, OUT_PATH)
