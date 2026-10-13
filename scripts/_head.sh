# usage: head_html "<Title>" [extra stylesheet hrefs...]
head_html() {
  local title="$1"; shift
  printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>%s · motion-patterns</title>\n<link rel="stylesheet" href="../../tokens.css">\n<link rel="stylesheet" href="../../demo.css">\n' "$title"
  for s in "$@"; do printf '<link rel="stylesheet" href="%s">\n' "$s"; done
  printf '<link rel="stylesheet" href="style.css">\n<script src="../../play.js"></script>\n</head>\n'
}
