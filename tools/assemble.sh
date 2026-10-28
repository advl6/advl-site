#!/bin/bash
# out/<concept>/ = shared assets + the concept page
for c in "$@"; do rm -rf out/$c; mkdir -p out/$c; cp -r shared/* out/$c/; cp $c/index.html out/$c/index.html; done
